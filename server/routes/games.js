import express from "express";
import { StatusError, sync } from "../util.js";
import * as games from "../data/games.js";
import * as users from "../data/users.js";

const router = express.Router();

router.route('/')
  .post(sync(async (req, res) => {
    if (!req.body.players)
      throw new StatusError(400, 'Must provide game players.');
    if (typeof req.body.players !== 'object' || !Array.isArray(req.body.players))
      throw new StatusError(400, 'Players must be a valid array.');
    if (req.body.players.length < 1 || req.body.players.length > 3)
      throw new StatusError(400, 'There must be 1 to 3 other players.');

    const initiator = await users.getUserByUid(req.firebaseId);
    res.json(await games.createGame([...req.body.players, initiator._id]));
  }))
  .get(sync(async (req, res) => {
    res.json(await games.getGames(req.firebaseId));
  }))

export default router;
