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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.get('/', (_, res) => {
    res.status(200).send('Server is up!');
});
app.get('/random', (_, res) => {
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
            ws.send(data.toString() + ' => WS server response');
        }
    });
});
app.listen(httpPort, () => console.log(`HTTP server started on port ${httpPort}`));
server.listen(wsPort, () => {
    console.log(`WS server started on port ${wsPort}`);
});
//# sourceMappingURL=index.js.map