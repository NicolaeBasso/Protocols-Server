import express from 'express';
import cors from 'cors';
import { generateRandomNumber } from './utils/random';
import * as http from 'http';
import * as WebSocket from 'ws';

const httpPort = 4000;
const wsPort = 4001;

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (_, res) => {
  res.status(200).send('Server is up!');
});

app.get('/random', (_, res) => {
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
      ws.send(data.toString() + ' => WS server response');
    }
  });
});

app.listen(httpPort, () => console.log(`HTTP server started on port ${httpPort}`));
server.listen(wsPort, () => {
  console.log(`WS server started on port ${wsPort}`);
});
