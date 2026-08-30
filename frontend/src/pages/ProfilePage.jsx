import { useParams } from "react-router-dom";

// Route: "/profile/:username". Owner: CS2 — render user's karma, posts,
// and role label.
export default function ProfilePage() {
  const { username } = useParams();
  return <main>{/* TODO(CS2): fetch /users/:id, show KarmaBadge + post history */}</main>;
}
