import './App.css';
import { GameProvider } from './GameContext';

const initialState = {
  board: null,
  turn: true,
  pieces: []
};

function App() {
  return (
    <GameProvider initialState={initialState}>
      <p>Hey</p>
    </GameProvider>
  );
}

export default App;
