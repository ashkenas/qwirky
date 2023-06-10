import "../styles/Loading.scss"

export default function Loading({ inline, message }) {
  return (
    <div className={`loading-content${inline ? ' inline' : ''}`}>
      {message && <p>{message}</p>}
    </div>
  );
};
