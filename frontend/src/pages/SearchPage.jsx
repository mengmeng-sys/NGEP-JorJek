import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchApi, postsApi } from "@/lib/api";
import { PostCard } from "@/components/post/PostCard";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { DeletePostModal } from "@/components/post/DeletePostModal";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { usePostEditor } from "@/hooks/usePostEditor";
import { getApiErrorMessage } from "@/lib/apiClient";

// Route: "/search". Owner: CS2
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await postsApi.remove(postToDelete);
      setResults((prev) => prev.filter((p) => p.id !== postToDelete));
    } catch (err) {
      alert('Could not delete post.');
    }
    setPostToDelete(null);
  };
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading } = usePostEditor((updated) =>
    setResults((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  );

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("jorjek_auth_user");
      return raw ? JSON.parse(raw).id : null;
    } catch {
      return null;
    }
  })();

  const urlQuery = searchParams.get("q") || "";
  useEffect(() => {
    setQ(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    async function search() {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        setResults(await searchApi.posts(q.trim(), currentUserId));
      } catch (err) {
        setError(getApiErrorMessage(err));
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-3.5 sm:space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="relative flex items-center w-full h-11 rounded-xl border border-gray-200 bg-[#FAFAFA] focus-within:bg-white focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00] transition-all">
            <div className="grid place-items-center h-full w-11 text-gray-400 shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts, discussions and study notes..."
              className="w-full h-full outline-none text-xs text-gray-800 placeholder-gray-400 bg-transparent pr-4 font-medium"
              autoFocus
            />
          </div>
        </div>

        <h1 className="text-sm font-bold text-gray-800">
          {loading
            ? "Searching..."
            : q.trim()
            ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q.trim()}"`
            : "Search campus posts"}
        </h1>

        {error && (
          <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3 sm:space-y-4">
          {results.length === 0 && !loading && q.trim() ? (
            <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-xs">
              <h3 className="text-sm font-bold text-gray-900">No results found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Try different keywords or browse the campus feed instead.
              </p>
            </div>
          ) : (
            results.map((p) => <PostCard key={p.id} post={p} onEdit={openEdit} onDelete={() => setPostToDelete(p.id)} />)
          )}
        </div>
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