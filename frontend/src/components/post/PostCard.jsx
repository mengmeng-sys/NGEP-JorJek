import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PostCard({ post, onToggleSave, onDelete, onEdit }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = post.author ? post.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const userProfileSlug = post.author ? post.author.toLowerCase().replace(/\s+/g, '') : 'user';

  // Check ownership
  const isOwner = Boolean(
    user && (
      user.id === post.userId || 
      user.displayName === post.author || 
      user.email === post.authorEmail
    )
  );

  // Interaction states
  const [voteState, setVoteState] = useState(post.hasUpvoted ? 1 : 0);
  const [voteCount, setVoteCount] = useState(post.upvotes || 124);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);

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

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount(voteCount - 1);
    } else {
      setVoteCount(voteCount + (voteState === -1 ? 2 : 1));
      setVoteState(1);
    }
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount(voteCount + 1);
    } else {
      setVoteCount(voteCount - (voteState === 1 ? 2 : 1));
      setVoteState(-1);
    }
  };

  const handleSaveToggle = (e) => {
    e.stopPropagation();
    const updated = !isSaved;
    setIsSaved(updated);
    if (onToggleSave) onToggleSave(post.id, updated);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (onDelete) onDelete(post.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onEdit) onEdit(post);
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setIsReported(true);
    setIsMenuOpen(false);
    alert('Thank you. This post has been flagged for moderator review.');
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    alert('Post link copied to clipboard!');
  };

  return (
    <div 
      onClick={() => navigate(`/posts/${post.id}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4 cursor-pointer hover:border-gray-300 transition-all"
    >
      <div className="p-5">
        
        {/* Top Header: Author Info + Three-Dot Action Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/user/${userProfileSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="h-10 w-10 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-xs hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all flex-shrink-0"
            >
              {initials}
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/${userProfileSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-gray-900 text-sm hover:text-[#FF4F00] transition-colors"
                >
                  {post.author}
                </Link>

                <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">
                  {post.role || 'STUDENT'}
                </span>
              </div>

              <div className="flex items-center text-xs mt-0.5">
                <span className="text-[#FF4F00] font-bold">
                  #{post.tags ? post.tags[0] : post.tag ? post.tag.replace('#', '') : 'General'}
                </span>
                <span className="text-gray-400 ml-2">{post.timestamp || '3h ago'}</span>
              </div>
            </div>
          </div>

          {/* Three Dots Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="More options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Dropdown Options */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                {isOwner ? (
                  // Owner Menu
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Post
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Post
                    </button>
                  </>
                ) : (
                  // Viewer Menu
                  <>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Copy Link
                    </button>

                    <button
                      type="button"
                      onClick={handleReport}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {isReported ? 'Reported' : 'Report Post'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Title & Content */}
        <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug hover:text-[#FF4F00] transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {post.content}
        </p>

        {post.image_url && (
          <div className="mt-2 mb-3 rounded-xl overflow-hidden border border-gray-100 max-h-80 bg-gray-50">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
          
          {/* Voting Box */}
          <div 
            className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleUpvote}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <span className={`text-xs font-bold ${voteState === 1 ? 'text-[#FF4F00]' : voteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {voteCount}
            </span>

            <button 
              onClick={handleDownvote}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${voteState === -1 ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Comments Count */}
          <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>{post.comments}</span>
          </div>

          {/* Share */}
          <div 
            onClick={handleCopyLink} 
            className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Share</span>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`flex items-center gap-1.5 transition-colors ${
              isSaved ? 'text-[#FF4F00] font-bold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg 
              className="w-4 h-4" 
              fill={isSaved ? 'currentColor' : 'none'} 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Save</span>
          </button>
        </div>

        {/* Request Mentoring */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/user/${userProfileSlug}`);
          }}
          className="text-[#FF4F00] bg-white border border-[#FF4F00] rounded-xl px-4 py-1.5 text-xs font-bold hover:bg-orange-50 transition-colors"
        >
          Request Mentoring
        </button>
      </div>
    </div>
  );
}