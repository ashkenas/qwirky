import { createContext, useReducer } from "react";

export const GameContext = createContext({
  board: null,
  yourTurn: false,
  selected: 0,
  hand: [],
  placed: [],
  lastMove: [],
  justMoved: false,
  trading: false,
  toTrade: [],
  players: [],
  currentPlayer: -1,
  scores: [],
  tilesLeft: 0,
  over: false
});

export const GameDispatchContext = createContext(null);

const initialState = {
  board: null,
  yourTurn: false,
  selected: 0,
  hand: [],
  placed: [],
  lastMove: [],
  justMoved: false,
  trading: false,
  toTrade: [],
  players: [],
  currentPlayer: -1,
  scores: [],
  tilesLeft: 0,
  over: false
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameDispatchContext.Provider value={dispatch}>
      <GameContext.Provider value={state}>
        {children}
      </GameContext.Provider>
    </GameDispatchContext.Provider>
  );
};

export const gameReducer = (state, action) => {
  if (action.type === 'initialize') {
    return {
      board: action.board,
      yourTurn: action.yourTurn,
      hand: action.hand,
      selected: 0,
      placed: [],
      lastMove: [],
      justMoved: false,
      trading: false,
      toTrade: [],
      players: action.players,
      currentPlayer: action.currentPlayer,
      scores: action.scores,
      tilesLeft: action.tilesLeft,
      over: action.over
    };
  } else if (action.type === 'move') {
    const newState = {
      ...state,
      yourTurn: action.yourTurn,
      lastMove: action.placed,
      placed: [],
      justMoved: false,
      trading: false,
      toTrade: [],
      currentPlayer: action.currentPlayer,
      tilesLeft: state.tilesLeft - action.placed.length,
      over: action.over
    };

    if (newState.tilesLeft < 0)
      newState.tilesLeft = 0;

    if (!newState.board)
      newState.board = {};

    if (action.hand)
      newState.hand = action.hand;

    if (action.score)
      newState.scores[state.currentPlayer] = action.score;

    for (const [val, x, y] of action.placed) {
      if (!newState.board[x]) newState.board[x] = {};
      newState.board[x][y] = val;
    }

    return newState;
  } else if (action.type === 'placePiece') {
    if (state.trading || state.over) return { ...state };
    const val = state.hand[state.selected];
    const { x, y } = action;
    if (!state.yourTurn || !val || (state.board && state.board[x]?.[y]))
      return { ...state };

    const newState = {
      ...state,
      board: state.board || {},
      selected: Math.min(state.hand.length - 2, state.selected),
      hand: [...state.hand],
      placed: [...state.placed, [val, x, y]]
    };
    newState.hand.splice(state.selected, 1);

    let sameX = true, sameY = true;
    let minX = x, maxX = x, minY = y, maxY = y;
    for (const [, px, py] of state.placed) {
      sameX &&= x === px;
      sameY &&= y === py;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    if (!sameX && !sameY) return { ...state };
    if (sameX)
      for (let i = minY; i <= maxY; i++)
        if (i !== y && !newState.board[x][i])
          return { ...state };
    if (sameY)
      for (let i = minX; i <= maxX; i++)
        if (i !== x && !newState.board[i]?.[y])
          return { ...state };

    for (const dirs of [[[1, 0], [-1, 0]], [[0, 1], [0, -1]]]) {
      let sameA = true, sameB = true;
      const seen = new Set();
      seen.add(val);
      for (const [dirX, dirY] of dirs) {
        let curX = x + dirX, curY = y + dirY;
        let current = newState.board[curX]?.[curY];
        while (current) {
          if (seen.has(current)) return { ...state };
          seen.add(current);
          sameA &&= (current & 0xF) === (val & 0xF);
          sameB &&= (current & 0xF0) === (val & 0xF0);
          curX += dirX;
          curY += dirY;
          current = newState.board[curX]?.[curY];
        }
      }
      if (!sameA && !sameB) return { ...state };
    }

    if (!newState.board[x]) newState.board[x] = { [y]: val };
    else newState.board[x][y] = val;

    return newState;
  } else if (action.type === 'startTrade') {
    if (!state.yourTurn || state.over || !state.tilesLeft)
      return { ...state };
    return { ...state, trading: true };
  } else if (action.type === 'cancelTrade') {
    return { ...state, trading: false, toTrade: [] };
  } else if (action.type === 'pickup') {
    const newState = {
      ...state,
      board: state.board || {},
      hand: [...state.hand, ...state.placed.map(p => p[0])],
      placed: []
    };

    let replaceRoot = false;
    for (const [, x, y] of state.placed) {
      if (x === 0 && y === 0) replaceRoot = true;
      if (newState.board[x]) delete newState.board[x][y];
    }
    if (replaceRoot) newState.board = null;

    return newState;
  } else if (action.type === 'select') {
    if (state.trading) {
      if (state.toTrade.includes(action.x)) {
        return {
          ...state,
          selected: action.x,
          toTrade: state.toTrade.filter(i => i !== action.x)
        };
      } else {
        return {
          ...state,
          selected: action.x,
          toTrade: [...state.toTrade, action.x]
        };
      }
    }
    return { ...state, selected: action.x };
  } else if (action.type === 'endTurn') {
    return {
      ...state,
      yourTurn: false,
      justMoved: true
    };
  } else if (action.type === 'error') {
    alert(action.error);
    if (state.justMoved)
      return gameReducer({ ...state, yourTurn: true }, pickup());
    else return { ...state };
  }
  console.error(`Invalid action '${action && action.type}'.`);
  return { ...state };
};

export const placePiece = (x, y) => ({
  type: 'placePiece',
  x: x,
  y: y
});

export const pickup = () => ({
  type: 'pickup'
});

export const select = (x) => ({
  type: 'select',
  x: x
});

export const endTurn = () => ({
  type: 'endTurn'
});

export const startTrade = () => ({
  type: 'startTrade'
});

export const cancelTrade = () => ({
  type: 'cancelTrade'
});
