import { Link } from "react-router-dom";
import Gamepiece from "./Gamepiece";
import "../styles/Instructions.scss";

export default function Instructions() {
  return (<>
    <Link to="/dash" className="back is-desktop" aria-label="back" />
    <div className="columns">
      <div className="column">
        <Link to="/dash" className="back is-mobile" aria-label="back">
          Back
        </Link>
        <h1>How To Play</h1>
        <p>
          Qwirky is kind of like scrabble, if you got rid of the need to consult a dictionary.
          Instead of putting tiles together to form words, this game the goal is to form patterns.
          Tiles in Qwirky consist of a colored symbol. There are 6 symbols and 6 colors, making 36
          possible tiles. Of each of these tiles, there are 3 copies. For reference, here are the
          possible pieces:
        </p>
        <div className="demo-board">
          <div className="center-piece">
            <Gamepiece value={0x11} x={0} y={-0}/>
            <Gamepiece value={0x12} x={1} y={-0}/>
            <Gamepiece value={0x13} x={2} y={-0}/>
            <Gamepiece value={0x14} x={3} y={-0}/>
            <Gamepiece value={0x15} x={4} y={-0}/>
            <Gamepiece value={0x16} x={5} y={-0}/>
            <Gamepiece value={0x21} x={0} y={-1}/>
            <Gamepiece value={0x22} x={1} y={-1}/>
            <Gamepiece value={0x23} x={2} y={-1}/>
            <Gamepiece value={0x24} x={3} y={-1}/>
            <Gamepiece value={0x25} x={4} y={-1}/>
            <Gamepiece value={0x26} x={5} y={-1}/>
            <Gamepiece value={0x31} x={0} y={-2}/>
            <Gamepiece value={0x32} x={1} y={-2}/>
            <Gamepiece value={0x33} x={2} y={-2}/>
            <Gamepiece value={0x34} x={3} y={-2}/>
            <Gamepiece value={0x35} x={4} y={-2}/>
            <Gamepiece value={0x36} x={5} y={-2}/>
            <Gamepiece value={0x41} x={0} y={-3}/>
            <Gamepiece value={0x42} x={1} y={-3}/>
            <Gamepiece value={0x43} x={2} y={-3}/>
            <Gamepiece value={0x44} x={3} y={-3}/>
            <Gamepiece value={0x45} x={4} y={-3}/>
            <Gamepiece value={0x46} x={5} y={-3}/>
            <Gamepiece value={0x51} x={0} y={-4}/>
            <Gamepiece value={0x52} x={1} y={-4}/>
            <Gamepiece value={0x53} x={2} y={-4}/>
            <Gamepiece value={0x54} x={3} y={-4}/>
            <Gamepiece value={0x55} x={4} y={-4}/>
            <Gamepiece value={0x56} x={5} y={-4}/>
            <Gamepiece value={0x61} x={0} y={-5}/>
            <Gamepiece value={0x62} x={1} y={-5}/>
            <Gamepiece value={0x63} x={2} y={-5}/>
            <Gamepiece value={0x64} x={3} y={-5}/>
            <Gamepiece value={0x65} x={4} y={-5}/>
            <Gamepiece value={0x66} x={5} y={-5}/>
          </div>
        </div>
      </div>
    </div>
  </>);
};
