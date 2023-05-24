import './App.css';
import GameBoard from './GameBoard';
import { GameProvider } from './GameContext';
import './Gamepiece.scss';

const initialState = {
  board: null,
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
