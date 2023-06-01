import { games, users } from "../mongo/collections.js";
import { forceObjectId, StatusError } from "../util.js";
import { generateName } from "./names.js";
import { getUserByUid } from "./users.js";

const fullPieceSet = [];
for (let k = 0; k < 3; k++)
  for (let i = 1; i <= 6; i++)
    for (let j = 0x10; j <= 0x60; j += 0x10)
      fullPieceSet.push(i | j);

// Durstenfeld's Fisher-Yates Shuffle
const shuffle = array => {
  for (let i = array.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createGame = async players => {
  if (typeof players !== 'object' || !Array.isArray(players))
    throw new StatusError(400, 'Must provide an array of players.');
  if (players.length > 4 || players.length < 2)
    throw new StatusError(400, 'There must be 2 to 4 players.');
  players = players.map(forceObjectId);

  const col = await games();
  const usersCol = await users();

  const name = generateName();
  const pieces = shuffle([...fullPieceSet]);
  const hands = players.map(() => pieces.splice(0, 6));
  const firstPlayer = hands.reduce(([oldMaxRank, maxI], hand, i) => {
    let maxRank = 0;
    const ranks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    hand.forEach(piece => {
      const a = ++ranks[(piece >> 4) - 1];
      if (a > maxRank) maxRank = a;
      const b = ++ranks[(piece & 0xF) + 5];
      if (b > maxRank) maxRank = b;
    });
    if (maxRank > oldMaxRank) return [maxRank, i];
    return [oldMaxRank, maxI];
  }, [0, -1])[1];

  let usernames = (await usersCol.aggregate([
    { $match: { _id: { $in: players } } },
    { $project: { username: 1 } }
  ]).toArray());
  for (let i = 0; i < usernames.length;) {
    if (usernames[i].idx !== undefined) {
      i++;
    } else {
      const j = usernames[i].idx = players.findIndex(id =>
        id.equals(usernames[i]._id)
      );
      [usernames[i], usernames[j]] = [usernames[j], usernames[i]];
    }
  }
  usernames = usernames.map(user => user.username);

  const res = await col.insertOne({
    board: {},
    name: name,
    pieces: pieces,
    players: players,
    usernames: usernames,
    hands: hands,
    currentPlayer: firstPlayer
  });

  if (!res.acknowledged || !res.insertedId)
    throw new Error('Failed to create new games.');

  const res2 = await usersCol.updateMany(
    { _id: { $in: players } },
    { $push: { games: res.insertedId } }
  );

  if (!res2.acknowledged || !res2.modifiedCount)
    throw new Error('Failed to add players to game.');

  return { _id: res.insertedId };
};

export const getGames = async uid => {
  const user = await getUserByUid(uid);
  const col = await games();
  const gamesResults = await col.aggregate([
    { $match: { _id: { $in: user.games } } },
    { $project: { name: 1, usernames: 1, currentPlayer: 1 } }
  ]).toArray();
  return gamesResults;
};

export const getGame = async id => {
  id = forceObjectId(id);
  const col = await games();
  const game = await col.findOne({ _id: id });
  return game;
};

export const makeMove = async (id, placed) => {
  id = forceObjectId;
  const game = await getGame(id);

  const hand = [...game.hands[game.currentPlayer]];
  for (const [val, x, y] of placed) {
    hand.splice(hand.indexOf(val), 1);
    if (!game.board[x])
      game.board[x] = {};
    game.board[x][y] = val;
  }
  const draw = game.pieces.splice(0, placed.length);
  game.hands[game.currentPlayer] = hand.concat(draw);

  const col = await games();
  const res = await col.updateOne(
    { _id: id },
    {
      $set: {
        board: game.board,
        currentPlayer: (game.currentPlayer + 1) % game.players.length,
        pieces: game.pieces,
        hands: game.hands
      }
    }
  );
  if (!res.acknowledged || !res.modifiedCount)
    throw new Error('Failed to submit move.');

  return await getGame(id);
}
