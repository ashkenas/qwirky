import { getGame, makeMove, makeTrade } from "../data/games.js";

const handler = f => function(data) {
  f(JSON.parse(data)).catch((e) => (console.error(e),this.send(
    JSON.stringify({
      type: 'error',
      error: e.message || 'Internal Server Error'
    })
  )));
};

export const gameMessage = (gameId, senderId, players) => handler(async data => {
  const game = await getGame(gameId);
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
    let sameX = true, sameY = true;
    if (!game.board) game.board = {};
    for (const [val, x, y] of data.placed) {
      const pIdx = hand.indexOf(val);
      if (pIdx === -1)
        throw new Error('Invalid move. You played a tile you do not have.');
      hand.splice(pIdx, 1);

      if (game.board[x]?.[y])
        throw new Error('Invalid move. Cannot place a tile in an occupied space.');

      sameX &&= x === fx;
      sameY &&= y === fy;

      for (const dirs of [[[1, 0], [-1, 0]], [[0, 1], [0, -1]]]) {
        let sameA = true, sameB = true;
        for (const [dirX, dirY] of dirs) {
          let curX = x + dirX, curY = y + dirY;
          let current = game.board[curX]?.[curY];
          while (current) {
            if (current === val)
              throw new Error('Invalid move. Duplicate tile in row or column.');
            sameA &&= (current & 0xF) === (val & 0xF);
            sameB &&= (current & 0xF0) === (val & 0xF0);
            curX += dirX;
            curY += dirY;
            current = game.board[curX]?.[curY];
          }
        }
        if (!sameA && !sameB)
          throw new Error('Invalid move. Tiles must match in color or symbol.');
      }

      if (!game.board[x])
        game.board[x] = {};
      game.board[x][y] = val;
    }
    if (!sameX && !sameY)
      throw new Error('Invalid move. Tiles must be in same row or column.');

    const newState = await makeMove(gameId, data.placed);
    for (const player in players) {
      const payload = {
        type: 'move',
        placed: data.placed,
        yourTurn: newState.players[newState.currentPlayer].equals(player)
      };

      if (senderId.equals(player))
        payload.hand = newState.hands[idx];

      players[player].send(JSON.stringify(payload));
    }
  } else if (data.type === 'trade') {
    if (!data.pieces) throw new Error('Must provide tiles to trade.');
    if (typeof data.pieces !== 'object' || !Array.isArray(data.pieces))
      throw new Error('Pieces property must be an array of tile values.');
    if (data.pieces.length < 1)
      throw new Error('Must provide at least one tile to trade.');
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
        yourTurn: newState.players[newState.currentPlayer].equals(player)
      };

      if (senderId.equals(player))
        payload.hand = newState.hands[idx];

      players[player].send(JSON.stringify(payload));
    }
  }
});

export async function gameInitialize(ws, gameId, senderId) {
  const game = await getGame(gameId);
  const idx = game.players.findIndex(id => id.equals(senderId));
  ws.send(JSON.stringify({
    type: 'initialize',
    board: game.board,
    currentPlayer: game.currentPlayer,
    hand: game.hands[idx],
    players: game.usernames,
    yourTurn: idx === game.currentPlayer
  }));
};
