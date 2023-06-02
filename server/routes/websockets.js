import { getGame, makeMove } from "../data/games.js";

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
    const [, fx, fy] = data.placed[0];
    let sameX = true, sameY = true;
    if (!game.board) game.board = {};
    for (const [val, x, y] of data.placed) {
      const pIdx = hand.indexOf(val);
      if (pIdx === -1)
        throw new Error('Invalid move. You played a piece you do not have.');
      hand.splice(pIdx, 1);
      sameX &&= x === fx;
      sameY &&= y === fy;

      for (const dirs of [[[1, 0], [-1, 0]], [[0, 1], [0, -1]]]) {
        let sameA = true, sameB = true;
        for (const [dirX, dirY] of dirs) {
          let curX = x + dirX, curY = y + dirY;
          let current = game.board[curX]?.[curY];
          while (current) {
            if (current === val)
              throw new Error('Invalid move. Duplicate piece in row or column.');
            sameA &&= (current & 0xF) === (val & 0xF);
            sameB &&= (current & 0xF0) === (val & 0xF0);
            curX += dirX;
            curY += dirY;
            current = game.board[curX]?.[curY];
          }
        }
        if (!sameA && !sameB)
          throw new Error('Invalid move. Pieces must match in color or symbol.');
      }

      if (!game.board[x])
        game.board[x] = {};
      game.board[x][y] = val;
    }
    if (!sameX && !sameY)
      throw new Error('Invalid move. Pieces must be in same row or column.');

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
