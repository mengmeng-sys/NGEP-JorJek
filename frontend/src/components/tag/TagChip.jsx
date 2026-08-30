import { Link } from "react-router-dom";

// Owner: CS2
export function TagChip({ name }) {
  return <Link to={`/tags/${encodeURIComponent(name)}`}>#{name}</Link>;
}
