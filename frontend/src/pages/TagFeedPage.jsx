import { useParams } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/post/PostCard";

// Route: "/tags/:tag". Owner: CS2
export default function TagFeedPage() {
  const { tag = "" } = useParams();
  const { posts, loading } = usePosts(tag);
  if (loading) return <p>Loading...</p>;
  return (
    <main>
      <h1>#{tag}</h1>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </main>
  );
}
