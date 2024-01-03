import "../styles/Chevron.scss";

export default function Chevron({ right, down, left, up }) {
  let rotation = 0;
  for (const dir of [right, down, left, up])
    if (dir) break; else rotation += 90;
  return (
    <img className="chevron"
      style={{ '--rotation': `${rotation}deg` }}
      src="/img/chevron.svg"
      alt="" />
  );
};
