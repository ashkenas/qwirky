import { AnimatePresence, motion } from "framer-motion";
import Chevron from "./Chevron";
import "../styles/DashboardSection.scss";
import { useContext } from "react";
import { AccordionContext } from "./Accordion";

export default function DashboardSection({ title, children }) {
  const [open, setOpen] = useContext(AccordionContext);
  const isOpen = open === title;

  return (
      <motion.section key={title} className="section"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}>
        <motion.h2 onClick={() => setOpen(isOpen ? false : title)}>
          {title} <Chevron down={!isOpen} up={isOpen} expand="Left" />
        </motion.h2>
        <AnimatePresence initial={false}>
          {isOpen &&
            <motion.div
              key="body"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { height: "auto" },
                collapsed: { height: 0 }
              }}
              transition={{ duration: .25 }}>
              {children}
            </motion.div>
          }
        </AnimatePresence>
      </motion.section>
  );
};