import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PostCard({ post, onToggleSave }) {
  const navigate = useNavigate();
  const initials = post.author.split(' ').map(n => n[0]).join('').toUpperCase();

  // Vote states: 1 (upvoted), -1 (downvoted), 0 (neutral)
  const [voteState, setVoteState] = useState(post.hasUpvoted ? 1 : 0);
  const [voteCount, setVoteCount] = useState(post.upvotes || 124);

  // Save state
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

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
    if (onToggleSave) {
      onToggleSave(post.id, updated);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/posts/${post.id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4 cursor-pointer hover:border-gray-300 transition-all"
    >
      {/* Author & Header */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">{post.author}</span>
              <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">
                {post.role}
              </span>
            </div>
            <div className="flex items-center text-xs mt-0.5">
              <span className="text-[#FF4F00] font-bold">#{post.tags ? post.tags[0] : 'General'}</span>
              <span className="text-gray-400 ml-2">{post.timestamp || '3h ago'}</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug hover:text-[#FF4F00] transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
          
          {/* Voting Box */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100" onClick={(e) => e.stopPropagation()}>
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

          {/* Comments */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>{post.comments}</span>
          </div>

          {/* Share */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Share</span>
          </div>

          {/* Interactive Save Toggle Button */}
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
          onClick={(e) => e.stopPropagation()}
          className="text-[#FF4F00] bg-white border border-[#FF4F00] rounded-lg px-4 py-1.5 text-sm font-bold hover:bg-orange-50 transition-colors"
        >
          Request Mentoring
        </button>
      </div>
    </div>
  );
}