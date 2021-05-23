import express from 'express';
import path from 'path';
import { Server } from '@overnightjs/core';
import { UserController } from './UserController';
import { CardController } from './CardController';

const userController = new UserController();
const cardController = new CardController();

let server = new Server();

server.app.use(express.static(path.join(__dirname, 'static')));

server.app.use(express.json());
server.app.use(express.urlencoded({ extended: false }));

server.addControllers([userController, cardController]);

server.app.get('/hello', (req, res) => {
  res.send('Helloo00oy');
});

server.app.all('*', (req, res) => {
  console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
  res.status(200).sendFile(path.join(__dirname, 'static/index.html'));
});

server.app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});