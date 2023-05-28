import { useData } from "../util";
import "../styles/Friends.scss";

export default function Friends() {
  const { data, error, loading } = useData('/api/friends');

  if (error) return error;
  if (loading) return "loading";
  return <>{data.map(f=><p>{f.username}</p>)}</>;
};
