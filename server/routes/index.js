import { resolve } from "path";
import * as users from "../data/users.js";
import * as games from "../data/games.js";
import { sync, validateUsername } from "../util.js";
import friendsRoutes from "./friends.js";
import gamesRoutes from "./games.js";

export const mountRoutes = app => {
  app.use('/api/friends', friendsRoutes);
  app.use('/api/games', gamesRoutes);
  app.get('/api/profile', sync (async (req, res) => {
    const user = await users.getUserByUid(req.firebaseId);
    res.json({
      username: user.username,
      games: await games.getGames(req.firebaseId)
    });
  }));
  app.post('/api/profile/username', sync (async (req, res) => {
    const username = validateUsername(req.body.username);
    await users.changeUsername(req.firebaseId, username);
    res.sendStatus(200);
  }));
  app.get('*', (_req, res) =>
    res.sendFile(resolve('./public/index.html'))
  );
  app.use('*', (_req, res) => res.status(404).json({ error: 'Not Found' }));
};
