import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { ReportModal } from '@/components/shared/ReportModal';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { postsApi, commentsApi, votesApi, reportsApi } from '@/lib/api';
import { buildCommentTree, normalizeComment, normalizePost, initialsFrom } from '@/lib/adapters';
import { getApiErrorMessage } from '@/lib/apiClient';
import { copyToClipboard } from '@/lib/clipboard';

function addReplyToTree(comment, parentId, reply) {
  if (comment.id === parentId) {
    return { ...comment, replies: [...(comment.replies || []), reply] };
  }
  if (comment.replies?.length) {
    return { ...comment, replies: comment.replies.map((r) => addReplyToTree(r, parentId, reply)) };
  }
  return comment;
}

function removeCommentFromTree(comments, deletedId) {
  return comments
    .filter((c) => c.id !== deletedId)
    .map((c) => ({
      ...c,
      replies: c.replies?.length ? removeCommentFromTree(c.replies, deletedId) : [],
    }));
}

function updateCommentInTree(comments, targetId, updater) {
  return comments.map((c) => {
    if (c.id === targetId) return updater(c);
    if (c.replies?.length) return { ...c, replies: updateCommentInTree(c.replies, targetId, updater) };
    return c;
  });
}

// Subcomponent for handling each individual comment thread
function CommentThread({ comment, postId, currentUser, onRefresh }) {
  const navigate = useNavigate();
  const { markOnboardingComplete } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Voting state for parent comment
  const [voteState, setVoteState] = useState(comment.myVote || 0);
  const [voteCount, setVoteCount] = useState(comment.votes || 0);

  // Active reply target
  const [replyingToUser, setReplyingToUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  useEffect(() => {
    setReplies(comment.replies || []);
  }, [comment.replies]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const isCommentOwner = currentUser && currentUser.id === comment.author?.id;

  const handleVote = async (value) => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    const prevState = voteState;
    const prevCount = voteCount;
    if (voteState === value) {
      setVoteState(0);
      setVoteCount((prev) => prev - value);
    } else if (voteState === -value) {
      setVoteState(0);
      setVoteCount((prev) => prev + value);
    } else {
      setVoteState(value);
      setVoteCount((prev) => prev + value);
    }
    try {
      if (prevState !== 0) {
        await votesApi.remove({ commentId: comment.id });
      } else {
        await votesApi.cast({ commentId: comment.id }, value);
      }
    } catch {
      setVoteState(prevState);
      setVoteCount(prevCount);
      alert('Could not update your vote. Please try again.');
    }
  };

  const handleReport = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason) => {
    await reportsApi.create({ commentId: comment.id, reason });
    setIsReported(true);
    setIsReportModalOpen(false);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    setSubmittingReply(true);
    try {
      await commentsApi.create(postId, replyText.trim(), comment.id);
      markOnboardingComplete('hasCommented');
      setReplyText('');
      setReplyingToUser(null);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSubmittingEdit(true);
    try {
      await commentsApi.update(comment.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.remove(comment.id);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return (
    <div className="border-b border-gray-100 pb-5 sm:pb-6 last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <div className="h-6 w-6 sm:h-7 sm:w-7 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[10px] sm:text-xs flex-shrink-0">
            {comment.author?.initials || initialsFrom(comment.author?.displayName || 'U')}
          </div>
          <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">{comment.author?.displayName || 'Student'}</span>
          <span
            className={`text-[8px] sm:text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide flex-shrink-0 ${
              comment.author?.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {comment.author?.role || 'STUDENT'}
          </span>
          <span className="text-gray-400 text-[11px] sm:text-xs">{comment.timestamp}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isCommentOwner && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(true); setEditText(comment.body); }}
                title="Edit comment"
                className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete comment"
                className="p-1 rounded text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleReport}
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
      </div>

      {isEditing ? (
        <div className="pl-7 sm:pl-9">
          <form onSubmit={handleEdit}>
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all min-h-[80px] resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editText.trim() || submittingEdit}
                className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                  editText.trim() && !submittingEdit
                    ? 'bg-[#FF4F00] hover:bg-[#E64700] shadow-xs cursor-pointer'
                    : 'bg-orange-200 cursor-not-allowed'
                }`}
              >
                {submittingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : (
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
              onClick={() => handleVote(1)}
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
              onClick={() => handleVote(-1)}
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
              setReplyingToUser(replyingToUser?.id === 'main' ? null : { id: 'main', name: comment.author?.displayName || 'Student' })
            }
            className="hover:text-gray-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Reply
          </button>
        </div>
      </div>
      )}

      {replies.length > 0 && (
        <div className="mt-3 sm:mt-4 ml-4 sm:ml-9 pl-3 sm:pl-4 border-l-2 border-gray-100 space-y-3.5 sm:space-y-4">
          {replies.map((reply) => (
            <NestedReply
              key={reply.id}
              reply={reply}
              postId={postId}
              currentUser={currentUser}
              onReplyClick={(u) => setReplyingToUser(u)}
              onRefresh={onRefresh}
            />
          ))}
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
              disabled={!replyText.trim() || submittingReply}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                replyText.trim() && !submittingReply
                  ? 'bg-[#FF4F00] hover:bg-[#E64700] shadow-xs cursor-pointer'
                  : 'bg-orange-200 cursor-not-allowed'
              }`}
            >
              {submittingReply ? 'Posting…' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      <ReportModal
        targetType="comment"
        targetName={comment.author?.displayName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

function NestedReply({ reply, postId, currentUser, onReplyClick, onRefresh }) {
  const navigate = useNavigate();
  const [isReported, setIsReported] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [voteState, setVoteState] = useState(reply.myVote || 0);
  const [voteCount, setVoteCount] = useState(reply.votes || 0);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.body);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const isCommentOwner = currentUser && currentUser.id === reply.author?.id;

  const handleVote = async (value) => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    const prevState = voteState;
    const prevCount = voteCount;
    if (voteState === value) {
      setVoteState(0);
      setVoteCount((prev) => prev - value);
    } else if (voteState === -value) {
      setVoteState(0);
      setVoteCount((prev) => prev + value);
    } else {
      setVoteState(value);
      setVoteCount((prev) => prev + value);
    }
    try {
      if (prevState !== 0) {
        await votesApi.remove({ commentId: reply.id });
      } else {
        await votesApi.cast({ commentId: reply.id }, value);
      }
    } catch {
      setVoteState(prevState);
      setVoteCount(prevCount);
    }
  };

  const handleReport = () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason) => {
    await reportsApi.create({ commentId: reply.id, reason });
    setIsReported(true);
    setIsReportModalOpen(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSubmittingEdit(true);
    try {
      await commentsApi.update(reply.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await commentsApi.remove(reply.id);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-[9px] sm:text-[10px] flex-shrink-0">
            {reply.author?.initials || initialsFrom(reply.author?.displayName || 'U')}
          </div>
          <span className="font-bold text-gray-900 text-xs truncate">{reply.author?.displayName || 'Student'}</span>
          <span
            className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide flex-shrink-0 ${
              reply.author?.role === 'PROFESSOR'
                ? 'bg-orange-50 text-[#FF4F00] border border-orange-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {reply.author?.role || 'STUDENT'}
          </span>
          <span className="text-gray-400 text-[10px] sm:text-[11px]">{reply.timestamp}</span>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isCommentOwner && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(true); setEditText(reply.body); }}
                title="Edit reply"
                className="p-0.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete reply"
                className="p-0.5 rounded text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleReport}
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
      </div>

      {isEditing ? (
        <div className="pl-6 sm:pl-8">
          <form onSubmit={handleEdit}>
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all min-h-[60px] resize-none"
            />
            <div className="flex justify-end gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editText.trim() || submittingEdit}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-colors ${
                  editText.trim() && !submittingEdit
                    ? 'bg-[#FF4F00] hover:bg-[#E64700] cursor-pointer'
                    : 'bg-orange-200 cursor-not-allowed'
                }`}
              >
                {submittingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : (
      <div className="pl-6 sm:pl-8 text-xs text-gray-700 leading-relaxed break-words">
        <p>
          {reply.replyingTo && (
            <span className="text-[#FF4F00] font-bold mr-1.5">@{reply.replyingTo}</span>
          )}
          {reply.body}
        </p>

        <div className="flex items-center gap-2.5 sm:gap-3 pt-1.5 text-gray-500 font-medium">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
            <button
              type="button"
              onClick={() => handleVote(1)}
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
              onClick={() => handleVote(-1)}
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
            onClick={() => onReplyClick({ id: reply.id, name: reply.author?.displayName || 'Student' })}
            className="hover:text-gray-900 text-[11px] font-semibold transition-colors cursor-pointer"
          >
             Reply
          </button>
        </div>
      </div>
      )}

      {reply.replies?.length > 0 && (
        <div className="mt-2 ml-4 sm:ml-8 pl-2 sm:pl-3 border-l-2 border-gray-100 space-y-3">
          {reply.replies.map((sub) => (
            <NestedReply
              key={sub.id}
              reply={sub}
              postId={postId}
              currentUser={currentUser}
              onReplyClick={onReplyClick}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      <ReportModal
        targetType="comment"
        targetName={reply.author?.displayName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();
  const { joinPost, leavePost, on, off } = useSocket();

  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Menu & Modal states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  const refreshComments = useCallback(async () => {
    if (!id) return;
    try {
      const list = await commentsApi.list(id);
      setComments(buildCommentTree(list));
    } catch {
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setPostLoading(true);
      setNotFound(false);
      try {
        const data = await postsApi.get(id, user?.id);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setPost(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setPostLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  useEffect(() => {
    if (id) refreshComments();
  }, [id, refreshComments]);

  useEffect(() => {
    if (!id) return;

    joinPost(id);

    const handleNewComment = (rawComment) => {
      const comment = normalizeComment(rawComment);
      if (!comment) return;
      setComments((prev) => {
        const exists = prev.some((c) => c.id === comment.id) || prev.some((c) => c.replies?.some((r) => r.id === comment.id));
        if (exists) return prev;
        const newComment = { ...comment, timestamp: "just now", isLong: comment.body?.length > 200 };
        if (comment.parentId) {
          return prev.map((c) => addReplyToTree(c, comment.parentId, newComment));
        }
        return [...prev, newComment];
      });
    };

    const handleCommentDeleted = ({ id: deletedId }) => {
      setComments((prev) => removeCommentFromTree(prev, deletedId));
    };

    const handleCommentUpdated = (rawComment) => {
      const comment = normalizeComment(rawComment);
      if (!comment) return;
      setComments((prev) => updateCommentInTree(prev, comment.id, (c) => ({ ...c, body: comment.body })));
    };

    const handleVoteUpdate = ({ target, id: targetId, value, voterId, removed }) => {
      if (target === "post" && targetId === id) {
        if (voterId === user?.id) return;
        setPostVoteCount((prev) => {
          if (removed) return prev - value;
          return prev + value;
        });
        return;
      }
      if (target === "comment") {
        setComments((prev) =>
          updateCommentInTree(prev, targetId, (c) => ({
            ...c,
            votes: removed ? c.votes - value : c.votes + value,
          }))
        );
      }
    };

    const handlePostDeleted = ({ id: deletedPostId }) => {
      if (deletedPostId === id) navigate('/');
    };

    const handlePostUpdated = (rawPost) => {
      if (rawPost.id !== id && rawPost.id !== undefined) return;
      const normalized = normalizePost(rawPost);
      if (normalized) {
        setPost((prev) => (prev ? { ...prev, ...normalized } : prev));
      }
    };

    on("new_comment", handleNewComment);
    on("comment_deleted", handleCommentDeleted);
    on("comment_updated", handleCommentUpdated);
    on("vote_update", handleVoteUpdate);
    on("post_deleted", handlePostDeleted);
    on("post_updated", handlePostUpdated);

    return () => {
      off("new_comment", handleNewComment);
      off("comment_deleted", handleCommentDeleted);
      off("comment_updated", handleCommentUpdated);
      off("vote_update", handleVoteUpdate);
      off("post_deleted", handlePostDeleted);
      off("post_updated", handlePostUpdated);
      leavePost(id);
    };
  }, [id, joinPost, leavePost, on, off, user?.id, navigate]);

  // Post Interaction States
  const [postVoteState, setPostVoteState] = useState(0);
  const [postVoteCount, setPostVoteCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sortBy, setSortBy] = useState('top');

  useEffect(() => {
    if (post) {
      setPostVoteState(post.myVote || 0);
      setPostVoteCount(post.upvotes || 0);
      setIsSaved(Boolean(post.isSaved));
    }
  }, [post]);

  const handlePostVote = async (value) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const prevState = postVoteState;
    const prevCount = postVoteCount;
    if (postVoteState === value) {
      setPostVoteState(0);
      setPostVoteCount((prev) => prev - value);
    } else if (postVoteState === -value) {
      setPostVoteState(0);
      setPostVoteCount((prev) => prev + value);
    } else {
      setPostVoteState(value);
      setPostVoteCount((prev) => prev + value);
    }
    try {
      if (prevState !== 0) {
        await votesApi.remove({ postId: post.id });
      } else {
        await votesApi.cast({ postId: post.id }, value);
        if (value === 1) markOnboardingComplete('hasUpvoted');
      }
    } catch {
      setPostVoteState(prevState);
      setPostVoteCount(prevCount);
      alert('Could not update your vote. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (!ok) {
      alert('Could not copy the link. Please copy the URL manually.');
      return;
    }
    setIsCopied(true);
    setIsMenuOpen(false);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const updated = !isSaved;
    const prev = isSaved;
    setIsSaved(updated);
    try {
      if (updated) {
        await postsApi.save(id);
        markOnboardingComplete('hasSaved');
      } else {
        await postsApi.unsave(id);
      }
    } catch {
      setIsSaved(prev);
      alert('Could not update saved posts. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await postsApi.remove(id);
      navigate('/');
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const handleSavePost = async (updatedPayload) => {
    try {
      const updated = await postsApi.update(id, {
        title: updatedPayload.title,
        content: updatedPayload.details ?? updatedPayload.content,
        type: updatedPayload.type,
        allowMentoring: updatedPayload.allowMentoring,
        tags: (updatedPayload.tags || []).map((t) => String(t).replace(/^#/, '')),
      });
      setPost(updated);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const handleReport = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    setIsMenuOpen(false);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason) => {
    await reportsApi.create({ postId: id, reason });
    setIsReported(true);
    setIsReportModalOpen(false);
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await commentsApi.create(id, commentText.trim());
      markOnboardingComplete('hasCommented');
      setCommentText('');
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setSubmittingComment(false);
    }
  };

  const authorProfileSlug = useMemo(() => {
    return post?.authorHandle || (post?.author ? post.author.toLowerCase().replace(/\s+/g, '') : 'user');
  }, [post]);

  // Robust ownership matching identical to PostCard.jsx
  const isOwner = useMemo(() => {
    if (!user || !post) return false;
    const matchId = post.userId && user.id === post.userId;
    const matchName = post.author && user.displayName?.trim().toLowerCase() === post.author?.trim().toLowerCase();
    const matchEmail = post.authorEmail && user.email?.trim().toLowerCase() === post.authorEmail?.trim().toLowerCase();
    const matchHandle = user.handle && user.handle.toLowerCase() === authorProfileSlug.toLowerCase();
    return Boolean(matchId || matchName || matchEmail || matchHandle);
  }, [user, post, authorProfileSlug]);

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    if (sortBy === 'new') {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'controversial') {
      sorted.sort((a, b) => (b.commentVotes || 0) - (a.commentVotes || 0));
    } else {
      sorted.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    return sorted;
  }, [comments, sortBy]);

  if (postLoading) {
    return (
      <ThreeColumnLayout>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading post...</span>
        </div>
      </ThreeColumnLayout>
    );
  }

  if (notFound || !post) {
    return (
      <ThreeColumnLayout>
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs">
          <h2 className="text-sm font-bold text-gray-900">Post not found</h2>
          <p className="text-xs text-gray-500 mt-1">This post may have been removed.</p>
          <Link to="/" className="inline-block mt-4 text-xs font-bold text-[#FF4F00] hover:underline">
            Back to feed
          </Link>
        </div>
      </ThreeColumnLayout>
    );
  }

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
                    <span className="text-[#FF4F00] font-bold">{post.tag || '#General'}</span>
                    <span className="mx-1.5">•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Top Right: CTA (Only when author opted into mentoring requests) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isOwner && post.allowMentoring && (
                  <button
                    type="button"
                    onClick={() => navigate(`/request-session/${post.userId || ''}`)}
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
            </div>

            {/* Tag Badges */}
            {post.tags?.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2.5">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/?tag=${encodeURIComponent(String(t).replace(/^#/, ''))}`}
                    className="bg-orange-50 border border-orange-100 text-[#FF4F00] text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md hover:bg-orange-100 transition-colors"
                  >
                    #{String(t).replace(/^#/, '')}
                  </Link>
                ))}
              </div>
            )}

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
                  onClick={() => handlePostVote(1)}
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
                  onClick={() => handlePostVote(-1)}
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
                <span>{comments.length} comments</span>
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

              {/* Save Button — persists to the saved_posts backend */}
              <button
                type="button"
                onClick={handleSaveToggle}
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
                <span className="hidden xs:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Comment Box */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all min-h-[80px] sm:min-h-[90px] resize-none mb-3"
            placeholder="Share your knowledge or ask a follow-up..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddComment}
              disabled={submittingComment || !commentText.trim()}
              className="w-full sm:w-auto bg-[#FF4F00] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#E64700] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
            >
              {submittingComment ? 'Posting…' : 'Comment'}
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
          {sortedComments.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-sm font-bold text-gray-900">No comments yet</h3>
              <p className="text-xs text-gray-500 mt-1">Be the first to share your knowledge.</p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                postId={id}
                currentUser={user}
                onRefresh={refreshComments}
              />
            ))
          )}
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

      {/* Report Modal */}
      <ReportModal
        targetType="post"
        targetName={post?.author}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </ThreeColumnLayout>
  );
}