async function carregarFilme() {
    try {
        // Exemplo de chamada real: const response = await fetch('https://sua-api.com/filme');
        const response = await fetch('http://localhost:8080/movie'); // <-- coloque sua URL real aqui
        const data = await response.json();

        // Preencher os elementos com os dados recebidos
        document.getElementById("photo-img").src = data.poster;
        document.getElementById("photo-title").textContent = data.title;
        document.getElementById("photo-tmdb").href = data.tmdb_url;
        document.getElementById("photo-year-rating").textContent = `${data.year} • Nota: ${data.rating}`;
    } catch (error) {
        console.error("Erro ao carregar o filme:", error);
    }
}

// Chamar função ao carregar a página
window.addEventListener("DOMContentLoaded", carregarFilme);

