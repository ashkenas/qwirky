import { Link } from "react-router-dom";
import "../styles/ErrorPage.scss";

export default function ErrorPage({ status, message }) {
  return (
    <div className="center">
      <div className="error">
        <h1>{status}</h1>
        <p>{message}</p>
        <Link to="/">Take Me Home</Link>
      </div>
    </div>
  );
};
