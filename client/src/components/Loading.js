import "../styles/Loading.scss"

export default function Loading({ inline }) {
  return <div className={`loading-content${inline ? ' inline' : ''}`}></div>;
};
