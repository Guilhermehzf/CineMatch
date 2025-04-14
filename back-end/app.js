const express = require('express');
const { connectToDatabase, createMongoStore } = require('./db');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');

const get_movies = require('./src/get_movies');
const sessions = require('./src/session');

const app = express();
const server = http.createServer(app); // necessário para socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

const port = 3535;

/*const corsOptions = {
  origin: 'localhost', // Permite somente o frontend em localhost:80
  methods: ['GET', 'POST'], // Permite métodos GET e POST
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
};*/

//Use o middleware CORS
app.use(cors());

app.use(express.json());

app.use(
  session({
    secret: '123456789',
    resave: false,
    saveUninitialized: false,
    store: createMongoStore(),
    cookie: { secure: false, maxAge: 15 * 60 * 1000 },
  })
);

app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Erro interno ao conectar ao banco de dados' });
  }
});


/* Middleware de autenticação
function verificaAutenticacao(req, res, next) {
  if (req.session.user.token) {
    return next(); // Usuário autenticado, prossiga para a rota
  }
  req.session.returnTo = req.originalUrl; // Armazena a rota que o usuário tentou acessar
  res.redirect('/login'); // Redireciona para a página de login
}*/

//Rotas
//app.use('/', homeRoutes);
app.use('/', get_movies);
app.use('/', sessions);

// Mapa de sessões para sockets conectados
const sessionSockets = new Map();

io.on('connection', (socket) => {
  console.log('🟢 Novo cliente conectado via WebSocket');

  socket.on('join_session', async ({ token }) => {
    if (!token) return;

    const db = await connectToDatabase();
    const collection = db.collection(process.env.session_table);
    const sessionDoc = await collection.findOne({
      session: { $regex: `"token":"${token}"` }
    });

    if (!sessionDoc) {
      socket.emit('session_error', { message: 'Sessão não encontrada.' });
      return;
    }

    const sessionObj = JSON.parse(sessionDoc.session);

    socket.join(token); // adiciona à "sala" da sessão no WebSocket

    // Armazena sockets conectados
    if (!sessionSockets.has(token)) {
      sessionSockets.set(token, new Set());
    }
    sessionSockets.get(token).add(socket);

    // Envia lista de usuários para todos na sala
    const users = Object.values(sessionObj.lobby.users);
    io.to(token).emit('session_users', { users });
  });

  socket.on('disconnect', () => {
    for (const [token, sockets] of sessionSockets) {
      sockets.delete(socket);
      if (sockets.size === 0) {
        sessionSockets.delete(token);
      }
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor da API rodando em http://localhost:${port}`);
});