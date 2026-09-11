import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/post/PostCard";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";

export default function HomePage() {
  const { posts, loading } = usePosts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get('tag');

  // Filter posts based on selected tag
  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags && p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
    : posts;

  if (loading) {
    return (
      <ThreeColumnLayout>
        <div className="flex justify-center py-10 text-gray-500 font-medium">Loading feed...</div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout>
      {/* Active Filter Pill Bar (Shown only when filtering) */}
      {selectedTag && (
        <div className="flex items-center justify-between bg-[#FFF4F0] border border-orange-200 rounded-xl px-4 py-2.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Filtering by tag:</span>
            <span className="text-xs font-bold text-[#FF4F00] bg-white px-2.5 py-1 rounded-md border border-orange-200">
              #{selectedTag}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Clear filter ×
          </button>
        </div>
      )}

      {/* Sort Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex justify-between items-center mb-5 shadow-sm">
        <div className="flex items-center gap-5 text-sm font-medium">
          <span className="text-gray-400">Sort by:</span>
          <button className="bg-[#FF4F00] text-white px-4 py-1.5 rounded-lg font-bold">Hot</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">New</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">Top</button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">Rising</button>
        </div>
        <span className="text-gray-400 text-sm font-medium">{filteredPosts.length} posts</span>
      </div>

      {/* Post Feed */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No posts found for #{selectedTag}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </ThreeColumnLayout>
  );
}
