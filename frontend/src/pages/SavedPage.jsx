import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { savedApi, postsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePostEditor } from '@/hooks/usePostEditor';

export default function SavedPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await postsApi.remove(postToDelete);
      setSavedPosts((prev) => prev.filter((p) => p.id !== postToDelete));
    } catch (err) {
      alert('Could not delete post.');
    }
    setPostToDelete(null);
  };
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading } = usePostEditor(
    (updated) => setSavedPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
    (created) => setSavedPosts((prev) => {
      if (prev.some((p) => p.id === created.id)) return prev;
      return [created, ...prev];
    })
  );

  const loadSaved = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await savedApi.list(user?.id);
      setSavedPosts(data.posts);
    } catch (err) {
      setError(err?.message || 'Could not load your saved posts.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth/login');
      return;
    }
    loadSaved();
  }, [authLoading, user, navigate, loadSaved]);

  const handleToggleSave = (postId) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-4 sm:space-y-5">

        {/* Responsive Header Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center text-[#FF4F00] shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
                Your Saved Resources
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5 leading-snug truncate">
                {savedPosts.length === 0
                  ? 'Posts you save will appear here for quick access'
                  : `${savedPosts.length} ${savedPosts.length === 1 ? 'post' : 'posts'} saved to your bookmarks`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs min-h-90 sm:min-h-100">
            <div className="w-8 h-8 border-[3px] border-orange-200 dark:border-orange-900/30 border-t-[#FF4F00] rounded-full animate-spin mb-4" />
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Loading your saved posts…</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs min-h-90 sm:min-h-100">
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2 mb-5">
              {error}
            </p>
            <button
              type="button"
              onClick={loadSaved}
              className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Try again
            </button>
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs min-h-90 sm:min-h-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20/70 border border-orange-100 dark:border-orange-900/30 text-[#FF4F00] flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5">
              Nothing saved yet!
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mb-5 sm:mb-6 leading-relaxed">
              Click the <strong className="font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600">Save</strong> bookmark button on questions or study guides to collect them here.
            </p>

            <Link
              to="/"
              className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-98 text-center"
            >
              Browse campus feed →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSave={handleToggleSave}
                onEdit={openEdit}
                onDelete={() => setPostToDelete(post.id)}
              />
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