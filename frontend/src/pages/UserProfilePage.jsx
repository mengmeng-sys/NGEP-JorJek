import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { ReportUserModal } from '@/components/shared/ReportUserModal';
import { useAuth } from '@/context/AuthContext';
import { postsApi, usersApi, reportsApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiClient';
import { copyToClipboard } from '@/lib/clipboard';

export default function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Edit / Create Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Delete Modal State
  const [postToDelete, setPostToDelete] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const isOwnProfile =
    !username ||
    username === 'me' ||
    (user &&
      (username.toLowerCase() === user.handle?.toLowerCase() ||
        username.toLowerCase() === user.displayName?.toLowerCase().replace(/\s+/g, '')));

  const profileUser = isOwnProfile ? user : profile;

  // Load the viewed profile (own = auth user; other = resolved by handle/slug).
  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      if (isOwnProfile) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const found = await usersApi.get(username);
        if (!cancelled) {
          setProfile(found);
        }
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, username]);

  // Load posts authored by this profile.
  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      if (!profileUser?.id) return;
      try {
        const data = await postsApi.list({ limit: 100 });
        if (cancelled) return;
        const mine = data.posts.filter((p) => p.userId === profileUser.id);
        setUserPosts(mine.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      } catch {
        if (!cancelled) setUserPosts([]);
      }
    }
    setUserPosts([]);
    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [profileUser?.id]);

  // Handle Edit Trigger from PostCard
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  // Handle Delete Trigger from PostCard
  const handleDeleteTrigger = (postId) => {
    const target = userPosts.find((p) => p.id === postId);
    if (target) setPostToDelete(target);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await postsApi.remove(postToDelete.id);
      setUserPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
    setPostToDelete(null);
  };

  const handleReportSubmit = async (reason) => {
    await reportsApi.create({ targetUserId: profileUser.id, reason });
    setIsReportModalOpen(false);
  };

  // Save changes from CreatePostModal (create or edit)
  const handleSavePost = async (updatedPayload) => {
    try {
      if (editingPost) {
        const updated = await postsApi.update(editingPost.id, {
          title: updatedPayload.title,
          content: updatedPayload.details ?? updatedPayload.content,
          type: updatedPayload.type,
          allowMentoring: updatedPayload.allowMentoring,
          tags: (updatedPayload.tags || []).map((t) => String(t).replace(/^#/, '')),
        });
        setUserPosts((prev) =>
          prev.map((p) => (p.id === editingPost.id ? updated : p))
        );
        setEditingPost(null);
      } else {
        const created = await postsApi.create({
          type: updatedPayload.type || 'question',
          title: updatedPayload.title,
          content: updatedPayload.details ?? updatedPayload.content,
          tags: updatedPayload.tags || [],
          allowMentoring: updatedPayload.allowMentoring,
        });
        setUserPosts((prev) =>
          [created, ...prev].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        );
      }
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const fullProfile = useMemo(() => {
    if (!profileUser) return null;
    return {
      id: profileUser.id,
      displayName: profileUser.displayName || 'CADT Student',
      handle: profileUser.handle || 'student',
      role: profileUser.role || 'STUDENT',
      avatarInitials: profileUser.initials || 'CA',
      department: profileUser.department || 'Computer Science & Software Engineering',
      university: 'CADT',
      bio: profileUser.bio || 'Peer mentor and active member of the JorJek campus community.',
      isAvailableForMentoring: profileUser.isAvailableForMentoring ?? true,
      karma: profileUser.karma ?? 0,
      sessionsConducted: 0,
      rating: profileUser.rating ?? 0,
      expertise: profileUser.interests?.length
        ? profileUser.interests.map((i) => (String(i).startsWith('#') ? i : `#${i}`))
        : [],
    };
  }, [profileUser]);

  if (profileLoading) {
    return (
      <ThreeColumnLayout>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading profile...</span>
        </div>
      </ThreeColumnLayout>
    );
  }

  if (!fullProfile) {
    return (
      <ThreeColumnLayout>
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs">
          <h2 className="text-sm font-bold text-gray-900">User not found</h2>
          <p className="text-xs text-gray-500 mt-1">This profile does not exist.</p>
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

        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#8B5CF6] text-white text-xl sm:text-2xl font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                {fullProfile.avatarInitials}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                    {fullProfile.displayName}
                  </h1>
                  <span className="bg-purple-50 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-purple-100">
                    {fullProfile.role}
                  </span>
                  {fullProfile.isAvailableForMentoring && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  @{fullProfile.handle} • {fullProfile.department}
                </p>
                <p className="text-xs text-gray-400">{fullProfile.university}</p>

                <p className="text-xs sm:text-sm text-gray-600 max-w-xl pt-1.5 sm:pt-2 leading-relaxed break-words">
                  {fullProfile.bio}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => navigate(`/request-session/${profileUser.id || ''}`)}
                  className="flex-1 md:flex-initial bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer active:scale-98"
                >
                  Request Session
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null);
                    setIsPostModalOpen(true);
                  }}
                  className="flex-1 md:flex-initial bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer active:scale-98"
                >
                  Create Post
                </button>
              )}
               <button
                 type="button"
                 onClick={async () => {
                   const ok = await copyToClipboard(window.location.href);
                   alert(ok ? 'Profile URL copied to clipboard!' : 'Could not copy the link. Please copy the URL manually.');
                 }}
                 className="flex-1 md:flex-initial bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all text-center cursor-pointer"
               >
                 Share Profile
               </button>
               {!isOwnProfile && profileUser?.id && (
                 <button
                   type="button"
                   onClick={() => setIsReportModalOpen(true)}
                   className="flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                 >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                   </svg>
                   Report User
                 </button>
               )}
             </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{fullProfile.karma}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Campus Karma</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{userPosts.length}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Discussions</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{fullProfile.sessionsConducted}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Sessions</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">
                {fullProfile.rating ? `★ ${fullProfile.rating}` : '—'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Peer Rating</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'text-[#FF4F00] border-[#FF4F00]'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            Shared Posts ({userPosts.length})
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-3 sm:space-y-4">
            {userPosts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-xs sm:text-sm">
                No discussions published by this user.
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={() => handleDeleteTrigger(post.id)}
                  onEdit={() => handleEditPost(post)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Shared Create/Edit Modal */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        initialData={editingPost}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        onPublish={handleSavePost}
      />

      {/* Custom Confirmation Delete Modal */}
      <DeletePostModal
        isOpen={Boolean(postToDelete)}
        postTitle={postToDelete?.title}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Report User Modal */}
      <ReportUserModal
        targetUser={profileUser}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </ThreeColumnLayout>
  );
}