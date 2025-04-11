async function carregarFilme() {
    try {
        const resposta = await fetch('http://localhost:8888/movie');
        const filme = await resposta.json();
    
        console.log(filme); // debug
    
        document.querySelector('.photo-img').src = filme.poster;
        document.querySelector('.photo-img').alt = filme.title;
        document.querySelector('.photo-name-and-age h2').textContent = filme.title;
        document.querySelector('.photo-bio a').href = filme.tmdb_url;
        document.querySelector('.photo-bio').innerHTML += `
        <span>${filme.year}</span> <span style="margin-left: 10px">${filme.rating}</span>`;
    } catch (erro) {
        console.error('Erro ao carregar o filme:', erro);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    carregarFilme();
  });