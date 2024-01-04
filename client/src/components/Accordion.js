import { createContext, useState } from "react";

export const AccordionContext = createContext(false);

export default function Accordion({ children, initial }) {
  const state = useState(initial || false);

  return (
    <AccordionContext.Provider value={state}>
      {children}
    </AccordionContext.Provider>
  );
};
