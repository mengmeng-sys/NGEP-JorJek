import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SUGGESTED_TAGS = ['#C++', '#SQL', '#Java', '#Machine Learning', '#Figma'];

export function MyPostsTab() {
  const navigate = useNavigate();

  const [myPosts, setMyPosts] = useState([
    {
      id: 1,
      tags: ['#C++'],
      time: '2d ago',
      title: 'Tracking down memory leaks in a large C++ codebase — tools and strategies?',
      snippet:
        "Our team's app has a slow memory growth over 24h that's hard to reproduce. Valgrind is too slow for production load. Looking for lightweight leak detection workflows that scale.",
      upvotes: 38,
      voteState: 0, // 1: upvoted, -1: downvoted, 0: neutral
      comments: 9,
    },
    {
      id: 2,
      tags: ['#SQL'],
      time: '5d ago',
      title: 'Optimizing complex multi-join queries — where do I start with EXPLAIN output?',
      snippet:
        "I have a 5-table JOIN that drops from 200ms to 4 seconds when the dataset grows past 500K rows. I've run EXPLAIN ANALYZE but I can't tell which node is the bottleneck.",
      upvotes: 21,
      voteState: 0,
      comments: 5,
    },
    {
      id: 3,
      tags: ['#Machine Learning'],
      time: '1w ago',
      title: 'When should I normalize features vs. use tree-based models that don\'t need it?',
      snippet:
        'I keep second-guessing when to apply StandardScaler. My intuition says skip it for Random Forests but apply it for SVMs and logistic regression. Is this right, and why?',
      upvotes: 45,
      voteState: 0,
      comments: 12,
    },
  ]);

  // Menu toggle state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);

  // Edit modal states
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSnippet, setEditSnippet] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Close dropdown on outside click
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Upvote / Downvote handlers
  const handleVote = (e, postId, direction) => {
    e.stopPropagation();
    setMyPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        let newVoteState = post.voteState;
        let voteDelta = 0;

        if (direction === 'up') {
          if (post.voteState === 1) {
            newVoteState = 0;
            voteDelta = -1;
          } else {
            voteDelta = post.voteState === -1 ? 2 : 1;
            newVoteState = 1;
          }
        } else if (direction === 'down') {
          if (post.voteState === -1) {
            newVoteState = 0;
            voteDelta = 1;
          } else {
            voteDelta = post.voteState === 1 ? -2 : -1;
            newVoteState = -1;
          }
        }

        return {
          ...post,
          voteState: newVoteState,
          upvotes: post.upvotes + voteDelta,
        };
      })
    );
  };

  // Share handler
  const handleShare = (e, postId) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleDeletePost = (id) => {
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this post?')) {
      setMyPosts((prev) => prev.filter((post) => post.id !== id));
    }
  };

  // Open Edit Modal and load current data
  const handleStartEdit = (post) => {
    setActiveMenuId(null);
    setEditingPost(post);
    setEditTitle(post.title);
    setEditSnippet(post.snippet);
    setEditTags(Array.isArray(post.tags) ? post.tags : [post.tag || '#General']);
    setTagInput('');
  };

  // Edit Tag Handlers
  const toggleSuggestedTag = (tag) => {
    if (editTags.includes(tag)) {
      setEditTags(editTags.filter((t) => t !== tag));
    } else {
      setEditTags([...editTags, tag]);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      let formattedTag = tagInput.trim();
      if (!formattedTag) return;

      if (!formattedTag.startsWith('#')) {
        formattedTag = `#${formattedTag}`;
      }

      if (!editTags.includes(formattedTag)) {
        setEditTags([...editTags, formattedTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && editTags.length > 0) {
      setEditTags(editTags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setMyPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              title: editTitle.trim(),
              snippet: editSnippet.trim(),
              tags: editTags.length > 0 ? editTags : ['#General'],
            }
          : p
      )
    );
    setEditingPost(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900">My Posts</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage, edit, or delete the questions and resources you have shared.
        </p>
      </div>

      {/* Posts List */}
      {myPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-sm font-semibold text-gray-500">You haven't published any posts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/posts/${post.id}`)}
              className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all bg-white shadow-sm cursor-pointer relative"
            >
              {/* Header: Tags + Timestamp + Three-Dot Menu */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {(post.tags || [post.tag]).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold text-[#FF4F00] bg-[#FFF4F0] px-2.5 py-0.5 rounded-lg border border-orange-100"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 font-medium ml-1">{post.time}</span>
                </div>

                {/* Three-Dot Menu */}
                <div
                  className="relative"
                  ref={activeMenuId === post.id ? menuRef : null}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Options"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* Dropdown Options */}
                  {activeMenuId === post.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(post)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(e, post.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Copy Link
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug hover:text-[#FF4F00] transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {post.snippet}
              </p>

              {/* Bottom Controls: Upvote/Downvote Capsule + Comments + Share */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  
                  {/* Upvote & Downvote Control */}
                  <div
                    className="flex items-center gap-1.5 bg-[#FAFAFA] border border-gray-200 px-2 py-1 rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleVote(e, post.id, 'up')}
                      className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${
                        post.voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400'
                      }`}
                      title="Upvote"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    <span
                      className={`text-xs font-bold px-0.5 ${
                        post.voteState === 1
                          ? 'text-[#FF4F00]'
                          : post.voteState === -1
                          ? 'text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {post.upvotes}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleVote(e, post.id, 'down')}
                      className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${
                        post.voteState === -1 ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      title="Downvote"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Comments Count */}
                  <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{post.comments} comments</span>
                  </div>

                  {/* Share Action */}
                  <button
                    type="button"
                    onClick={(e) => handleShare(e, post.id)}
                    className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal with Advanced Tag Picker */}
      {editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs"
          onClick={() => setEditingPost(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Edit Post</h3>
                <p className="text-[11px] text-gray-400">Update your topic question, tags, or description</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00] transition-all"
                />
              </div>

              {/* Multi-Tag Input Box */}
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Edit Tags <span className="text-gray-400 font-normal normal-case">(Type and press Enter)</span>
                </label>

                <div className="flex items-center flex-wrap gap-2 w-full border border-gray-200 rounded-xl p-2.5 focus-within:border-[#FF4F00] bg-white min-h-[46px]">
                  {/* Suggested Quick Toggle Tags */}
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = editTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSuggestedTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 font-bold'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}

                  {/* Custom Added Tags */}
                  {editTags
                    .filter((tag) => !SUGGESTED_TAGS.includes(tag))
                    .map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 text-xs px-2.5 py-1 rounded-lg font-bold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-orange-400 hover:text-[#FF4F00] ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                  {/* Tag Input Field */}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={editTags.length > 0 ? "add more..." : "type tag & enter..."}
                    className="flex-1 min-w-[120px] text-xs text-gray-700 outline-none placeholder-gray-400 ml-1 bg-transparent"
                  />
                </div>
              </div>

              {/* Details Snippet */}
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Content Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={editSnippet}
                  onChange={(e) => setEditSnippet(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-3 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00] transition-all resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}