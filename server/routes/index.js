import { resolve } from "path";
import friends from "./friends.js";

export const mountRoutes = app => {
  app.use('/api/friends', friends);
  app.get('*', (_req, res) =>
    res.sendFile(resolve('./public/index.html'))
  );
  app.use('*', (_req, res) => res.status(404).json({ error: 'Not Found' }));
};
