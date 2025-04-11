const express = require('express');
const get_movies = require('./src/get_movies');
const { connectToDatabase, createMongoStore } = require('./db');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 8080;

/*const corsOptions = {
  origin: 'localhost', // Permite somente o frontend em localhost:80
  methods: ['GET', 'POST'], // Permite métodos GET e POST
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite cabeçalhos específicos
};*/

/*Use o middleware CORS
app.use(cors(corsOptions));*/

app.use(express.json());

/*app.use(
  session({
    secret: '123456789',
    resave: false,
    saveUninitialized: false,
    store: createMongoStore(),
    cookie: { secure: false, maxAge: 5 * 60 * 60 * 1000 }, // secure=true para HTTPS
  })
);*/

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
app.use('/',get_movies);


app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor da API rodando em http://localhost:${port}`);
});