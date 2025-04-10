require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8080;

app.get('/movie', async (req, res) => {
  const title = req.query.title;
  const apiKey = process.env.OMDB_API_KEY;
  const short = req.query.short;

  if (!title) {
    return res.status(400).json({ error: "Parâmetro 'title' é obrigatório." });
  }

  try {
    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: apiKey,
        t: title,
        plot: short
      }
    });

    const data = response.data

    if (data.Response === "False") {
      return res.status(404).json({ error: data.Error });
    }

    // Busca a nota do Rotten Tomatoes
    let rotten = "N/A";
    if (data.Ratings) {
      const rt = data.Ratings.find(r => r.Source === "Rotten Tomatoes");
      if (rt) rotten = rt.Value;
    }

    res.json({
      title: data.Title,
      year: data.Year,
      genres: data.Genre.split(',').map(g => g.trim()),
      rottenTomatoes: rotten
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao buscar dados do filme.' });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
