import express from "express";
import { StatusError, sync } from "../util.js";
import * as users from "../data/users.js";

const router = express.Router();

router.route('/')
  .get(sync(async (req, res) => {
    res.json(await users.getFriends(req.firebaseId));
  }))
  .post(sync(async (req, res) => {
    if (!req.body.username)
      throw new StatusError(400, 'Must provide a username.');
    await users.makeFriendRequest(
      req.firebaseId,
      req.body.username.trim().toLowerCase(),
      req.dashClients
    );
    res.sendStatus(200);
  }));

router.delete('/:id', sync(async (req, res) => {
  if (!req.params.id)
    throw new StatusError(400, 'Must provide an ID.');
  await users.removeFriend(req.firebaseId, req.params.id, req.dashClients);
  res.sendStatus(200);
}));

router.post('/accept/:id', sync(async (req, res) => {
  if (!req.params.id)
    throw new StatusError(400, 'Must provide an ID.');
  await users.acceptFriendRequest(
    req.firebaseId,
    req.params.id,
    req.dashClients
  );
  res.sendStatus(200);
}));

router.post('/decline/:id', sync(async (req, res) => {
  if (!req.params.id)
    throw new StatusError(400, 'Must provide an ID.');
  await users.declineFriendRequest(req.firebaseId, req.params.id);
  res.sendStatus(200);
}));

export default router;
