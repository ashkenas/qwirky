import { createContext, useReducer } from "react";

export const GameContext = createContext({
  board: null,
  map: new Map(),
  turn: true,
  selected: 0,
  pieces: [],
  placed: []
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
      selected: Math.min(state.pieces.length - 2, state.selected),
      pieces: [...state.pieces],
      placed: [...state.placed]
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
      down: down,
      x: x,
      y: y
    };

    newState.placed.push(piece);

    // Validate piece placement
    let sameX = true, sameY = true;
    for (const p of state.placed) {
      sameX &&= p.x === x;
      sameY &&= p.y === y;
    }
    if (!sameX && !sameY) return { ...state };

    for (const dirs of [['up', 'down'], ['left', 'right']]) {
      let sameA = true, sameB = true;
      for (const dir of dirs) {
        let current = piece;
        while (current[dir]) {
          if (current[dir].val === val) return { ...state };
          current = current[dir];
          sameA &&= (current.val & 0xF) === (val & 0xF);
          sameB &&= (current.val & 0xF0) === (val & 0xF0);
        }
      }
      if (!sameA && !sameB) return { ...state };
    }

    if (left) left.right = piece;
    if (right) right.left = piece;
    if (up) up.down = piece;
    if (down) down.up = piece;

    const col = newState.map.get(x) || new Map();
    col.set(y, piece);
    newState.map.set(x, col);

    return newState;
  } else if (action.type === 'pickup') {
    const newState = {
      ...state,
      pieces: [...state.pieces, ...state.placed.map(p => p.val)],
      placed: []
    };

    for (const piece of state.placed) {
      if (piece.left) piece.left.right = null;
      if (piece.right) piece.right.left = null;
      if (piece.up) piece.up.down = null;
      if (piece.down) piece.down.up = null;
  
      newState.map.get(piece.x)?.delete(piece.y);
    }

    return newState;
  } else if (action.type === 'select') {
    return { ...state, selected: action.x };
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
