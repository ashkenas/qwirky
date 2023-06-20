import { getGame, makeMove, makeTrade } from "../data/games.js";

const boardTraversal = [[[[1, 0], [-1, 0]], 'x'], [[[0, 1], [0, -1]], 'y']];

const handler = f => function(data) {
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    this.send(JSON.stringify({
      type: 'error',
      error: 'Malformed data encountered, bad request.'
    }));
    return;
  }
  f(JSON.parse(data)).catch((e) => this.send(
    JSON.stringify({
      type: 'error',
      error: e.message || 'Internal Server Error'
    })
  ));
};

export const gameMessage = (gameId, senderId, players) => handler(async data => {
  const game = await getGame(gameId);
  if (game.over)
    throw new Error('Game is over.');
  const idx = game.players.findIndex(id => id.equals(senderId));
  if (idx !== game.currentPlayer)
    throw new Error('It is not your turn.');
  const hand = [...game.hands[idx]];
  if (data.type === 'move') {
    // Data validation, oh joy
    if (!data.placed) throw new Error('Must provide placed tiles.');
    if (typeof data.placed !== 'object' || !Array.isArray(data.placed))
      throw new Error('Placed property must be an array of tile placements.');
    if (data.placed.length < 1)
      throw new Error('Must play at least one piece.');
    for (const placement of data.placed) {
      if (typeof placement !== 'object' || !Array.isArray(placement))
        throw new Error('Invalid placement encountered. (1)');
      if (placement.length !== 3)
        throw new Error('Invalid placement encountered. (2)');
      for (const val of placement) {
        if (typeof val !== 'number' || isNaN(val) || Math.floor(val) !== val)
          throw new Error('Invalid placement encountered. (3)');
      }
      const a = placement[0] & 0xF;
      const b = (placement[0] >> 4) & 0xF;
      if (a < 1 || a > 6 || b < 1 || b > 6)
        throw new Error('Invalid placement encountered. (4)');
    }

    // Data is valid, continue
    const [, fx, fy] = data.placed[0];
    let firstMove = false;
    if (!game.board) {
      firstMove = true;
      game.board = {};
    }
    const scores = { x: {}, y: {} };
    
    let sameX = true, sameY = true;
    let minX = fx, minY = fy, maxX = fx, maxY = fy;
    for (const [val, x, y] of data.placed) {
      const pIdx = hand.indexOf(val);
      if (pIdx === -1)
        throw new Error('Invalid move. You played a tile you do not have.');
      hand.splice(pIdx, 1);

      if (game.board[x]?.[y])
        throw new Error('Invalid move. Cannot place a tile in an occupied space.');

      if (!game.board[x])
        game.board[x] = {};
      game.board[x][y] = val;

      sameX &&= x === fx;
      sameY &&= y === fy;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!sameX && !sameY)
      throw new Error('Invalid move. Tiles must be in the same line.');
    if (sameX)
      for (let i = minY; i <= maxY; i++)
        if (!game.board[fx][i])
          throw new Error('Invalid move. Tiles must be in the same line.');
    if (sameY)
      for (let i = minX; i <= maxX; i++)
        if (!game.board[i]?.[fy])
          throw new Error('Invalid move. Tiles must be in the same line.');

    for (const [val, x, y] of data.placed) {
      for (const [dirs, axis] of boardTraversal) {
        let sameA = true, sameB = true;
        const seen = new Set();
        seen.add(val);
        for (const [dirX, dirY] of dirs) {
          let curX = x + dirX, curY = y + dirY;
          let current = game.board[curX]?.[curY];
          while (current) {
            if (seen.has(current))
              throw new Error('Invalid move. Duplicate tile in row or column.');
            seen.add(current);
            sameA &&= (current & 0xF) === (val & 0xF);
            sameB &&= (current & 0xF0) === (val & 0xF0);
            curX += dirX;
            curY += dirY;
            current = game.board[curX]?.[curY];
          }
        }
        if (!sameA && !sameB)
          throw new Error('Invalid move. Tiles must match in color or symbol.');

        if (seen.size > 1)
          scores[axis][axis === 'x' ? y : x] = seen.size === 6 ? 12 : seen.size;
      }
    }

    let score = 0;
    if (firstMove && data.placed.length === 1) score = 1;
    else {
      for (const axis in scores)
        for (const coord in scores[axis])
          score += scores[axis][coord];
    }

    const newState = await makeMove(gameId, data.placed, score);
    for (const player in players) {
      const payload = {
        type: 'move',
        placed: data.placed,
        currentPlayer: newState.currentPlayer,
        score: newState.scores[game.currentPlayer],
        yourTurn: newState.players[newState.currentPlayer].equals(player),
        over: newState.over
      };

      if (senderId.equals(player))
        payload.hand = newState.hands[idx];

      players[player].forEach(ws => ws.send(JSON.stringify(payload)));
    }
  } else if (data.type === 'trade') {
    if (game.pieces.length === 0)
      throw new Error('No more tiles, cannot trade.');
    if (!data.pieces) throw new Error('Must provide tiles to trade.');
    if (typeof data.pieces !== 'object' || !Array.isArray(data.pieces))
      throw new Error('Pieces property must be an array of tile values.');
    if (data.pieces.length < 1)
      throw new Error('Must provide at least one tile to trade.');
    if (game.pieces.length < data.pieces.length)
      throw new Error('Not enough tiles left for this trade.');
    for (const val of data.pieces) {
      if (typeof val !== 'number' || isNaN(val) || Math.floor(val) !== val)
        throw new Error(`Invalid tile value encountered: ${val}`);
      const a = val & 0xF;
      const b = (val >> 4) & 0xF;
      if (a < 1 || a > 6 || b < 1 || b > 6)
        throw new Error(`Invalid tile value encountered: ${val}`);

      const idx2 = hand.indexOf(val);
      if (idx2 === -1)
        throw new Error('Cannot trade tile you do not possess.');
      hand.splice(idx2, 1);
    }

    const newState = await makeTrade(gameId, data.pieces);
    for (const player in players) {
      const payload = {
        type: 'move',
        placed: [],
        currentPlayer: newState.currentPlayer,
        yourTurn: newState.players[newState.currentPlayer].equals(player)
      };

      if (senderId.equals(player))
        payload.hand = newState.hands[idx];

      players[player].forEach(ws => ws.send(JSON.stringify(payload)));
    }
  }
});

export async function gameInitialize(ws, gameId, senderId) {
  const game = await getGame(gameId, true);
  const idx = game.players.findIndex(id => id.equals(senderId));
  ws.send(JSON.stringify({
    type: 'initialize',
    board: game.board,
    currentPlayer: game.currentPlayer,
    hand: game.hands[idx],
    players: game.usernames,
    yourTurn: idx === game.currentPlayer,
    scores: game.scores,
    tilesLeft: game.pieces.length,
    over: game.over
  }));
};
