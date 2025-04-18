async function carregarFilme() {
    try {
        const resposta = await fetch('http://localhost:3535/');
        const filme = await resposta.json();
    
        console.log(filme); // debug
    
        document.querySelector('.photo-img').src = filme.poster;
        document.querySelector('.photo-img').alt = filme.title;
        document.querySelector('.photo-name-and-age h2').textContent = filme.title;
        document.querySelector('.photo-bio a').href = filme.tmdb_url;
        document.querySelector('.nota').textContent = 'Nota: ' + filme.rating;
        document.querySelector('.year').textContent = filme.year;
    } catch (erro) {
        console.error('Erro ao carregar o filme:', erro);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    carregarFilme();
  });