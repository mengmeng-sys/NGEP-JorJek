import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { usePostEditor } from "@/hooks/usePostEditor";
import { PostCard } from "@/components/post/PostCard";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { DeletePostModal } from "@/components/post/DeletePostModal";
import { postsApi } from "@/lib/api";
import { normalizePost } from "@/lib/adapters";
import { useAuth } from "@/context/AuthContext";

// Route: "/tags/:tag". Owner: CS2
export default function TagFeedPage() {
  const { user } = useAuth();
  const { tag = "" } = useParams();
  const { posts, loading, error, updatePost, setPosts } = usePosts({ tag });
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading } = usePostEditor(
    updatePost,
    (created) => {
      const normalized = normalizePost(created, user?.id);
      setPosts((prev) => {
        if (prev.some((p) => p.id === normalized.id)) return prev;
        return [normalized, ...prev];
      });
    }
  );
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading #{tag} posts...</span>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
      <h1 className="text-lg sm:text-xl font-black text-gray-900">#{tag}</h1>
      {error && (
        <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {posts.length === 0 ? (
        <p className="text-xs text-gray-500 py-10 text-center">No posts tagged #{tag} yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onEdit={openEdit} onDelete={() => setPostToDelete(p.id)} />)
      )}

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
    </main>
  );
}