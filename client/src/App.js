import './App.css';
import { GameProvider } from './GameContext';
import Gamepiece from './Gamepiece';
import './Gamepiece.scss';

const initialState = {
  board: null,
  turn: true,
  pieces: []
};

function App() {
  return (
    <GameProvider initialState={initialState}>
      <Gamepiece value={0x11} />
      <Gamepiece value={0x12} />
      <Gamepiece value={0x13} />
      <Gamepiece value={0x14} />
      <Gamepiece value={0x15} />
      <Gamepiece value={0x16} />
      <br /><Gamepiece value={0x21} />
      <Gamepiece value={0x22} />
      <Gamepiece value={0x23} />
      <Gamepiece value={0x24} />
      <Gamepiece value={0x25} />
      <Gamepiece value={0x26} />
      <br /><Gamepiece value={0x31} />
      <Gamepiece value={0x32} />
      <Gamepiece value={0x33} />
      <Gamepiece value={0x34} />
      <Gamepiece value={0x35} />
      <Gamepiece value={0x36} />
      <br /><Gamepiece value={0x41} />
      <Gamepiece value={0x42} />
      <Gamepiece value={0x43} />
      <Gamepiece value={0x44} />
      <Gamepiece value={0x45} />
      <Gamepiece value={0x46} />
      <br /><Gamepiece value={0x51} />
      <Gamepiece value={0x52} />
      <Gamepiece value={0x53} />
      <Gamepiece value={0x54} />
      <Gamepiece value={0x55} />
      <Gamepiece value={0x56} />
      <br /><Gamepiece value={0x61} />
      <Gamepiece value={0x62} />
      <Gamepiece value={0x63} />
      <Gamepiece value={0x64} />
      <Gamepiece value={0x65} />
      <Gamepiece value={0x66} />
      <br />
    </GameProvider>
  );
}

export default App;
