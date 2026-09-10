import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

// Subcomponent for handling individual comments, truncating, reporting, and replies
function CommentItem({ comment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Comment voting states: 1 (upvoted), -1 (downvoted), 0 (neutral)
  const [voteState, setVoteState] = useState(comment.initialVoted || 0);
  const [voteCount, setVoteCount] = useState(comment.votes);

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

  const hasReplies = comment.replies && comment.replies.length > 0;
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, 1);
  const remainingCount = (comment.replies?.length || 0) - 1;

  return (
    <div className="border-b border-gray-100 pb-5 last:border-b-0">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[10px]">
            {comment.initials}
          </div>
          <span className="font-bold text-gray-900 text-sm">{comment.author}</span>
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
            comment.role === 'Professor' 
              ? 'bg-orange-50 text-[#FF4F00] border border-orange-100' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {comment.role}
          </span>
          <span className="text-gray-400 text-xs ml-1">{comment.timestamp}</span>
        </div>

        {/* Always Red Warning / Report Icon for Replies */}
        <button 
          onClick={() => setIsReported(!isReported)}
          title="Report reply"
          className="p-0.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Body with See More / See Less */}
      <div className="pl-8 text-sm text-gray-700">
        <div className={`space-y-3 ${!isExpanded ? 'line-clamp-3 overflow-hidden' : ''}`}>
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

        {/* Actions Bar */}
        <div className="flex items-center gap-4 pt-2 text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            <button 
              onClick={handleUpvote}
              className={`p-0.5 rounded transition-colors ${voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'}`}
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
              className={`p-0.5 rounded transition-colors ${voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button className="hover:text-gray-700 text-xs transition-colors">Reply</button>
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && (
        <div className="mt-4 ml-8 pl-4 border-l-2 border-gray-100 space-y-4">
          {visibleReplies.map((reply) => (
            <NestedReplyItem key={reply.id} reply={reply} />
          ))}

          {remainingCount > 0 && (
            <button 
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="text-xs font-bold text-[#FF4F00] hover:text-[#E64700] transition-colors flex items-center gap-1 pt-1"
            >
              <span>{showAllReplies ? 'Hide replies' : `View ${remainingCount} more ${remainingCount === 1 ? 'reply' : 'replies'}`}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${showAllReplies ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Subcomponent for nested reply items
function NestedReplyItem({ reply }) {
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
          <div className="h-5 w-5 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[9px]">
            {reply.initials}
          </div>
          <span className="font-bold text-gray-900 text-xs">{reply.author}</span>
          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
            reply.role === 'Professor' 
              ? 'bg-orange-50 text-[#FF4F00] border border-orange-100' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {reply.role}
          </span>
          <span className="text-gray-400 text-[11px] ml-1">{reply.timestamp}</span>
        </div>

        {/* Always Red Warning / Report Icon */}
        <button 
          onClick={() => setIsReported(!isReported)}
          title="Report comment"
          className="p-1 rounded text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="pl-7 text-xs text-gray-700 leading-relaxed">
        <p>{reply.text}</p>
        <div className="flex items-center gap-3 pt-2 text-gray-500 font-medium">
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
            <button 
              onClick={handleUpvote}
              className={`transition-colors ${voteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'}`}
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
              className={`transition-colors ${voteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button className="hover:text-gray-700 transition-colors">Reply</button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();

  // Main Post voting states
  const [postVoteState, setPostVoteState] = useState(0);
  const [postVoteCount, setPostVoteCount] = useState(124);

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

  // Structured comment mock data
  const commentsData = [
    {
      id: 1,
      author: "Prof. James Carver",
      role: "Professor",
      initials: "JC",
      timestamp: "2h ago",
      votes: 98,
      initialVoted: 0,
      isLong: true,
      body: (
        <>
          <p>Great question! The three-table join is straightforward — just chain another JOIN. The more important question is whether you need a materialized view. For a dashboard that reads frequently but updates rarely, materialization can cut query time significantly:</p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-800 overflow-x-auto">
{`CREATE VIEW dashboard_view AS
SELECT u.name, i.title, i.category, f.added_at
FROM users u
JOIN favorites f ON u.id = f.user_id
JOIN items i ON f.item_id = i.id;`}
          </pre>
          <p>For join order, the query planner handles this automatically in PostgreSQL. But if you're on a system without a cost-based optimizer, join the smallest table last.</p>
        </>
      ),
      replies: [
        {
          id: 101,
          author: "Kwame Mensah",
          role: "Student",
          initials: "KM",
          timestamp: "1h 30m ago",
          votes: 27,
          initialVoted: 1,
          text: "This is exactly what I needed. The distinction between regular and materialized views makes a lot more sense now. Would a session help me understand when the query planner's estimate is wrong? That's where I keep getting tripped up."
        },
        {
          id: 102,
          author: "Dr. Yuki Tanaka",
          role: "Professor",
          initials: "YT",
          timestamp: "1h 10m ago",
          votes: 15,
          initialVoted: 0,
          text: "I can join this session as well to walk through the EXPLAIN output with both of you."
        }
      ]
    },
    {
      id: 2,
      author: "Dr. Yuki Tanaka",
      role: "Professor",
      initials: "YT",
      timestamp: "1h 45m ago",
      votes: 61,
      initialVoted: 0,
      isLong: false,
      body: (
        <p>One thing worth adding — if this is for a live dashboard, consider using REFRESH MATERIALIZED VIEW CONCURRENTLY so reads aren't blocked during refresh. You'll need a unique index on the view for this to work. Also worth examining your indexes on the foreign key columns before worrying about join order.</p>
      ),
      replies: []
    }
  ];

  return (
    <ThreeColumnLayout>
      {/* Back Navigation */}
      <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to feed
      </Link>

      {/* Main Post Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-sm">
                KM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">Kwame Mensah</span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">Student</span>
                </div>
                <div className="flex items-center text-xs mt-0.5">
                  <span className="text-[#FF4F00] font-bold">#SQL</span>
                  <span className="text-gray-400 ml-2">3h ago</span>
                </div>
              </div>
            </div>
            <button className="text-[#FF4F00] border border-[#FF4F00] rounded-lg px-4 py-1.5 text-sm font-bold hover:bg-orange-50 transition-colors">
              Request Session
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
            How do I implement a CREATE VIEW statement for a multi-table database dashboard?
          </h1>
          
          <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
            <p>
              I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost. Here's my current attempt:
            </p>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-800 overflow-x-auto">
{`CREATE VIEW dashboard_view AS
SELECT u.name, f.item_id, f.added_at
FROM users u
JOIN favorites f ON u.id = f.user_id;`}
            </pre>
            <p>
              I need to also join a third table `items` to get the item name and category. Any advice on how to structure this and whether a materialized view would be worth it here?
            </p>
          </div>
        </div>

        {/* Post Actions Footer */}
        <div className="flex items-center gap-6 px-6 py-3 border-t border-gray-100 text-gray-500 text-sm font-medium">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            <button 
              onClick={handlePostUpvote}
              className={`p-1 rounded transition-colors ${postVoteState === 1 ? 'text-[#FF4F00]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-xs font-bold ${postVoteState === 1 ? 'text-[#FF4F00]' : postVoteState === -1 ? 'text-blue-500' : 'text-gray-700'}`}>
              {postVoteCount}
            </span>
            <button 
              onClick={handlePostDownvote}
              className={`p-1 rounded transition-colors ${postVoteState === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            3 comments
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Add a comment</h3>
        <textarea 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[100px] resize-none mb-3"
          placeholder="Share your knowledge or ask a follow-up..."
        ></textarea>
        <div className="flex justify-end">
          <button className="bg-[#FF4F00] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#E64700] transition-colors">
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
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </ThreeColumnLayout>
  );
}