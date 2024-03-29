import { useCallback, useContext } from "react";
import { cancelTrade, endTurn, GameContext, GameDispatchContext, pickup, startTrade } from "../contexts/GameContext";
import Gamepiece from "./Gamepiece";
import "../styles/Controls.scss";

export default function Controls({ ws }) {
  const { hand, selected, placed, trading, toTrade, tilesLeft, yourTurn } = useContext(GameContext);
  const dispatch = useContext(GameDispatchContext);

  const submit = useCallback(() => {
    if (placed.length === 0)
      return alert('You must place at least one piece down.');
    
    ws.send(JSON.stringify({
      type: 'move',
      placed
    }));

    dispatch(endTurn());
  }, [placed, dispatch, ws]);

  const doStartTrade = useCallback(() => {
    dispatch(startTrade());
  }, [dispatch]);

  const doCancelTrade = useCallback(() => {
    dispatch(cancelTrade())
  }, [dispatch]);

  const doTrade = useCallback(() => {
    if (toTrade.length === 0)
      return alert('You must select at least one piece to trade.');

    ws.send(JSON.stringify({
      type: 'trade',
      pieces: toTrade.map(i => hand[i])
    }));

    dispatch(endTurn());
  }, [ws, toTrade, hand, dispatch]);

  return (
    <div className="controls">
      <div className="rack">
        <div className="game-button">
          {trading &&
            <button className="btn-1" onClick={doCancelTrade}>
              Cancel
            </button>
          }
          {placed.length > 0 &&
            <button className="btn-1" onClick={() => dispatch(pickup())}>
              Undo
            </button>
          }
        </div>
        <div className="pieces">
          {hand.map((val, x) =>
            <Gamepiece key={val} value={val} x={x} selected={x === selected}
              racked highlight={trading && toTrade.includes(x)} />
          )}
        </div>
        <div className="game-button">
          {yourTurn && tilesLeft > 0 && placed.length === 0 && !toTrade.length &&
            <button className="trade" onClick={doStartTrade}>
              {trading ? 'Select Pieces' : 'Trade With Bag'}
            </button>
          }
          {toTrade.length > 0 &&
            <button className="btn-2" onClick={doTrade}>Confirm</button>
          }
          {placed.length > 0 &&
            <button className="btn-2" onClick={submit}>Make Move</button>
          }
        </div>
        <div className="buttons">
          {yourTurn && tilesLeft > 0 && placed.length === 0 && !toTrade.length &&
            <button className="trade" onClick={doStartTrade}>
              {trading ? 'Select Pieces' : 'Trade With Bag'}
            </button>
          }
          {toTrade.length > 0 &&
            <button className="btn-2" onClick={doTrade}>Confirm</button>
          }
          {placed.length > 0 &&
            <button className="btn-2" onClick={submit}>Make Move</button>
          }
          {trading &&
            <button className="btn-1" onClick={doCancelTrade}>
              Cancel
            </button>
          }
          {placed.length > 0 &&
            <button className="btn-1" onClick={() => dispatch(pickup())}>
              Undo
            </button>
          }
        </div>
      </div>
    </div>
  );
}
