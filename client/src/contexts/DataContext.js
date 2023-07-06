import { createContext, useReducer } from "react";

export const DataContext = createContext(null);

export const DataDispatchContext = createContext(null);

let stored = localStorage.getItem('dataStore');
stored = stored ? JSON.parse(stored) : new Map();

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, stored);

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
  localStorage.setItem('dataStore', JSON.stringify(newState));
  return newState; 
};