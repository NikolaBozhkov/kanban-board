import express from 'express';
import path from 'path';

const server = express();

server.use(express.static(path.join(__dirname, 'static')));

server.use(express.json());
server.use(express.urlencoded());

server.get('/hello', (req, res) => {
  res.send('Helloo00oy');
});

server.all('*', (req, res) => {
  console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
  res.status(200).sendFile(path.join(__dirname, 'static/index.html'));
});

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});