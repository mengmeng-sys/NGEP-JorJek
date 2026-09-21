import React, { useState, useEffect } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { postsApi } from '@/lib/api';
import { usePostEditor } from '@/hooks/usePostEditor';
import { useAuth } from '@/context/AuthContext';

export default function PopularPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('week'); // 'today' | 'week' | 'all'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState(null);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await postsApi.remove(postToDelete);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
    } catch (err) {
      alert('Could not delete post.');
    }
    setPostToDelete(null);
  };
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading } = usePostEditor(
    (updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
    (created) => setPosts((prev) => {
      if (prev.some((p) => p.id === created.id)) return prev;
      return [created, ...prev];
    })
  );

  useEffect(() => {
    async function fetchPopularPosts() {
      setLoading(true);
      try {
        const all = await postsApi.list({ limit: 100, currentUserId: user?.id });
        const now = Date.now();
        const cutoff =
          timeframe === 'today' ? now - 24 * 60 * 60 * 1000 : now - 7 * 24 * 60 * 60 * 1000;

        const filtered = (timeframe === 'all' ? all.posts : all.posts.filter((p) => {
          const created = new Date(p.createdAt || 0).getTime();
          return created >= cutoff;
        }));

        setPosts(filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)));
      } catch (err) {
        console.error('Failed to load popular feed:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularPosts();
  }, [timeframe]);

  const timeframeOptions = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-3.5 sm:space-y-4">

        {/* Popular Header Banner */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs -mx-3 sm:mx-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">

            {/* Title & Icon Group */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center text-[#FF4F00] shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
                  Popular Discussions
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none">
                  Highest-rated study materials and questions across campus
                </p>
              </div>
            </div>

            {/* Timeframe Selector Pill Bar: Expands full-width on mobile */}
            <div className="flex items-center gap-1 bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-1 rounded-xl w-full sm:w-auto">
              {timeframeOptions.map((opt) => {
                const isActive = timeframe === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeframe(opt.id)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-[#FF4F00] text-white shadow-xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Feed Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 gap-2">
            <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading top discussions...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#FF4F00] flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">No discussions found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              No top-voted posts match this period ({timeframeOptions.find(t => t.id === timeframe)?.label}).
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onEdit={openEdit} onDelete={() => setPostToDelete(post.id)} />
            ))}
          </div>
        )}

      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        initialData={editingPost}
        onClose={closeEdit}
        onPublish={saveEdit}
        isUploading={isUploading}
      />

      <DeletePostModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </ThreeColumnLayout>
  );
}