import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Tags & Taxonomy (SRS 4): manage skill tags (#C++, #SQL) with category CRUD
// plus featured banner-topic settings for the left-sidebar promotional banner.
export default function TagsTopicsPage() {
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  async function load() {
    setTags(await apiFetch("/tags"));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function createTag() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await apiFetch("/api/admin/tags", { method: "POST", body: JSON.stringify({ name: name.trim(), featured: false }) });
      setToast({ kind: "ok", text: `Tag #${name.trim()} added.` });
      setName("");
      await load();
    } catch (e) {
      setToast({ kind: "error", text: e.message });
    } finally {
      setCreating(false);
    }
  }

  async function toggleFeatured(tag) {
    await apiFetch(`/api/admin/tags/${tag.id}`, {
      method: "PATCH",
      body: JSON.stringify({ featured: !tag.featured }),
    });
    await load();
  }

  async function removeTag(tag) {
    await apiFetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
    setToast({ kind: "ok", text: `Tag #${tag.name} removed.` });
    await load();
  }

  return (
    <>
      <h1>Tags & Topics</h1>
      <p className="admin-subtitle">
        Category CRUD for skill tags and featured banner-topic settings (SRS 4).
      </p>

      {toast && (
        <div className="jd-alert" style={toast.kind === "error" ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" } : undefined}>
          {toast.text}
        </div>
      )}

      <div className="admin-panel">
        <h2>Add a skill tag</h2>
        <div className="admin-panel-body">
          <div className="jd-inline-form">
            <input
              placeholder="e.g. C++  or  SQL"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
            />
            <button className="jd-btn jd-btn-primary" disabled={creating || !name.trim()} onClick={createTag}>
              {creating ? "Adding…" : "Add tag"}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Skill tags &amp; featured banner topics</h2>
        {error ? (
          <div className="admin-panel-body jd-empty">Failed to load tags: {error}</div>
        ) : tags.length === 0 ? (
          <div className="admin-panel-body jd-empty">No tags yet — add the first one above.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Featured banner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr key={t.id}>
                  <td>#{t.name}</td>
                  <td>
                    <button
                      className={`jd-btn jd-btn-sm ${t.featured ? "jd-btn-primary" : ""}`}
                      onClick={() => toggleFeatured(t)}
                    >
                      {t.featured ? "★ Featured" : "Not featured"}
                    </button>
                  </td>
                  <td>
                    <button className="jd-btn jd-btn-sm jd-btn-danger" onClick={() => removeTag(t)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}