import express from "express";
import { StatusError, sync } from "../util.js";
import * as users from "../data/users.js";

const router = express.Router();

router.get('/', sync(async (req, res) => {
  res.json(await users.getFriends(req.firebaseId));
}));

router.route('/:id')
  .post(sync(async (req, res) => {
    if (!req.params.id)
      throw new StatusError(400, 'Must provide a username.');
    await users.makeFriendRequest(req.firebaseId, req.params.id.trim());
    res.sendStatus(200);
  }))
  .delete(sync(async (req, res) => {
    if (!req.params.id)
      throw new StatusError(400, 'Must provide an ID.');
    await users.removeFriend(req.firebaseId, req.params.id);
    res.sendStatus(200);
  }));

router.post('/accept/:id', sync(async (req, res) => {
  if (!req.params.id)
    throw new StatusError(400, 'Must provide an ID.');
  await users.acceptFriendRequest(req.firebaseId, req.params.id);
  res.sendStatus(200);
}));

export default router;
