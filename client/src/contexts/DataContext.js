import { createContext, useReducer } from "react";

export const DataContext = createContext(null);

export const DataDispatchContext = createContext(null);

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, new Map());

  return (
    <DataDispatchContext.Provider value={dispatch}>
      <DataContext.Provider value={state}>
        {children}
      </DataContext.Provider>
    </DataDispatchContext.Provider>
  );
};

export const dataReducer = (state, action) => {
  const newState = new Map(state);
  newState.set(action.url, action.payload);
  return newState; 
};