import { useState, useCallback } from "react";
import { postsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiClient";

export function usePostEditor(applyUpdated, applyCreated) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const openEdit = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  const closeEdit = () => {
    setIsPostModalOpen(false);
    setEditingPost(null);
  };

  const saveEdit = async (payload) => {
    setIsUploading(true);
    try {
      if (!editingPost) {
        const created = await postsApi.create({
          type: payload.type || "question",
          title: payload.title,
          content: payload.content ?? payload.details ?? "",
          tagNames: (payload.tags || []).map((t) => String(t).replace(/^#/, "")),
          allowMentoring: payload.allowMentoring,
          imageFile: payload.imageFile,
          image_url: payload.image_url,
        });
        if (typeof applyCreated === "function") applyCreated(created);
      } else {
        const updated = await postsApi.update(editingPost.id, {
          title: payload.title,
          content: payload.details ?? payload.content,
          type: payload.type,
          allowMentoring: payload.allowMentoring,
          tags: (payload.tags || []).map((t) => String(t).replace(/^#/, "")),
          imageFile: payload.imageFile,
          image_url: payload.image_url,
        });
        if (typeof applyUpdated === "function") applyUpdated(updated);
      }
      closeEdit();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return { isPostModalOpen, editingPost, openEdit, closeEdit, saveEdit, isUploading };
}
