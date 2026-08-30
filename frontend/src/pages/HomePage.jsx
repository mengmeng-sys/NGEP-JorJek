import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/post/PostCard";

// Home feed, route: "/". Owner: CS1
export default function HomePage() {
  const { posts, loading } = usePosts();
  if (loading) return <p>Loading...</p>;
  return (
    <main>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </main>
  );
}
