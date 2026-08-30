import { useParams } from "react-router-dom";

// Route: "/posts/:id". Owner: CS1 — fetch the post + comment thread,
// render <CommentThread /> (which itself renders the Phase-2-stub
// <RequestSessionButton />).
export default function PostDetailPage() {
  const { id } = useParams();
  return <main>{/* TODO(CS1): fetch post {id}, render CommentThread */}</main>;
}
