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

    socket.on('session_users', (data) => {
      console.log('👥 Lista atualizada de usuários:', data.users);
      document.querySelector('h3').textContent = token;

      const userList = document.getElementById('user-list');
      userList.innerHTML = ''; // Limpa a lista antes de atualizar

      data.users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
      });
    });

    socket.on('session_error', (err) => {
      console.error('❌ Erro:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Desconectado do servidor');
    });