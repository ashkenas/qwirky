import { createContext, useReducer } from "react";

export const GameContext = createContext({
  board: null,
  map: new Map(),
  turn: true,
  selected: 0,
  pieces: []
});

export const GameDispatchContext = createContext(null);

export function GameProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  );
};

export const gameReducer = (state, action) => {
  if (action.type === 'placePiece') {
    const val = state.pieces[state.selected];
    const { x, y } = action;
    if (!state.turn || !val || state.map.get(x)?.get(y))
      return { ...state };

    const newState = {
      ...state,
      selected: 0,
      pieces: [...state.pieces]
    };
    newState.pieces.splice(state.selected, 1);

    const left = newState.map.get(x - 1)?.get(y);
    const right = newState.map.get(x + 1)?.get(y);
    const up = newState.map.get(x)?.get(y + 1);
    const down = newState.map.get(x)?.get(y - 1);

    const piece = {
      val: val,
      canRemove: true,
      left: left,
      right: right,
      up: up,
      down: down
    };

    if (left) left.right = piece;
    if (right) right.left = piece;
    if (up) up.down = piece;
    if (down) down.up = piece;

    const col = newState.map.get(x) || new Map();
    col.set(y, piece);
    newState.map.set(x, col);

    return newState;
  } else if (action.type === 'pickup') {
    const { x, y } = action;
    const val = state.map.get(x)?.get(y).val;
    if (!val) return { ...state };

    const newState = {
      ...state,
      pieces: [...state.pieces, val]
    };

    const left = newState.map.get(x - 1)?.get(y);
    const right = newState.map.get(x + 1)?.get(y);
    const up = newState.map.get(x)?.get(y + 1);
    const down = newState.map.get(x)?.get(y - 1);
    if (left) left.right = null;
    if (right) right.left = null;
    if (up) up.down = null;
    if (down) down.up = null;

    newState.map.get(x).delete(y);

    return newState;
  }
  console.error(`Invalid action '${action && action.type}'.`);
  return { ...state };
};

export const placePiece = (x, y) => ({
  type: 'placePiece',
  x: x,
  y: y
});

export const pickup = (x, y) => ({
  type: 'pickup',
  x: x,
  y: y
});
