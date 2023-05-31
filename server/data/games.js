import { games, users } from "../mongo/collections.js";
import { forceObjectId, StatusError } from "../util.js";
import { generateName } from "./names.js";
import { getUserByUid } from "./users.js";

const fullPieceSet = [];
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
    {
      $push: {
        games: {
          _id: res.insertedId,
          name: name,
          usernames: usernames
        }
      }
    }
  );

  if (!res2.acknowledged || !res2.modifiedCount)
    throw new Error('Failed to add players to game.');

  return { _id: res.insertedId };
};

export const getGames = async uid => {
  const user = await getUserByUid(uid);
  const col = await games();
  const games = await col.aggregate([
    { $match: { _id: { $in: user.games } } },
    { $project: { name: 1, usernames: 1, currentPlayer: 1 } }
  ]).toArray();
  return games;
};
