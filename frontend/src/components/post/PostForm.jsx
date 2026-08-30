import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Owner: CS1 — task tracker: "Build post creation form"
export function PostForm() {
  const [type, setType] = useState("QUESTION");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagNames, setTagNames] = useState("");

  async function submit(e) {
    e.preventDefault();
    await apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        type,
        title,
        body,
        tagNames: tagNames.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
  }

  return (
    <form onSubmit={submit}>
      {/* TODO(CS1): real form styling + validation */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="QUESTION">Question</option>
        <option value="OFFER_TO_TEACH">Offer to teach</option>
        <option value="RESOURCE">Shared resource</option>
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
      <input value={tagNames} onChange={(e) => setTagNames(e.target.value)} placeholder="tags, comma, separated" />
      <button type="submit">Post</button>
    </form>
  );
}
