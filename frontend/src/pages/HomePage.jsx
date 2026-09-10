import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/post/PostCard";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

export default function HomePage() {
  const { posts, loading } = usePosts();

  if (loading) {
    return (
      <ThreeColumnLayout>
        <div className="flex justify-center py-10 text-gray-500 font-medium">Loading feed...</div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout>
      
      {/* Figma-Matched Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex justify-between items-center mb-5 shadow-sm">
        <div className="flex items-center gap-5 text-sm font-medium">
          <span className="text-gray-400">Sort by:</span>
          <button className="bg-[#FF4F00] text-white px-4 py-1.5 rounded-lg font-bold">Hot</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">New</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">Top</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">Rising</button>
        </div>
        <span className="text-gray-400 text-sm font-medium">{posts.length} posts</span>
      </div>

      {/* Post Feed */}
      <div>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      
    </ThreeColumnLayout>
  );
}