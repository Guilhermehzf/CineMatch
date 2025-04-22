// Recupera os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const username = params.get('user');

// Cria a conexão WebSocket
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

// Tratamento de erro caso o usuário não esteja na lista
socket.on('session_error', (err) => {
  console.error('❌ Erro:', err.message);
  alert('Você não tem permissão para acessar essa sessão.');
  window.location.href = 'http://127.0.0.1:5500/front-end/views/entry_lobby.html'; // Redireciona para entry_lobby
});

// Função para carregar filme
async function carregarFilme() {
  const loading = document.getElementById('loading');
  const erro = document.getElementById('erro');
  const conteudo = document.getElementById('conteudo');

  try {
    const resposta = await fetch('http://localhost:3535/movie');

    if (!resposta.ok) {
      throw new Error(`Status: ${resposta.status}`);
    }

    const filme = await resposta.json();

    console.log(filme); // debug

    document.querySelector('.photo-img').src = filme.poster;
    document.querySelector('.photo-img').alt = filme.title;
    document.querySelector('.photo-name-and-age h2').textContent = filme.title;
    document.querySelector('.photo-bio a').href = filme.tmdb_url;
    document.querySelector('.nota').textContent = 'Nota: ' + filme.rating;
    document.querySelector('.year').textContent = filme.year;

    // Mostrar conteúdo, esconder loading
    loading.style.display = 'none';
    conteudo.style.display = 'block';
  } catch (err) {
    console.error('Erro ao carregar o filme:', err);
    loading.style.display = 'none';
    erro.style.display = 'block';
  }
}

// Ações do usuário (like/dislike)
document.getElementById('action_like').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('movie_action', { token, username, action: 'like' });
});

document.getElementById('action_neutral').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('movie_action', { token, username, action: 'neutral' });
});

document.getElementById('action_dislike').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('movie_action', { token, username, action: 'dislike' });
});

document.addEventListener('DOMContentLoaded', () => {
  carregarFilme();
});
