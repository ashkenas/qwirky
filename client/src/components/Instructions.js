import { Link } from "react-router-dom";
import Gamepiece from "./Gamepiece";
import DemoBoard from "./DemoBoard";
import "../styles/Instructions.scss";
import Chevron from "./Chevron";

export default function Instructions() {
  return (
    <div className="columns instructions">
      <div className="column">
        <section className="section">
          <Link to="/dash" aria-label="back">
            <h2>
              <Chevron left />&nbsp;Back 
            </h2>
          </Link>
        </section>
        <section className="section">
          <h2>
            The Tiles
          </h2>
          <div className="item">
            The 36 unique tiles are shown below. There are 3 copies of each in
            a game.
          </div>
          <DemoBoard height={6} width={6}>
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
          </DemoBoard>
        </section>
        <section className="section">
          <h2>
            The Goal
          </h2>
          <div className="item">
            Score the most points through strategic placement of tiles.
          </div>
        </section>
        <section className="section">
          <h2>
            Setup &amp; Starting
          </h2>
          <div className="item">
            Each player draws 6 tiles. This is your hand and should be kept
            secret. Whoever can play the most tiles (highest amount of same
            color or symbol, not including duplicates) goes first and does so.
          </div>
        </section>
        <section className="section">
          <h2>
            Taking a Turn
          </h2>
          <div className="item">
            On your turn, you may perform one of two actions:
            <ol>
              <li>Place tiles on the board.</li>
              <li>Trade tiles with the bag.</li>
            </ol>
          </div>
          <div className="item">
            <h3>Placing Tiles</h3>
            <p>
              You may place as many tiles as you want on your turn. Tiles are
              placed into "lines", horizontal or vertical contiguous pieces
              that share either a color or a symbol. A line cannot include any
              duplicate tiles as well. All the tiles you place in a turn must
              be placed in the same line; however, they don't need to touch.
              Once you've placed all your tiles, you draw back up to 6.
            </p>
          </div>
          <div className="item">
            <h3>Trading Tiles</h3>
            <p>
              You may trade as many tiles as you want on your turn. You select
              which tiles you want to exchange and then draw replacements
              before shuffling your old tiles back in. If you cannot place
              tiles on your turn, you must trade.
            </p>
          </div>
        </section>
        <section className="section">
          <h2>
            Scoring
          </h2>
          <div className="item">
            <p>
              You get 1 point for each tile in each line you added to,
              including tiles that were already on the board before your turn.
              Tiles you placed can be double counted if they are a part of both
              a horizontal and a vertical line.
            </p>
            <p>
              If you complete a line (place the 6th tile in it), you get a
              bonus 6 points for that line.
            </p>
            <p>
              Whoever ends the game gets a 6 point bonus.
            </p>
          </div>
        </section>
        <section className="section">
          <h2>
            Ending the Game
          </h2>
          <div className="item">
            Once the bag runs out of tiles, players keep taking turns without
            drawing until one of them runs out of tiles. This player gets a 6
            point bonus and the game then ends. The highest scoring player
            wins the game. If two or more players have the same score, the one
            with the least tiles in their hand wins.
          </div>
        </section>
        <section className="section">
          <h2>
            Sample Game
          </h2>
          <div className="item">
            Player A goes first and plays 2 tiles. They score 2 points.
          </div>
          <DemoBoard height={1} width={2}>
            <Gamepiece value={0x11} x={0} y={0} highlight />
            <Gamepiece value={0x12} x={1} y={0} highlight />
          </DemoBoard>
          <div className="item">
            Player B goes next and plays 2 tiles. They score 4 points.
          </div>
          <DemoBoard height={1} width={4}>
            <Gamepiece value={0x14} x={0} y={0} highlight />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} highlight />
          </DemoBoard>
          <div className="item">
            Player C goes next and plays 3 tiles. They score 4 points.
          </div>
          <DemoBoard height={4} width={4}>
            <Gamepiece value={0x14} x={0} y={0} />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} />
            <Gamepiece value={0x23} x={3} y={-1} highlight/>
            <Gamepiece value={0x33} x={3} y={-2} highlight/>
            <Gamepiece value={0x43} x={3} y={-3} highlight/>
          </DemoBoard>
          <div className="item">
            Player A gets another turn and plays 2 tiles. They score 6 points.
            This is because the pieces they placed formed a new vertical line,
            and are each part of an existing horizontal line.
          </div>
          <DemoBoard height={4} width={4}>
            <Gamepiece value={0x14} x={0} y={0} />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} />
            <Gamepiece value={0x23} x={3} y={-1} />
            <Gamepiece value={0x33} x={3} y={-2} />
            <Gamepiece value={0x32} x={2} y={-2} highlight/>
            <Gamepiece value={0x43} x={3} y={-3} />
            <Gamepiece value={0x42} x={2} y={-3} highlight/>
          </DemoBoard>
          <div className="item">
            Player B takes advantage of the board and scores 6 points with just
            1 tile, scoring 4 points vertically and 2 horizontally.
          </div>
          <DemoBoard height={4} width={4}>
            <Gamepiece value={0x14} x={0} y={0} />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} />
            <Gamepiece value={0x23} x={3} y={-1} />
            <Gamepiece value={0x22} x={2} y={-1} highlight/>
            <Gamepiece value={0x33} x={3} y={-2} />
            <Gamepiece value={0x32} x={2} y={-2} />
            <Gamepiece value={0x43} x={3} y={-3} />
            <Gamepiece value={0x42} x={2} y={-3} />
          </DemoBoard>
          <div className="item">
            Player C places 2 more tiles and takes 4 points.
          </div>
          <DemoBoard height={4} width={6}>
            <Gamepiece value={0x14} x={0} y={0} />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} />
            <Gamepiece value={0x22} x={2} y={-1} />
            <Gamepiece value={0x23} x={3} y={-1} />
            <Gamepiece value={0x24} x={4} y={-1} highlight />
            <Gamepiece value={0x25} x={5} y={-1} highlight />
            <Gamepiece value={0x32} x={2} y={-2} />
            <Gamepiece value={0x33} x={3} y={-2} />
            <Gamepiece value={0x42} x={2} y={-3} />
            <Gamepiece value={0x43} x={3} y={-3} />
          </DemoBoard>
          <div className="item">
            Player A completes the red line. This nets 12 points for the red
            line (6 for the tiles and the 6 bonus points), 2 more points for
            the crosses column, and 2 more points for the stars column. In
            total, they get 16 points for the move.
          </div>
          <DemoBoard height={4} width={6}>
            <Gamepiece value={0x14} x={0} y={0} />
            <Gamepiece value={0x11} x={1} y={0} />
            <Gamepiece value={0x12} x={2} y={0} />
            <Gamepiece value={0x13} x={3} y={0} />
            <Gamepiece value={0x14} x={4} y={0} highlight />
            <Gamepiece value={0x15} x={5} y={0} highlight />
            <Gamepiece value={0x22} x={2} y={-1} />
            <Gamepiece value={0x23} x={3} y={-1} />
            <Gamepiece value={0x24} x={4} y={-1} />
            <Gamepiece value={0x25} x={5} y={-1} />
            <Gamepiece value={0x32} x={2} y={-2} />
            <Gamepiece value={0x33} x={3} y={-2} />
            <Gamepiece value={0x42} x={2} y={-3} />
            <Gamepiece value={0x43} x={3} y={-3} />
          </DemoBoard>
        </section>
        <section className="section">
          <Link to="/dash" aria-label="back">
            <h2>
              <Chevron left />&nbsp;Back 
            </h2>
          </Link>
        </section>
      </div>
    </div>
  );
};
