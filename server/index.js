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
const dashClients = new Map();

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
        req.dashClients = dashClients;
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
  if (status === 500) {
    console.error(err);
    logError(err, 'Express Error Handler');
  }
  res.status(status).json({ error: message });
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

    // At this point we are authenticated. Authorize game access.
    const match = (/^\/game\/([0-9a-f]{24})\/?$/i).exec(req.url);
    if (!match) {
      // Not trying to connect to a game, check if dashboard
      if (!(/^\/dash\/?(?:\?|$)?/).test(req.url)) {
        // Not the dashboard either
        ws.send(connectionError(404, 'Not Found'));
        ws.terminate();
        return;
      }

      try {
        const user = await users.getUserByUid(uid);
        const id = user._id.toString();
        
        if (!dashClients.get(id)) dashClients.set(id, [ws]);
        else dashClients.get(id).push(ws);

        ws.on('close', () => {
          const userClients = dashClients.get(id);
          const idx = userClients.indexOf(ws);
          if (idx !== -1) userClients.splice(idx, 1);
        });

        wss.emit('connection', ws, req);
      } catch (e) {
        logError(e, 'Websocket User Identification Dash');
        ws.send(connectionError(500, 'Internal Server Error'));
        ws.terminate();
        return;
      }
    } else {
      req.game = match[1];
  
      try {
        const user = await users.getUserByUid(uid);
        if (!user.games.some(g => g.equals(req.game))) {
          ws.send(connectionError(404, 'Not Found'));
          ws.terminate();
          return;
        }
        ws.id = user._id;

        // We are authorized by process of elimination, proceed
        if (!gameClients.get(req.game)) {
          gameClients.set(req.game, {
            [ws.id]: [ws]
          });
        } else {
          const userClients = gameClients.get(req.game)[ws.id];
          if (userClients) userClients.push(ws);
          else gameClients.get(req.game)[ws.id] = [ws];
        }

        ws.on('close', () => {
          const userClients = gameClients.get(req.game)[ws.id];
          const idx = userClients.indexOf(ws);
          if (idx !== -1) userClients.splice(idx, 1);
        });

        ws.on('message', websockets.gameMessage(
          req.game,
          ws.id,
          gameClients.get(req.game),
          dashClients
        ));
      
        websockets.gameInitialize(ws, req.game, ws.id);
  
        wss.emit('connection', ws, req);
      } catch (e) {
        logError(e, 'Websocket User Identification Game');
        ws.send(connectionError(500, 'Internal Server Error'));
        ws.terminate();
        return;
      }
    }
  });
});

wss.on('connection', (ws, req) => {
  ws.on('pong', () => ws.isAlive = true);
});

const cleanupInterval = setInterval(() => {
  wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
  })
}, 30000);

wss.on('close', () => clearInterval(cleanupInterval));
