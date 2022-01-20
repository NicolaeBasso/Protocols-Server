import express from 'express';
import cors from 'cors';
import { generateRandomNumber } from './utils/random';
import * as http from 'http';
import * as WebSocket from 'ws';

const httpPort = 4000;
const wsPort = 4001;
let broadcaster: any;

const expressApp = express();
expressApp.use(cors());

expressApp.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const httpServer = http.createServer(expressApp);
const wss = new WebSocket.Server({ server: httpServer });

expressApp.get('/', (_, res) => {
  res.status(200).send('Server is up!');
});

expressApp.get('/random', (_, res) => {
  console.log(`/random requested at ${new Date(Date.now())}`);
  res.status(200).send({ randomNumber: generateRandomNumber() });
});

wss.on('connection', function connection(ws) {
  console.log('WebSockets connection established');

  ws.on('message', function message(data, isBinary) {
    console.log(data.toString());
    const messageDecoded = data.toString();

    if (messageDecoded.includes('broadcast:')) {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(`${data} => WS broadcast message!`, { binary: isBinary });
        }
      });
    } else {
      ws.send(data.toString() + ' => WS httpServer response');
    }
  });
});

const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  });
io.use(cors());
expressApp.use(express.static(__dirname + '/public'));

io.sockets.on('error', (e: Event) => console.log(e));
io.sockets.on('connection', (socket: any) => {
  socket.on('broadcaster', () => {
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', () => {
    socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('offer', (id: any, message: any) => {
    socket.to(id).emit('offer', socket.id, message);
  });
  socket.on('answer', (id: any, message: any) => {
    socket.to(id).emit('answer', socket.id, message);
  });
  socket.on('candidate', (id: any, message: any) => {
    socket.to(id).emit('candidate', socket.id, message);
  });
  socket.on('disconnect', () => {
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });
});

expressApp.listen(httpPort, () => console.log(`HTTP listening on port ${httpPort}`));
httpServer.listen(wsPort, () => {
  console.log(`WS listening on port ${wsPort}`);
});
