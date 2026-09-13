import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { useAuth } from '@/context/AuthContext';

export default function UserProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Edit / Create Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Delete Modal State
  const [postToDelete, setPostToDelete] = useState(null);

  const currentUser = user || {
    id: 'user_srun_vireak',
    displayName: 'Srun Vireak',
    handle: 'srunvireak',
    email: 'srun.vireak@student.cadt.edu.kh',
    initials: 'SV',
    role: 'STUDENT',
  };

  const isOwnProfile =
    !username ||
    username === 'me' ||
    username.toLowerCase() === currentUser.handle?.toLowerCase() ||
    username.toLowerCase() === currentUser.displayName?.toLowerCase().replace(/\s+/g, '');

  const profile = useMemo(() => {
    if (isOwnProfile) {
      return {
        id: currentUser.id,
        displayName: currentUser.displayName || 'Srun Vireak',
        handle: currentUser.handle || 'srunvireak',
        role: currentUser.role || 'STUDENT',
        avatarInitials: currentUser.initials || 'SV',
        department: 'Computer Science & Software Engineering',
        university: 'CADT',
        bio: 'Junior CS student focused on backend systems, SQL optimization, and distributed databases. Active peer mentor for Year 1 & 2 programming labs.',
        isAvailableForMentoring: true,
        karma: 412,
        sessionsConducted: 24,
        rating: 4.9,
        expertise: ['#SQL', '#PostgreSQL', '#Database Design', '#C++'],
      };
    }

    return {
      id: 'kwame-id',
      displayName: 'Kwame Mensah',
      handle: username,
      role: 'STUDENT',
      avatarInitials: 'KM',
      department: 'Computer Science & Engineering',
      university: 'CADT',
      bio: 'Peer mentor focused on database architecture, data structures, and lab problem solving.',
      isAvailableForMentoring: true,
      karma: 285,
      sessionsConducted: 14,
      rating: 4.8,
      expertise: ['#SQL', '#C++', '#Algorithms'],
    };
  }, [isOwnProfile, currentUser, username]);

  const [userPosts, setUserPosts] = useState([
    {
      id: 1,
      userId: isOwnProfile ? currentUser.id : 'kwame-id',
      author: isOwnProfile ? currentUser.displayName : 'Kwame Mensah',
      role: 'STUDENT',
      tags: ['SQL'],
      tag: '#SQL',
      timestamp: '3h ago',
      title: 'How do I implement a CREATE VIEW statement for a multi-table database dashboard?',
      content:
        "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
      upvotes: 124,
      hasUpvoted: false,
      comments: 14,
      isSaved: false,
    },
    {
      id: 14,
      userId: isOwnProfile ? currentUser.id : 'kwame-id',
      author: isOwnProfile ? currentUser.displayName : 'Kwame Mensah',
      role: 'STUDENT',
      tags: ['C++'],
      tag: '#C++',
      timestamp: '2w ago',
      title: 'Guide: Common pointer pitfalls when building dynamic arrays from scratch',
      content:
        'A quick cheat sheet summarizing double free errors, dangling pointers, and memory leaks with diagram examples from our lab 3 exercises.',
      upvotes: 89,
      hasUpvoted: true,
      comments: 8,
      isSaved: true,
    },
  ]);

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

  const handleConfirmDelete = () => {
    if (!postToDelete) return;
    setUserPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    setPostToDelete(null);
  };

  // Save changes from CreatePostModal
  const handleSavePost = (updatedPayload) => {
    if (editingPost) {
      setUserPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                title: updatedPayload.title,
                content: updatedPayload.content,
                tags: updatedPayload.tags,
                allowMentoring: updatedPayload.allowMentoring,
                image_url: updatedPayload.imagePreview || p.image_url,
              }
            : p
        )
      );
      setEditingPost(null);
    } else {
      // New post creation
      const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        author: currentUser.displayName,
        role: currentUser.role,
        timestamp: 'Just now',
        upvotes: 1,
        comments: 0,
        ...updatedPayload,
      };
      setUserPosts([newPost, ...userPosts]);
    }
  };

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
                {profile.avatarInitials}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                    {profile.displayName}
                  </h1>
                  <span className="bg-purple-50 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-purple-100">
                    {profile.role}
                  </span>
                  {profile.isAvailableForMentoring && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  @{profile.handle} • {profile.department}
                </p>
                <p className="text-xs text-gray-400">{profile.university}</p>

                <p className="text-xs sm:text-sm text-gray-600 max-w-xl pt-1.5 sm:pt-2 leading-relaxed break-words">
                  {profile.bio}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
              {!isOwnProfile ? (
                <button
                  type="button"
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
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile URL copied to clipboard!');
                }}
                className="flex-1 md:flex-initial bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all text-center cursor-pointer"
              >
                Share Profile
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{profile.karma}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Campus Karma</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{userPosts.length}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Discussions</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-gray-900 block leading-tight">{profile.sessionsConducted}</span>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Sessions</span>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-2.5 sm:p-3 border border-gray-100">
              <span className="text-base sm:text-lg font-bold text-emerald-600 block leading-tight">★ {profile.rating}</span>
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
    </ThreeColumnLayout>
  );
}