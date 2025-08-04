const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const scriptsDB = {}; // chave = pasta+id, valor = script

// Salvar script via POST
// Exemplo de corpo JSON: { folder: "minhapasta", id: "abcd1234", content: "print('oi')" }
app.post('/save', (req, res) => {
  const { folder, id, content } = req.body;
  if (!folder || !id || !content) return res.status(400).send('Faltando dados');
  scriptsDB[`${folder}_${id}`] = content;
  res.send('Salvo');
});

// Servir script via GET
app.get('/raw/:folder/:id', (req, res) => {
  const key = `${req.params.folder}_${req.params.id}`;
  const script = scriptsDB[key];
  if (!script) return res.status(404).send('Script não encontrado');
  res.set('Content-Type', 'text/plain');
  res.send(script);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
