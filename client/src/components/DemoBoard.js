export default function DemoBoard({ children, height = 1, width = 1 }) {
  return (
    <div className="item demo" style={{ '--height': height }}>
      <div className="demo-board"
        style={{'--height': height, '--width': width }}>
        <div className="center-piece">
          {children}
        </div>
      </div>
    </div>
  );
};
