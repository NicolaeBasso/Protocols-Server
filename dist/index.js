"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const random_1 = require("./utils/random");
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const httpPort = 4000;
const wsPort = 4001;
let broadcaster;
const expressApp = (0, express_1.default)();
expressApp.use((0, cors_1.default)());
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
    res.status(200).send({ randomNumber: (0, random_1.generateRandomNumber)() });
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
        }
        else {
            ws.send(data.toString() + ' => WS httpServer response');
        }
    });
});
const io = require('socket.io')(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
io.use((0, cors_1.default)());
expressApp.use(express_1.default.static(__dirname + '/public'));
io.sockets.on('error', (e) => console.log(e));
io.sockets.on('connection', (socket) => {
    socket.on('broadcaster', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcaster');
    });
    socket.on('watcher', () => {
        socket.to(broadcaster).emit('watcher', socket.id);
    });
    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
    });
    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
    });
    socket.on('candidate', (id, message) => {
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
//# sourceMappingURL=index.js.map