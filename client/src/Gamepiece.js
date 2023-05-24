export default function Gamepiece({ value, x, y }) {
  return (
    <div className={`piece p${value & 0xF}${(value >> 4) & 0xF}`}
      style={{ top: `${x}00%`, left: `-${y}00%` }}></div>
  );
};
