import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

// Subcomponent for handling each individual comment thread
function CommentThread({ comment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(true);
  const [isReported, setIsReported] = useState(false);

  // Voting state for main parent comment
  const [voteState, setVoteState] = useState(comment.initialVoted || 0);
  const [voteCount, setVoteCount] = useState(comment.votes);

  // Active reply target
  const [replyingToUser, setReplyingToUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);

  const handleUpvote = () => {
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount(voteCount - 1);
    } else {
      setVoteCount(voteCount + (voteState === -1 ? 2 : 1));
      setVoteState(1);
    }
  };

  const handleDownvote = () => {
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount(voteCount + 1);
    } else {
      setVoteCount(voteCount - (voteState === 1 ? 2 : 1));
      setVoteState(-1);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      author: 'Yola Osei',
      role: 'STUDENT',
      initials: 'YO',
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
    <div className="border-b border-gray-100 pb-6 last:border-b-0">
      {/* 1. Main Comment Author Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-xs">
            {comment.initials}
          </div>
          <span className="font-bold text-gray-900 text-sm">{comment.author}</span>
          <span
            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
              comment.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {comment.role}
          </span>
          <span className="text-gray-400 text-xs ml-1">{comment.timestamp}</span>
        </div>

        {/* Warning Sign */}
        <button
          onClick={() => setIsReported(!isReported)}
          title="Report comment"
          className={`p-1 rounded transition-colors group ${
            isReported ? 'text-red-600 bg-red-50' : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Main Comment Body */}
      <div className="pl-9 text-sm text-gray-700">
        <div className={`space-y-3 leading-relaxed ${!isExpanded ? 'line-clamp-3 overflow-hidden' : ''}`}>
          {comment.body}
        </div>

        {comment.isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-[#FF4F00] hover:underline mt-1.5 inline-block"
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>
        )}

        {/* Main Comment Action Row */}
        <div className="flex items-center gap-4 pt-2.5 text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            <button
              onClick={handleUpvote}
              className={`p-0.5 rounded transition-colors ${
                voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-xs font-bold ${voteState === 1 ? 'text-[#FF4F00]' : voteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {voteCount}
            </span>
            <button
              onClick={handleDownvote}
              className={`p-0.5 rounded transition-colors ${
                voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() =>
              setReplyingToUser(replyingToUser?.id === 'main' ? null : { id: 'main', name: comment.author })
            }
            className="hover:text-gray-900 text-xs font-semibold transition-colors"
          >
            Reply
          </button>
        </div>
      </div>

      {/* 2. Nested Sub-Replies */}
      {replies.length > 0 && (
        <div className="mt-4 ml-9 pl-4 border-l-2 border-gray-100 space-y-4">
          {showAllReplies &&
            replies.map((reply) => (
              <NestedReply
                key={reply.id}
                reply={reply}
                onReplyClick={(user) => setReplyingToUser(user)}
              />
            ))}

          <button
            onClick={() => setShowAllReplies(!showAllReplies)}
            className="text-xs font-bold text-[#FF4F00] hover:text-[#E64700] transition-colors flex items-center gap-1 pt-1"
          >
            <span>{showAllReplies ? 'Hide replies' : `View ${replies.length} replies`}</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${showAllReplies ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* 3. Dynamic Inline Reply Box */}
      {replyingToUser && (
        <form onSubmit={handleSendReply} className="mt-4 ml-9 bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              Replying to <strong className="text-[#FF4F00]">@{replyingToUser.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyingToUser(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <textarea
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Write your reply to ${replyingToUser.name}...`}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[70px] resize-none"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setReplyingToUser(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                replyText.trim()
                  ? 'bg-[#FF4F00] hover:bg-[#E64700] shadow-sm'
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

// Subcomponent for each nested reply item
function NestedReply({ reply, onReplyClick }) {
  const [isReported, setIsReported] = useState(false);
  const [voteState, setVoteState] = useState(reply.initialVoted || 0);
  const [voteCount, setVoteCount] = useState(reply.votes);

  const handleUpvote = () => {
    if (voteState === 1) {
      setVoteState(0);
      setVoteCount(voteCount - 1);
    } else {
      setVoteCount(voteCount + (voteState === -1 ? 2 : 1));
      setVoteState(1);
    }
  };

  const handleDownvote = () => {
    if (voteState === -1) {
      setVoteState(0);
      setVoteCount(voteCount + 1);
    } else {
      setVoteCount(voteCount - (voteState === 1 ? 2 : 1));
      setVoteState(-1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[10px]">
            {reply.initials}
          </div>
          <span className="font-bold text-gray-900 text-xs">{reply.author}</span>
          <span
            className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
              reply.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {reply.role}
          </span>
          <span className="text-gray-400 text-[11px] ml-1">{reply.timestamp}</span>
        </div>

        <button
          onClick={() => setIsReported(!isReported)}
          title="Report reply"
          className={`p-0.5 rounded transition-colors group ${
            isReported ? 'text-red-600 bg-red-50' : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="pl-8 text-xs text-gray-700 leading-relaxed">
        <p>
          {reply.replyingTo && (
            <span className="text-[#FF4F00] font-bold mr-1.5">@{reply.replyingTo}</span>
          )}
          {reply.text}
        </p>

        <div className="flex items-center gap-3 pt-2 text-gray-500 font-medium">
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
            <button
              onClick={handleUpvote}
              className={`transition-colors ${
                voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-[11px] font-bold ${voteState === 1 ? 'text-[#FF4F00]' : voteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {voteCount}
            </span>
            <button
              onClick={handleDownvote}
              className={`transition-colors ${
                voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => onReplyClick({ id: reply.id, name: reply.author })}
            className="hover:text-gray-900 text-[11px] font-semibold transition-colors"
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

  // Post Interaction States
  const [postVoteState, setPostVoteState] = useState(0); // 1, -1, or 0
  const [postVoteCount, setPostVoteCount] = useState(124);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handlePostUpvote = () => {
    if (postVoteState === 1) {
      setPostVoteState(0);
      setPostVoteCount(postVoteCount - 1);
    } else {
      setPostVoteCount(postVoteCount + (postVoteState === -1 ? 2 : 1));
      setPostVoteState(1);
    }
  };

  const handlePostDownvote = () => {
    if (postVoteState === -1) {
      setPostVoteState(0);
      setPostVoteCount(postVoteCount + 1);
    } else {
      setPostVoteCount(postVoteCount - (postVoteState === 1 ? 2 : 1));
      setPostVoteState(-1);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
        {
          id: 102,
          author: 'Dr. Yuki Tanaka',
          role: 'PROFESSOR',
          initials: 'YT',
          timestamp: '1h 10m ago',
          replyingTo: 'Kwame Mensah',
          votes: 15,
          initialVoted: 0,
          text: 'I can join this session as well to walk through the EXPLAIN output with both of you.',
        },
      ],
    },
    {
      id: 2,
      author: 'Dr. Yuki Tanaka',
      role: 'PROFESSOR',
      initials: 'YT',
      timestamp: '1h 45m ago',
      votes: 61,
      initialVoted: 0,
      isLong: false,
      body: (
        <p>
          One thing worth adding — if this is for a live dashboard, consider using REFRESH MATERIALIZED VIEW CONCURRENTLY so reads aren't blocked during refresh. You'll need a unique index on the view for this to work. Also worth examining your indexes on the foreign key columns before worrying about join order.
        </p>
      ),
      replies: [],
    },
  ];

  return (
    <ThreeColumnLayout>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to feed
      </Link>

      {/* Main Post Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-sm">
                KM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Kwame Mensah</span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">
                    STUDENT
                  </span>
                </div>
                <div className="flex items-center text-xs mt-0.5">
                  <span className="text-[#FF4F00] font-bold">#SQL</span>
                  <span className="text-gray-400 ml-2">3h ago</span>
                </div>
              </div>
            </div>
            <button className="text-[#FF4F00] border border-[#FF4F00] rounded-xl px-4 py-1.5 text-sm font-bold hover:bg-orange-50 transition-colors">
              Request Session
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
            How do I implement a CREATE VIEW statement for a multi-table database dashboard?
          </h1>

          <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
            <p>
              I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.
            </p>
          </div>
        </div>

        {/* Post Bottom Controls: Votes + Comments + Share + Save */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-gray-500 text-sm font-medium">
          <div className="flex items-center gap-5">
            {/* Voting Capsule */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
              <button 
                onClick={handlePostUpvote} 
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  postVoteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400'
                }`}
                title="Upvote"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>

              <span className={`text-xs font-bold ${
                postVoteState === 1 ? 'text-[#FF4F00]' : postVoteState === -1 ? 'text-blue-500' : 'text-gray-700'
              }`}>
                {postVoteCount}
              </span>

              <button 
                onClick={handlePostDownvote} 
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  postVoteState === -1 ? 'text-blue-500' : 'text-gray-400'
                }`}
                title="Downvote"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Comments Count */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>3 comments</span>
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{isCopied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isSaved ? 'text-[#FF4F00] font-bold' : 'hover:text-gray-800'
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
        </div>
      </div>

      {/* Main Comment Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[90px] resize-none mb-3"
          placeholder="Share your knowledge or ask a follow-up..."
        ></textarea>
        <div className="flex justify-end">
          <button className="bg-[#FF4F00] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#E64700] transition-colors shadow-sm">
            Comment
          </button>
        </div>
      </div>

      {/* Sort Filter Tabs */}
      <div className="flex items-center gap-5 text-sm font-medium mb-6">
        <span className="text-gray-400">Sort:</span>
        <button className="bg-[#FF4F00] text-white px-3 py-1 rounded-lg font-bold">Top</button>
        <button className="text-gray-500 hover:text-gray-900 transition-colors">New</button>
        <button className="text-gray-500 hover:text-gray-900 transition-colors">Controversial</button>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {commentsData.map((comment) => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      </div>
    </ThreeColumnLayout>
  );
}