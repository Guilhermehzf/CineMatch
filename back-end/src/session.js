const express = require('express');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const collectionName = process.env.session_table;

// GET: cria sessão com usuário
router.get('/get_session', (req, res) => {
  const sessionToken = uuidv4();

  const user = req.body.user || req.user;

  if (!user) {
    return res.status(400).json({ error: 'Usuário não fornecido.' });
  }

  req.session.lobby = {
    users: { "1": user },
    token: sessionToken
  };

  res.json({
    session_token: sessionToken,
    message: 'Sessão iniciada com sucesso!'
  });
});

// POST: recebe user e token via JSON
router.post('/post_session', async (req, res) => {
  const { user, token } = req.body;

  if (!user || !token) {
    return res.status(400).json({ error: 'User ou token ausente.' });
  }


  const sessionDoc = await req.db.collection(collectionName).findOne({
    session: { $regex: `"token":"${token}"` }
  });

  if (!sessionDoc) {
    return res.status(404).json({ error: 'Sessão não encontrada.' });
  }


  const sessionObj = JSON.parse(sessionDoc.session);

  if (!sessionObj.lobby) {
    sessionObj.lobby = { users: {}, token };
  }

  const nextId = Object.keys(sessionObj.lobby.users).length + 1;


  sessionObj.lobby.users[nextId.toString()] = user;

  await req.db.collection(collectionName).updateOne(
    { _id: sessionDoc._id },
    { $set: { session: JSON.stringify(sessionObj) } }
  );

  res.json({
    message: 'Usuário adicionado à sessão com sucesso.',
    session: sessionObj
  });
});

module.exports = router;
