import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { PostCard } from "@/components/post/PostCard";

// Route: "/search". Owner: CS2
export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  async function search() {
    setResults(await apiFetch(`/search?q=${encodeURIComponent(q)}`));
  }

  return (
    <main>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." />
      <button onClick={search}>Search</button>
      {results.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </main>
  );
}
