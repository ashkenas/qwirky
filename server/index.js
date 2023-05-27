import express from "express";
import { mountRoutes } from "./routes/index.js";

const app = express();
app.use(express.json());
app.use(express.static('./public'));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});
mountRoutes(app);

app.listen(process.env.PORT || 4000, () =>
  console.log('Qwirky online.')
);