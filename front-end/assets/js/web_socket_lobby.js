// Recupera os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const username = params.get('user');

const socket = io('ws://localhost:3535', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Conectado:', socket.id);

  // Envia os dados da sessão e usuário
  socket.emit('join_session', {
    token,
    username
  });
});

// Evento de erro de sessão
socket.on('session_error', (err) => {
  console.error('❌ Erro:', err.message);
  window.location.href = `http://127.0.0.1:5500/front-end/views/home.html`;
});

// Desconexão do WebSocket
socket.on('disconnect', () => {
  console.log('⚠️ Desconectado do servidor');
  window.location.href = `http://127.0.0.1:5500/front-end/views/home.html`;
});

socket.on('session_users', (data) => {
  console.log('👥 Lista atualizada de usuários:', data.users);
  document.querySelector('h3').textContent = token;

  const userList = document.getElementById('user-list');
  userList.innerHTML = ''; // Limpa a lista antes de atualizar

  data.users.forEach((user, index) => {
    const li = document.createElement('li');
    li.textContent = user;
    li.title = user;

    // Aplica estilo especial para o primeiro usuário
    if (index === 0) {
      li.style.backgroundColor = '#FDD700'; // amarelo claro
    }

    userList.appendChild(li);
  });
});

// Evento para redirecionar todos os usuários para o like.html
document.getElementById('Start_lobby').addEventListener('submit', (event) => {
  event.preventDefault();
  console.log(token);
  socket.emit('start_session', { token });
});

// Mudança: Redireciona para like.html assim que a sessão for iniciada
socket.on('redirect_to_like', () => {
  window.location.href = `http://127.0.0.1:5500/front-end/views/like.html?token=${token}&user=${username}`;
});