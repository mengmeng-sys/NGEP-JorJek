import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchApi, usersApi, postsApi } from "@/lib/api";
import { PostCard } from "@/components/post/PostCard";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { DeletePostModal } from "@/components/post/DeletePostModal";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { usePostEditor } from "@/hooks/usePostEditor";
import { getApiErrorMessage } from "@/lib/apiClient";

// Route: "/search". Owner: CS2
export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
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
  const { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading } = usePostEditor(
    (updated) => setResults((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
    (created) => setResults((prev) => {
      if (prev.some((p) => p.id === created.id)) return prev;
      return [created, ...prev];
    })
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
        setUsers([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        // Posts and people are two separate endpoints (/search and
        // /users/search) — run them together so searching a name like a
        // teammate's actually surfaces that person, not just post text.
        const [postResults, userResults] = await Promise.all([
          searchApi.posts(q.trim(), currentUserId),
          usersApi.search(q.trim()).catch(() => []),
        ]);
        setResults(postResults);
        setUsers(userResults);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setResults([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-3.5 sm:space-y-4">
        {/* Search input lives in the navbar now (kept in sync with ?q= via
            Navbar.jsx) — this page used to render its own second, unsynced
            search box directly below it, which is the "2 search bars" bug. */}
        <h1 className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {loading
            ? "Searching..."
            : q.trim()
            ? `${results.length + users.length} result${results.length + users.length === 1 ? "" : "s"} for "${q.trim()}"`
            : "Search campus posts"}
        </h1>

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {users.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs">
            <h2 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2.5">
              People
            </h2>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/user/${u.handle}`)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 transition-colors cursor-pointer"
                >
                   <UserAvatar initials={u.initials} userId={u.id} size="md" gradient className="ring-2 ring-white dark:ring-gray-900 shadow-xs" avatarUrl={u.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                      {u.displayName}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {results.length === 0 && users.length === 0 && !loading && q.trim() ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">No results found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
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