import { config } from "dotenv";
config();
import express from "express";
import { mountRoutes } from "./routes/index.js";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { WebSocketServer } from "ws";
import * as users from "./data/users.js";
import * as websockets from "./routes/websockets.js";
import { logError } from "./data/errors.js";

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
  logError(err, 'Express Error Handler');
});

const server = app.listen(process.env.PORT || 4000, () =>
  console.log('Qwirky online.')
);

const wss = new WebSocketServer({ noServer: true });
const connectionError = (code, error) => {
  return JSON.stringify({
    type: 'connectionError',
    error: error,
    code: code
  });
};

// WebSocket hell
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, async ws => {
    const token = req.headers['sec-websocket-protocol'];
    let uid;

    if (token) {
      try {
        const { uid: uidResult } = await getAuth(firebaseApp).verifyIdToken(token, true);
        if (!uidResult) {
          logError('Failed to decode UID.', 'Websocket Authorization');
          ws.send(connectionError(500, 'Internal Server Error'));
          ws.terminate();
          return;
        }
        uid = uidResult;
      } catch (e) {
        logError(e, 'Token Verification');
        ws.send(connectionError(401, 'Unauthenticated'));
        ws.terminate();
        return;
      }
    } else {
      ws.send(connectionError(401, 'Unauthenticated'));
      ws.terminate();
      return;
    }

    // At this point we are authenticated. Authorize.
    const match = (/^\/game\/([0-9a-f]{24})\/?$/i).exec(req.url);
    if (!match) {
      ws.send(connectionError(404, 'Not Found'));
      ws.terminate();
      return;
    }
    const gameId = req.game = match[1];

    try {
      const user = await users.getUserByUid(uid);
      if (!user.games.find(g => g.equals(gameId))) {
        ws.send(connectionError(404, 'Not Found'));
        ws.terminate();
        return;
      }
      ws.id = user._id;

      // We are authorized by process of elimination, proceed
      wss.emit('connection', ws, req);
    } catch (e) {
      logError(e, 'Websocket User Identification');
      ws.send(connectionError(500, 'Internal Server Error'));
      ws.terminate();
      return;
    }
  });
});

wss.on('connection', (ws, req) => {
  if (!gameClients.get(req.game)) {
    gameClients.set(req.game, {
      [ws.id]: [ws]
    });
  } else {
    const userClients = gameClients.get(req.game)[ws.id];
    if (userClients) userClients.push(ws);
    else gameClients.get(req.game)[ws.id] = [ws];
  }

  ws.on('pong', () => ws.isAlive = true);

  ws.on('message',
    websockets.gameMessage(req.game, ws.id, gameClients.get(req.game)));

  ws.on('close', () => {
    const userClients = gameClients.get(req.game)[ws.id];
    const idx = userClients.indexOf(ws);
    if (idx !== -1)
      userClients.splice(userClients.indexOf(ws), 1);
  });

  websockets.gameInitialize(ws, req.game, ws.id);
});

const cleanupInterval = setInterval(() => {
  wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
  })
}, 30000);

wss.on('close', () => clearInterval(cleanupInterval));
