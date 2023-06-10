import { useContext } from "react"
import { GameContext } from "../contexts/GameContext"
import "../styles/TileCounter.scss";

export default function TileCounter() {
  const { tilesLeft } = useContext(GameContext);
  
  return (
    <div className="tile-counter">
      {tilesLeft}
    </div>
  );
};
