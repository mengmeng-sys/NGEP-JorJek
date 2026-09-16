import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePosts } from "@/hooks/usePosts";
import { usePostEditor } from "@/hooks/usePostEditor";
import { useSocket } from "@/context/SocketContext";
import { PostCard } from "@/components/post/PostCard";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { DeletePostModal } from "@/components/post/DeletePostModal";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { normalizePost } from "@/lib/adapters";
import { postsApi } from "@/lib/api";

export default function HomePage() {
  const { posts, loading, loadingMore, hasMore, loadMore, updatePost, setPosts } = usePosts();
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit } = usePostEditor(updatePost);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get('tag');
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNewPost = (newPost) => {
      const normalized = normalizePost(newPost);
      setPosts((prev) => {
        if (prev.some((p) => p.id === normalized.id)) return prev;
        if (selectedTag && !normalized.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) return prev;
        // Append, don't prepend: someone else's post landing while you're mid-scroll
        // should show up past what you've already loaded, not shove everything you're
        // reading down the page. A real refresh re-fetches from the server (created_at
        // DESC), which is where "newest at the top" actually happens.
        return [...prev, normalized];
      });
    };

    const handlePostDeleted = ({ id }) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    const handlePostUpdated = (updatedPost) => {
      const normalized = normalizePost(updatedPost);
      setPosts((prev) =>
        prev.map((p) => (p.id === normalized.id ? { ...p, ...normalized } : p))
      );
    };

    on("new_post", handleNewPost);
    on("post_deleted", handlePostDeleted);
    on("post_updated", handlePostUpdated);
    return () => {
      off("new_post", handleNewPost);
      off("post_deleted", handlePostDeleted);
      off("post_updated", handlePostUpdated);
    };
  }, [on, off, selectedTag, setPosts]);

  const [sortBy, setSortBy] = useState('hot');
  const [postToDelete, setPostToDelete] = useState(null);

  // Facebook-style infinite scroll: a sentinel just below the last card that,
  // once it drifts into view, silently fetches the next page and appends it.
  // rootMargin fires the fetch ~600px before the sentinel is actually on
  // screen, so the next batch is already there by the time you reach it.
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

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
  const sortOptions = [
    { id: 'hot', label: 'Hot' },
    { id: 'new', label: 'New' },
    { id: 'top', label: 'Top' },
    { id: 'rising', label: 'Rising' },
  ];

  // Filter posts based on selected tag
  const filteredPosts = selectedTag
    ? posts?.filter((p) => p?.tags && p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) || []
    : posts || [];

  // Client-side sorting — the backend /posts endpoint has no sort param.
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    if (sortBy === 'new') return bTime - aTime;
    if (sortBy === 'top') return (b.upvotes || 0) - (a.upvotes || 0);
    if (sortBy === 'rising') {
      const ageA = Math.max(1, (Date.now() - aTime) / 3600000);
      const ageB = Math.max(1, (Date.now() - bTime) / 3600000);
      return (b.upvotes || 0) / Math.pow(ageB, 1.4) - (a.upvotes || 0) / Math.pow(ageA, 1.4);
    }
    return 0; // hot: keep the backend order
  });

  if (loading) {
    return (
      <ThreeColumnLayout>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading campus feed...</span>
        </div>
      </ThreeColumnLayout>
    );
  }

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-3.5 sm:space-y-4">
        
        {/* Active Filter Pill Bar */}
        {selectedTag && (
          <div className="flex items-center justify-between gap-2 bg-[#FFF4F0] border border-orange-200 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[11px] sm:text-xs text-gray-600 font-medium truncate">Filter:</span>
              <span className="text-[11px] sm:text-xs font-bold text-[#FF4F00] bg-white px-2 py-0.5 rounded-md border border-orange-200 truncate">
                #{selectedTag}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[11px] sm:text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
            >
              Clear ×
            </button>
          </div>
        )}

        {/* Sort Controls Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-3 shadow-xs -mx-3 sm:mx-0">
          
          {/* Scrollable Sort Pills on Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
            <span className="hidden sm:inline text-xs font-medium text-gray-400 mr-1 shrink-0">
              Sort:
            </span>

            {sortOptions.map((option) => {
              const isActive = sortBy === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSortBy(option.id)}
                  className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#FF4F00] text-white shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Post Counter Badge */}
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium whitespace-nowrap pl-2 border-l border-gray-100 sm:border-l-0 shrink-0">
            {sortedPosts.length} <span className="hidden xs:inline">posts</span>
          </span>
        </div>

        {/* Post Feed Container */}
        {sortedPosts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF4F00] flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">No posts found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {selectedTag 
                ? `There are no questions or discussions tagged with #${selectedTag} yet.`
                : 'No posts have been published on the campus feed yet.'}
            </p>
            {selectedTag && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 text-xs font-bold text-[#FF4F00] hover:underline"
              >
                Back to all posts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedPosts.map((p) => (
              <PostCard key={p.id} post={p} onEdit={openEdit} onDelete={() => setPostToDelete(p.id)} />
            ))}

            {/* Invisible trigger for infinite scroll — fires loadMore() before
                it's actually scrolled into view (see rootMargin above). */}
            {hasMore && <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />}

            {loadingMore && (
              <div className="flex items-center justify-center py-5 text-gray-400 gap-2">
                <div className="w-4 h-4 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading more posts...</span>
              </div>
            )}

            {!hasMore && !loadingMore && sortedPosts.length > 0 && (
              <p className="text-center text-[11px] text-gray-400 font-medium py-5">
                You're all caught up 🎉
              </p>
            )}
          </div>
        )}

      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        initialData={editingPost}
        onClose={closeEdit}
        onPublish={saveEdit}
      />

      <DeletePostModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </ThreeColumnLayout>
  );
}