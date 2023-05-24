import { createContext, useReducer } from "react";

export const gameReducer = (state, action) => {
    console.error(`Invalid action '${action && action.type}'.`);
    return { ...state, pieces: [...state.pieces] };
};

export const GameContext = createContext({
    board: null,
    turn: true,
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
