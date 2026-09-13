import { useState } from "react";
import { postsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiClient";

export function usePostEditor(applyUpdated) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const openEdit = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  const closeEdit = () => {
    setIsPostModalOpen(false);
    setEditingPost(null);
  };

  const saveEdit = async (payload) => {
    if (!editingPost) return;
    try {
      const updated = await postsApi.update(editingPost.id, {
        title: payload.title,
        content: payload.details ?? payload.content,
        type: payload.type,
        tags: (payload.tags || []).map((t) => String(t).replace(/^#/, "")),
      });
      if (typeof applyUpdated === "function") applyUpdated(updated);
      closeEdit();
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit };
}
