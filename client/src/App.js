import './App.css';
import GameBoard from './GameBoard';
import { GameProvider } from './GameContext';
import './Gamepiece.scss';
import PieceRack from './PieceRack';
import { demoBoard, demoMap } from './demoBoard';

const initialState = {
  board: demoBoard,
  map: demoMap,
  turn: true,
  pieces: [0x11, 0x12, 0x13, 0x14, 0x15, 0x16],
  selected: 0
};

function App() {
  return (
    <GameProvider initialState={initialState}>
      <GameBoard />
      <PieceRack />
    </GameProvider>
  );
}

export default App;
