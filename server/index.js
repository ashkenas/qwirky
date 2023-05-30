import { config } from "dotenv";
config();
import express from "express";
import { mountRoutes } from "./routes/index.js";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseApp = initializeApp({
  credential: applicationDefault()
});

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

app.listen(process.env.PORT || 4000, () =>
  console.log('Qwirky online.')
);