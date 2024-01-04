import "../styles/Chevron.scss";

export default function Chevron({ right, down, left, up, expand }) {
  let rotation = 0;
  for (const dir of [right, down, left, up])
    if (dir) break; else rotation += 90;
  const style = {
    '--rotation': `${rotation}deg`,
    [`margin${expand || ''}`]: expand ? 'auto' : 0
  };
  return (
    <img className="chevron"
      style={style}
      src="/img/chevron.svg"
      alt="" />
  );
};
