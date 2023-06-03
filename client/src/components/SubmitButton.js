import { useCallback, useContext } from "react";
import { endTurn, GameContext, GameDispatchContext } from "../contexts/GameContext";

export default function SubmitButton({ ws }) {
  const { placed } = useContext(GameContext);
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

  return <button className="submit-move" onClick={submit}>Submit</button>;
};
