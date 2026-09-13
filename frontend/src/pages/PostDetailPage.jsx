import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { useAuth } from '@/context/AuthContext';

// Subcomponent for handling each individual comment thread
function CommentThread({ comment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(true);
  const [isReported, setIsReported] = useState(false);

  // Voting state for parent comment
  const [voteState, setVoteState] = useState(comment.initialVoted || 0);
  const [voteCount, setVoteCount] = useState(comment.votes || 0);

  // Active reply target
  const [replyingToUser, setReplyingToUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);

  const handleUpvote = () => {
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount((prev) => prev - 1);
    } else {
      setVoteCount((prev) => prev + (voteState === -1 ? 2 : 1));
      setVoteState(1);
    }
  };

  const handleDownvote = () => {
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount((prev) => prev + 1);
    } else {
      setVoteCount((prev) => prev - (voteState === 1 ? 2 : 1));
      setVoteState(-1);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      author: 'Srun Vireak',
      role: 'STUDENT',
      initials: 'SV',
      timestamp: 'Just now',
      replyingTo: replyingToUser?.name || comment.author,
      votes: 0,
      initialVoted: 0,
      text: replyText.trim(),
    };

    setReplies([...replies, newReply]);
    setReplyText('');
    setReplyingToUser(null);
    setShowAllReplies(true);
  };

  return (
    <div className="border-b border-gray-100 pb-5 sm:pb-6 last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="h-6 w-6 sm:h-7 sm:w-7 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[10px] sm:text-xs flex-shrink-0">
            {comment.initials}
          </div>
          <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">{comment.author}</span>
          <span
            className={`text-[8px] sm:text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide flex-shrink-0 ${
              comment.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {comment.role}
          </span>
          <span className="text-gray-400 text-[11px] sm:text-xs">{comment.timestamp}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsReported(!isReported)}
          title="Report comment"
          className={`p-1 rounded transition-colors group flex-shrink-0 cursor-pointer ${
            isReported ? 'text-red-600 bg-red-50' : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="pl-7 sm:pl-9 text-xs sm:text-sm text-gray-700">
        <div className={`space-y-2 sm:space-y-3 leading-relaxed break-words ${!isExpanded ? 'line-clamp-3 overflow-hidden' : ''}`}>
          {comment.body}
        </div>

        {comment.isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] sm:text-xs font-bold text-[#FF4F00] hover:underline mt-1.5 inline-block cursor-pointer"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}

        <div className="flex items-center gap-3 sm:gap-4 pt-2 text-gray-500 font-medium">
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-lg border border-gray-100">
            <button
              type="button"
              onClick={handleUpvote}
              className={`p-0.5 rounded transition-colors cursor-pointer ${
                voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-[11px] sm:text-xs font-bold px-0.5 ${voteState === 1 ? 'text-[#FF4F00]' : voteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {voteCount}
            </span>
            <button
              type="button"
              onClick={handleDownvote}
              className={`p-0.5 rounded transition-colors cursor-pointer ${
                voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setReplyingToUser(replyingToUser?.id === 'main' ? null : { id: 'main', name: comment.author })
            }
            className="hover:text-gray-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Reply
          </button>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-3 sm:mt-4 ml-4 sm:ml-9 pl-3 sm:pl-4 border-l-2 border-gray-100 space-y-3.5 sm:space-y-4">
          {showAllReplies &&
            replies.map((reply) => (
              <NestedReply
                key={reply.id}
                reply={reply}
                onReplyClick={(u) => setReplyingToUser(u)}
              />
            ))}

          <button
            type="button"
            onClick={() => setShowAllReplies(!showAllReplies)}
            className="text-[11px] sm:text-xs font-bold text-[#FF4F00] hover:text-[#E64700] transition-colors flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>{showAllReplies ? 'Hide replies' : `View ${replies.length} replies`}</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${showAllReplies ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {replyingToUser && (
        <form onSubmit={handleSendReply} className="mt-3 sm:mt-4 ml-4 sm:ml-9 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 truncate">
              Replying to <strong className="text-[#FF4F00]">@{replyingToUser.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingToUser(null)}
              className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <textarea
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Write your reply to ${replyingToUser.name}...`}
            className="w-full bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all min-h-[65px] resize-none"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setReplyingToUser(null)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                replyText.trim()
                  ? 'bg-[#FF4F00] hover:bg-[#E64700] shadow-xs cursor-pointer'
                  : 'bg-orange-200 cursor-not-allowed'
              }`}
            >
              Reply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function NestedReply({ reply, onReplyClick }) {
  const [isReported, setIsReported] = useState(false);
  const [voteState, setVoteState] = useState(reply.initialVoted || 0);
  const [voteCount, setVoteCount] = useState(reply.votes || 0);

  const handleUpvote = () => {
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount((prev) => prev - 1);
    } else {
      setVoteCount((prev) => prev + (voteState === -1 ? 2 : 1));
      setVoteState(1);
    }
  };

  const handleDownvote = () => {
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount((prev) => prev + 1);
    } else {
      setVoteCount((prev) => prev - (voteState === 1 ? 2 : 1));
      setVoteState(-1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[9px] sm:text-[10px] flex-shrink-0">
            {reply.initials}
          </div>
          <span className="font-bold text-gray-900 text-xs truncate">{reply.author}</span>
          <span
            className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide flex-shrink-0 ${
              reply.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {reply.role}
          </span>
          <span className="text-gray-400 text-[10px] sm:text-[11px]">{reply.timestamp}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsReported(!isReported)}
          title="Report reply"
          className={`p-0.5 rounded transition-colors group flex-shrink-0 cursor-pointer ${
            isReported ? 'text-red-600 bg-red-50' : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="pl-6 sm:pl-8 text-xs text-gray-700 leading-relaxed break-words">
        <p>
          {reply.replyingTo && (
            <span className="text-[#FF4F00] font-bold mr-1.5">@{reply.replyingTo}</span>
          )}
          {reply.text}
        </p>

        <div className="flex items-center gap-2.5 sm:gap-3 pt-1.5 text-gray-500 font-medium">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
            <button
              type="button"
              onClick={handleUpvote}
              className={`p-0.5 transition-colors cursor-pointer ${
                voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-[10px] sm:text-[11px] font-bold px-0.5 ${voteState === 1 ? 'text-[#FF4F00]' : voteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {voteCount}
            </span>
            <button
              type="button"
              onClick={handleDownvote}
              className={`p-0.5 transition-colors cursor-pointer ${
                voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onReplyClick({ id: reply.id, name: reply.author })}
            className="hover:text-gray-900 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load post dynamically based on active session
  const [post, setPost] = useState(() => {
    // If id is 1 or no id, post belongs to active user
    const isPost1 = !id || id === '1';

    if (isPost1) {
      return {
        id: 1,
        userId: user?.id || 'usr_cadt_01',
        author: user?.displayName || 'Srun Vireak',
        authorEmail: user?.email || 'srun.vireak@student.cadt.edu.kh',
        authorHandle: user?.handle || 'srunvireak',
        role: user?.role || 'STUDENT',
        initials: user?.initials || 'SV',
        timestamp: '3h ago',
        tag: '#SQL',
        tags: ['#SQL', '#Database Design'],
        title: 'How do I implement a CREATE VIEW statement for a multi-table database dashboard?',
        content:
          "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
        image_url: null,
      };
    }

    // Other posts belong to peers (e.g., Kwame Mensah)
    return {
      id: Number(id),
      userId: 'usr_cadt_kwame',
      author: 'Kwame Mensah',
      authorEmail: 'kwame.mensah@student.cadt.edu.kh',
      authorHandle: 'kwamemensah',
      role: 'STUDENT',
      initials: 'KM',
      timestamp: '5h ago',
      tag: '#C++',
      tags: ['#C++', '#Algorithms'],
      title: 'Guide: Common pointer pitfalls when building dynamic arrays from scratch',
      content:
        'A quick cheat sheet summarizing double free errors, dangling pointers, and memory leaks with diagram examples from our lab 3 exercises.',
      image_url: null,
    };
  });

  // Sync post author metadata if active user logs in or updates
  useEffect(() => {
    if ((!id || id === '1') && user) {
      setPost((prev) => ({
        ...prev,
        userId: user.id || prev.userId,
        author: user.displayName || prev.author,
        authorEmail: user.email || prev.authorEmail,
        authorHandle: user.handle || prev.authorHandle,
        initials: user.initials || prev.initials,
        role: user.role || prev.role,
      }));
    }
  }, [id, user]);

  const authorProfileSlug = useMemo(() => {
    return post.authorHandle || (post.author ? post.author.toLowerCase().replace(/\s+/g, '') : 'user');
  }, [post.authorHandle, post.author]);

  // Robust ownership matching identical to PostCard.jsx
  const isOwner = useMemo(() => {
    if (!user) return false;

    const matchId = post.userId && user.id === post.userId;
    const matchName = post.author && user.displayName?.trim().toLowerCase() === post.author?.trim().toLowerCase();
    const matchEmail = post.authorEmail && user.email?.trim().toLowerCase() === post.authorEmail?.trim().toLowerCase();
    const matchHandle = user.handle && authorProfileSlug.toLowerCase() === user.handle.toLowerCase();

    return Boolean(matchId || matchName || matchEmail || matchHandle);
  }, [user, post.userId, post.author, post.authorEmail, user?.handle, authorProfileSlug]);

  // Menu & Modal states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Post Interaction States
  const [postVoteState, setPostVoteState] = useState(0);
  const [postVoteCount, setPostVoteCount] = useState(124);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sortBy, setSortBy] = useState('top');

  const handlePostUpvote = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (postVoteState === 1) {
      setPostVoteState(0);
      setPostVoteCount((prev) => prev - 1);
    } else {
      setPostVoteCount((prev) => prev + (postVoteState === -1 ? 2 : 1));
      setPostVoteState(1);
    }
  };

  const handlePostDownvote = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (postVoteState === -1) {
      setPostVoteState(0);
      setPostVoteCount((prev) => prev + 1);
    } else {
      setPostVoteCount((prev) => prev - (postVoteState === 1 ? 2 : 1));
      setPostVoteState(-1);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setIsMenuOpen(false);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmDelete = () => {
    navigate('/');
  };

  const handleSavePost = (updatedPayload) => {
    setPost((prev) => ({
      ...prev,
      title: updatedPayload.title,
      content: updatedPayload.content,
      tags: updatedPayload.tags,
      image_url: updatedPayload.imagePreview || prev.image_url,
    }));
  };

  const commentsData = [
    {
      id: 1,
      author: 'Prof. James Carver',
      role: 'PROFESSOR',
      initials: 'JC',
      timestamp: '2h ago',
      votes: 98,
      initialVoted: 0,
      isLong: true,
      body: (
        <p>
          Great question! The three-table join is straightforward — just chain another JOIN. The more important question is whether you need a materialized view. For a dashboard that reads frequently but updates rarely, materialization can cut query time significantly.
        </p>
      ),
      replies: [
        {
          id: 101,
          author: 'Kwame Mensah',
          role: 'STUDENT',
          initials: 'KM',
          timestamp: '1h 30m ago',
          replyingTo: null,
          votes: 27,
          initialVoted: 1,
          text: "This is exactly what I needed. The distinction between regular and materialized views makes a lot more sense now. Would a session help me understand when the query planner's estimate is wrong? That's where I keep getting tripped up.",
        },
      ],
    },
  ];

  return (
    <ThreeColumnLayout>
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Breadcrumb Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to feed</span>
        </Link>

        {/* Main Post Card */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-6">
            
            {/* Header: Author + Options / Request CTA */}
            <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <Link
                  to={`/user/${authorProfileSlug}`}
                  className="h-9 w-9 sm:h-10 sm:w-10 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-xs sm:text-sm flex-shrink-0 hover:ring-2 hover:ring-offset-2 hover:ring-gray-800 transition-all"
                >
                  {post.initials}
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <Link
                      to={`/user/${authorProfileSlug}`}
                      className="font-bold text-gray-900 text-xs sm:text-sm hover:text-[#FF4F00] transition-colors truncate"
                    >
                      {post.author}
                    </Link>
                    <span className="bg-purple-50 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-purple-100 flex-shrink-0">
                      {post.role}
                    </span>
                  </div>
                  <div className="flex items-center text-[11px] sm:text-xs mt-0.5 text-gray-400">
                    <span className="text-[#FF4F00] font-bold">{post.tag}</span>
                    <span className="mx-1.5">•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Top Right: CTA (If not owner) + Three-Dot Menu */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isOwner && (
                  <button 
                    type="button"
                    onClick={() => navigate(`/user/${authorProfileSlug}`)}
                    className="text-[#FF4F00] border border-[#FF4F00] rounded-xl px-3 sm:px-4 py-1.5 text-xs font-bold hover:bg-orange-50 active:bg-orange-100 transition-colors cursor-pointer"
                  >
                    Request Session
                  </button>
                )}

                {/* Three-Dot Options Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="More options"
                    aria-label="More post options"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsEditModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Post</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsDeleteModalOpen(true);
                            }}
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
                            onClick={() => {
                              setIsReported(true);
                              setIsMenuOpen(false);
                              alert('Thank you. This post has been flagged for moderator review.');
                            }}
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
            </div>

            {/* Post Title & Content */}
            <h1 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-snug break-words">
              {post.title}
            </h1>

            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words space-y-3">
              <p>{post.content}</p>
            </div>

            {/* Attached Image */}
            {post.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 max-h-72 sm:max-h-96 bg-gray-50 flex items-center justify-center">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Post Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-100 bg-white text-gray-500 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Voting Capsule */}
              <div className="flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-gray-100">
                <button 
                  type="button"
                  onClick={handlePostUpvote} 
                  className={`p-0.5 sm:p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer ${
                    postVoteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400'
                  }`}
                  title="Upvote"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <span className={`text-[11px] sm:text-xs font-bold px-0.5 ${
                  postVoteState === 1 ? 'text-[#FF4F00]' : postVoteState === -1 ? 'text-blue-500' : 'text-gray-700'
                }`}>
                  {postVoteCount}
                </span>

                <button 
                  type="button"
                  onClick={handlePostDownvote} 
                  className={`p-0.5 sm:p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer ${
                    postVoteState === -1 ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  title="Downvote"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Comments Count */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-500 font-semibold">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>2 comments</span>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold hover:text-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="hidden xs:inline">{isCopied ? 'Copied!' : 'Share'}</span>
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isSaved ? 'text-[#FF4F00] font-bold' : 'hover:text-gray-800'
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
                <span className="hidden xs:inline">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Comment Box */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <textarea
            rows={3}
            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all min-h-[80px] sm:min-h-[90px] resize-none mb-3"
            placeholder="Share your knowledge or ask a follow-up..."
          />
          <div className="flex justify-end">
            <button 
              type="button"
              className="w-full sm:w-auto bg-[#FF4F00] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#E64700] active:scale-98 transition-all shadow-xs cursor-pointer text-center"
            >
              Comment
            </button>
          </div>
        </div>

        {/* Sort Filter Tabs */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm font-medium pt-1">
          <span className="text-gray-400 text-xs">Sort by:</span>
          <div className="flex items-center gap-1 bg-[#FAFAFA] border border-gray-200 p-1 rounded-xl">
            {['top', 'new', 'controversial'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSortBy(tab)}
                className={`capitalize px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === tab
                    ? 'bg-[#FF4F00] text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
          {commentsData.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </div>
      </div>

      {/* Edit Post Modal */}
      <CreatePostModal
        isOpen={isEditModalOpen}
        initialData={post}
        onClose={() => setIsEditModalOpen(false)}
        onPublish={handleSavePost}
      />

      {/* Delete Confirmation Modal */}
      <DeletePostModal
        isOpen={isDeleteModalOpen}
        postTitle={post.title}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </ThreeColumnLayout>
  );
}