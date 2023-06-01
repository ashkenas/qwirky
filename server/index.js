import { config } from "dotenv";
config();
import express from "express";
import { mountRoutes } from "./routes/index.js";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { WebSocketServer } from "ws";
import * as users from "./data/users.js";
import { gameMessage } from "./routes/websockets.js";

const firebaseApp = initializeApp({
  credential: applicationDefault()
});

const gameClients = new Map();

const app = express();
app.use(express.json());
app.use(express.static('./public'));
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      const { uid } = await getAuth(firebaseApp).verifyIdToken(token, true);
      if (uid) {
        req.firebaseId = uid;
        return next();
      }
      res.status(500).json({ error: 'Unable to verify identity. Please try again.' });
    } catch (e) {
      console.error(e);
      res.status(401).json({ error: 'Unauthenticated. Bad token provided.' });
    }
  } else {
    res.status(401).json({ error: 'Unauthenticated. Provide token.' });
  }
});
mountRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});

const server = app.listen(process.env.PORT || 4000, () =>
  console.log('Qwirky online.')
);

const wss = new WebSocketServer({ noServer: true });

// WebSocket hell
server.on('upgrade', async (req, socket, head) => {
  const token = req.headers['sec-websocket-protocol'];
  let uid;

  if (token) {
    try {
      const { uid: uidResult } = await getAuth(firebaseApp).verifyIdToken(token, true);
      if (!uidResult) {
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
        return;
      }
      uid = uidResult;
    } catch (e) {
      console.error(e);
      socket.write('HTTP/1.1 401 Unauthenticated\r\n\r\n');
      socket.destroy();
      return;
    }
  } else {
    socket.write('HTTP/1.1 401 Unauthenticated\r\n\r\n');
    socket.destroy();
    return;
  }

  // At this point we are authenticated. Authorize.
  const match = (/^\/game\/([0-9a-f]{24})\/?$/i).exec(req.url);
  if (!match) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  const gameId = match[1];
  try {
    const user = await users.getUserByUid(uid);
    if (!user.games.find(g => g._id.equals(gameId))) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }

    // We are authorized by process of elimination, proceed
    wss.handleUpgrade(req, socket, head, ws => {
      ws.id = user._id;
      req.game = gameId;
      wss.emit('connection', ws, req);
    });
  } catch (e) {
    console.error(e);
    socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
    socket.destroy();
    return;
  }
});

wss.on('connection', (ws, req) => {
  if (!gameClients.get(req.game)) {
    gameClients.set(req.game, {
      [ws.id]: ws
    });
  } else {
    gameClients.get(req.game)[ws.id] = ws;
  }

  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', gameMessage(req.game, ws.id, gameClients.get(req.game)));

  ws.on('close', () => {
    delete gameClients.get(req.game)[ws.id];
  });
});

const cleanupInterval = setInterval(() => {
  wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
  })
}, 30000);

wss.on('clone', () => clearInterval(cleanupInterval));
