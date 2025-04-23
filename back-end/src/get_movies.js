require('dotenv').config();
const express = require('express');
const axios = require('axios');
const https = require('https');
const e = require('express');

const agent = new https.Agent({ family: 4 });
const router = express.Router();

router.get('/movie', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY;
  const { genre, region, year } = req.query;

  try {
    const randomPage = Math.floor(Math.random() * 10) + 1;

    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      httpsAgent: agent,
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        page: randomPage,
        region: region || undefined,
        sort_by: 'popularity.desc'
      }
    });

    let movies = response.data.results;

    let filtered = movies.filter(movie => {
      let matchesGenre = !genre || movie.genre_ids.includes(Number(genre));
      let matchesYear = !year || movie.release_date?.startsWith(year);
      return matchesGenre && matchesYear;
    });

    if (filtered.length === 0) {
      filtered = movies;
    }

    const randomMovie = filtered[Math.floor(Math.random() * filtered.length)];

    const providersResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${randomMovie.id}/watch/providers`,
      {
        httpsAgent: agent,
        params: { api_key: apiKey }
      }
    );

    const providers = providersResponse.data.results?.BR?.flatrate || [];

    let genre_list = [];
    const genres_ids = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
      params: {
        api_key: apiKey,
        language: 'pt-BR'
      }
    });
    for(const element of randomMovie.genre_ids){
      const genero = genres_ids.data.genres.find(g => g.id === element);
      genre_list.push(genero.name);
    }

    res.json({
      title: randomMovie.title,
      poster: `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}`,
      genres: genre_list,
      year: randomMovie.release_date?.split('-')[0] || 'N/A',
      rating: randomMovie.vote_average,
      tmdb_url: `https://www.themoviedb.org/movie/${randomMovie.id}`,
      providers: providers.map(p => ({
        name: p.provider_name,
        logo: `https://image.tmdb.org/t/p/w45${p.logo_path}`
      }))
    });

  } catch (err) {
    console.error('Erro ao buscar filmes:', err.message);
    res.status(500).json({ error: 'Erro interno ao buscar filmes. Tente novamente mais tarde.' });
  }
});

module.exports = router;
