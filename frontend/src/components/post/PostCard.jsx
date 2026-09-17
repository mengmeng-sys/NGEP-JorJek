import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { ReportModal } from '@/components/shared/ReportModal';
import { votesApi, reportsApi, postsApi } from '@/lib/api';
import { copyToClipboard } from '@/lib/clipboard';

export function PostCard({ post, onToggleSave, onDelete, onEdit }) {
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();

  const initials = post.author
    ? post.author.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U';
  const userProfileSlug = post.author
    ? post.author.toLowerCase().replace(/\s+/g, '')
    : 'user';

  // Robust ownership check
  const isOwner = Boolean(
    user && (
      (post.userId && user.id === post.userId) ||
      (post.author && user.displayName?.toLowerCase() === post.author.toLowerCase()) ||
      (post.authorEmail && user.email?.toLowerCase() === post.authorEmail.toLowerCase()) ||
      (user.handle && userProfileSlug === user.handle.toLowerCase())
    )
  );

  // Interaction states
  const [voteState, setVoteState] = useState(post.hasUpvoted ? 1 : 0);
  const [voteCount, setVoteCount] = useState(post.upvotes || 0);
  const [voteTotal, setVoteTotal] = useState(post.voteTotal || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [saveCount, setSaveCount] = useState(post.saves || 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { on, off, joinPost, leavePost } = useSocket();

  // Close dropdown on outside click
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (post.upvotes !== undefined) {
      setVoteCount(post.upvotes);
    }
  }, [post.upvotes]);

  useEffect(() => {
    if (post.voteTotal !== undefined) {
      setVoteTotal(post.voteTotal);
    }
  }, [post.voteTotal]);

  useEffect(() => {
    if (post.comments !== undefined) {
      setCommentCount(post.comments);
    }
  }, [post.comments]);

  useEffect(() => {
    if (post.saves !== undefined) {
      setSaveCount(post.saves);
    }
  }, [post.saves]);

  useEffect(() => {
    setIsSaved(post.isSaved || false);
  }, [post.isSaved]);

  useEffect(() => {
    joinPost(post.id);

    const handleVoteUpdate = ({ target, id: targetId, value, voterId, removed, isNew }) => {
      if (voterId === user?.id) return;
      if (target === "post" && targetId === post.id) {
        setVoteCount((prev) => removed ? prev - value : prev + value);
        if (removed) {
          setVoteTotal((prev) => Math.max(0, prev - 1));
        } else if (isNew) {
          setVoteTotal((prev) => prev + 1);
        }
      }
    };

    const handleNewComment = (comment) => {
      if (comment.postId === post.id || comment.post_id === post.id) {
        setCommentCount((prev) => prev + 1);
      }
    };

    const handleCommentDeleted = ({ id: deletedId, postId }) => {
      if (postId && postId !== post.id) return;
      setCommentCount((prev) => Math.max(0, prev - 1));
    };

    const handleSaveUpdate = ({ postId, saves }) => {
      if (postId === post.id) {
        setSaveCount(saves);
      }
    };

    on("vote_update", handleVoteUpdate);
    on("new_comment", handleNewComment);
    on("comment_deleted", handleCommentDeleted);
    on("save_update", handleSaveUpdate);
    return () => {
      off("vote_update", handleVoteUpdate);
      off("new_comment", handleNewComment);
      off("comment_deleted", handleCommentDeleted);
      off("save_update", handleSaveUpdate);
      leavePost(post.id);
    };
  }, [on, off, joinPost, leavePost, post.id, user?.id]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const prevState = voteState;
    const prevCount = voteCount;
    const prevTotal = voteTotal;
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount((prev) => prev - 1);
      setVoteTotal((prev) => Math.max(0, prev - 1));
    } else if (voteState === -1) {
      setVoteState(0);
      setVoteCount((prev) => prev + 1);
      setVoteTotal((prev) => Math.max(0, prev - 1));
    } else {
      setVoteState(1);
      setVoteCount((prev) => prev + 1);
      setVoteTotal((prev) => prev + 1);
    }
    try {
      if (prevState === 1 || prevState === -1) {
        await votesApi.remove({ postId: post.id });
      } else {
        await votesApi.cast({ postId: post.id }, 1);
        markOnboardingComplete('hasUpvoted');
      }
    } catch {
      setVoteState(prevState);
      setVoteCount(prevCount);
      setVoteTotal(prevTotal);
      alert('Could not update your vote. Please try again.');
    }
  };

  const handleDownvote = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const prevState = voteState;
    const prevCount = voteCount;
    const prevTotal = voteTotal;
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount((prev) => prev + 1);
      setVoteTotal((prev) => Math.max(0, prev - 1));
    } else if (voteState === 1) {
      setVoteState(0);
      setVoteCount((prev) => prev - 1);
      setVoteTotal((prev) => Math.max(0, prev - 1));
    } else {
      setVoteState(-1);
      setVoteCount((prev) => prev - 1);
      setVoteTotal((prev) => prev + 1);
    }
    try {
      if (prevState === -1 || prevState === 1) {
        await votesApi.remove({ postId: post.id });
      } else {
        await votesApi.cast({ postId: post.id }, -1);
      }
    } catch {
      setVoteState(prevState);
      setVoteCount(prevCount);
      setVoteTotal(prevTotal);
      alert('Could not update your vote. Please try again.');
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const updated = !isSaved;
    const prev = isSaved;
    setIsSaved(updated);
    if (onToggleSave) onToggleSave(post.id, updated);
    try {
      if (updated) {
        await postsApi.save(post.id);
        markOnboardingComplete('hasSaved');
      } else {
        await postsApi.unsave(post.id);
      }
    } catch {
      setIsSaved(prev);
      alert('Could not update saved posts. Please try again.');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDelete) onDelete(post.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onEdit) onEdit(post);
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (!user) {
      navigate('/auth/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason) => {
    await reportsApi.create({ postId: post.id, reason });
    setIsReported(true);
    setIsReportModalOpen(false);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const url = `${window.location.origin}/posts/${post.id}`;
    const ok = await copyToClipboard(url);
    alert(ok ? 'Post link copied to clipboard!' : 'Could not copy the link. Please copy the URL manually.');
  };

  const postTags = post.tags || (post.tag ? [post.tag.replace(/^#/, '')] : []);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const isLongContent = post.content?.split(/\s+/).length > 30;

  return (
    <div
      onClick={() => navigate(`/posts/${post.id}`)}
      className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs mb-3.5 sm:mb-4 cursor-pointer hover:border-gray-300 transition-all"
    >
      <div className="p-4 sm:p-5">
        {/* Top Header: Author Metadata & Action Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              to={`/user/${userProfileSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-9 sm:h-10 sm:w-10 bg-[#111827] text-white font-black flex items-center justify-center rounded-full text-xs hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all shrink-0 overflow-hidden"
            >
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.author || 'Author'} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Link
                  to={`/user/${userProfileSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-gray-900 text-xs sm:text-sm hover:text-[#FF4F00] transition-colors truncate max-w-32.5 sm:max-w-50"
                >
                  {post.author}
                </Link>

                <span className="bg-purple-50 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded border border-purple-100 shrink-0">
                  {post.role || 'STUDENT'}
                </span>
              </div>

              <div className="flex items-center text-[11px] sm:text-xs mt-0.5 text-gray-400">
                <span className="text-[#FF4F00] font-bold truncate">
                  #{postTags[0] || 'General'}
                </span>
                <span className="mx-1.5">•</span>
                <span className="shrink-0">{post.timestamp || 'recently'}</span>
              </div>
            </div>
          </div>

          {/* Three Dots Menu Button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="More options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Dropdown Options */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Post</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left border-t border-gray-50"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Post</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Copy Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReport}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{isReported ? 'Reported' : 'Report Post'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Title & Content */}
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 leading-snug hover:text-[#FF4F00] transition-colors wrap-break-words">
          {post.title}
        </h2>
        {post.content ? (
          <div className="relative mb-3">
            <p className={`text-xs sm:text-sm text-gray-500 leading-relaxed wrap-break-words ${isLongContent && !isContentExpanded ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
            {isLongContent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsContentExpanded(!isContentExpanded);
                }}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4F00] hover:text-orange-700 transition-colors cursor-pointer"
              >
                {isContentExpanded ? (
                  <>
                    See less
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    See more
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}

        {/* Image Attachment (if present) */}
        {post.image_url && (
          <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full max-h-56 sm:max-h-80 object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Tag Badges */}
        {postTags.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-2">
            {postTags.map((t) => (
              <span
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/?tag=${encodeURIComponent(t.replace(/^#/, ''))}`);
                }}
                className="bg-orange-50 border border-orange-100 text-[#FF4F00] text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md hover:bg-orange-100 transition-colors cursor-pointer"
              >
                #{t.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 sm:gap-3.5 text-gray-500 font-medium text-xs sm:text-sm">
          {/* Voting Box */}
          <div
            className="flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
             <button
               type="button"
               onClick={handleUpvote}
               className={`vote-pop p-0.5 sm:p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer ${
                 voteState === 1 ? 'text-blue-500' : 'text-gray-400'
               }`}
               title="Upvote"
             >
               <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M2 20h2V8H2v12zm20-12c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 0 7.59 5.59C7.22 5.95 7 6.45 7 7v11c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V8z"/>
               </svg>
             </button>

             <span className={`text-[11px] sm:text-xs font-bold px-0.5 ${
               voteState === 1 ? 'text-blue-500' : voteState === -1 ? 'text-[#FF4F00]' : 'text-gray-700'
             }`}>
               {voteCount}
             </span>

             <button
               type="button"
               onClick={handleDownvote}
               className={`vote-pop p-0.5 sm:p-1 rounded hover:bg-orange-50 transition-colors cursor-pointer ${
                 voteState === -1 ? 'text-[#FF4F00]' : 'text-gray-400'
               }`}
               title="Downvote"
             >
               <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M2 4h2v12H2V4zm20 12c0 1.1-.9 2-2 2h-6.31l.95 4.57.03.32c0 .41-.17.79-.44 1.06L13.17 24l-5.59-5.59c-.36-.36-.58-.86-.58-1.41V7c0-1.1.9-2 2-2h9c.83 0 1.54.5 1.84 1.22l3.02 7.05c.09.23.14.47.14.73v1z"/>
               </svg>
             </button>
          </div>

          {/* Comments Link */}
          <div className="flex items-center gap-1 sm:gap-1.5 hover:text-gray-700 transition-colors">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-[11px] sm:text-xs">{commentCount}</span>
          </div>

          {/* Total Votes */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[11px] sm:text-xs text-gray-500">
              {voteTotal} {voteTotal === 1 ? 'vote' : 'votes'}
            </span>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 sm:gap-1.5 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="hidden xs:inline text-[11px] sm:text-xs">Share</span>
          </button>

          {/* Save/Bookmark */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer ${
              isSaved ? 'text-[#FF4F00] font-bold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill={isSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
             <span className="hidden xs:inline text-[11px] sm:text-xs">{saveCount > 0 ? `${saveCount}` : 'Save'}</span>
          </button>
        </div>

        {/* Action Button: only when author opted into mentoring requests */}
        {!isOwner && post.allowMentoring && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/request-session/${post.userId || ''}`);
            }}
            className="text-[#FF4F00] bg-white border border-[#FF4F00] rounded-xl px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold hover:bg-orange-50 transition-colors whitespace-nowrap ml-auto sm:ml-0 cursor-pointer active:scale-95"
          >
            Request Mentoring
          </button>
        )}
      </div>

      <ReportModal
        targetType="post"
        targetName={post.author}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}