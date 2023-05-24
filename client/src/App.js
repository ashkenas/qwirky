import './App.css';
import GameBoard from './GameBoard';
import { GameProvider } from './GameContext';
import './Gamepiece.scss';
import demoBoard from './demoBoard';

const initialState = {
  board: demoBoard,
  turn: true,
  pieces: []
};

function App() {
  return (
    <GameProvider initialState={initialState}>
      <GameBoard />
    </GameProvider>
  );
}

export default App;
