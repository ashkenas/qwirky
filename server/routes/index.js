import { resolve } from "path";

export const mountRoutes = app => {
  app.get('*', (_req, res) =>
    res.sendFile(resolve('./public/index.html'))
  );
  app.use('*', (_req, res) => res.status(404).json({ error: 'Not Found' }));
};
