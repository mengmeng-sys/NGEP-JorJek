import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';
import { CreatePostModal } from '@/components/post/CreatePostModal';
import { DeletePostModal } from '@/components/post/DeletePostModal';
import { ReportModal } from '@/components/shared/ReportModal';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { postsApi, usersApi, uploadsApi, reportsApi } from '@/lib/api';
import { normalizeUser } from '@/lib/adapters';
import { getApiErrorMessage } from '@/lib/apiClient';
import { copyToClipboard } from '@/lib/clipboard';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB — matches the /uploads endpoint's limit
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { on, off } = useSocket();
  const [activeTab, setActiveTab] = useState('posts');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Edit / Create Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Delete Modal State
  const [postToDelete, setPostToDelete] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const departmentOptions = [
    { name: 'Computer Science', specializations: ['Software Engineering', 'Data Science'] },
    { name: 'Telecommunications and Networking', specializations: ['Telecommunications and Networking Engineering', 'Cybersecurity'] },
    { name: 'Digital Business', specializations: ['E-commerce'] },
  ];

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

  // Listen for real-time profile updates
  useEffect(() => {
    if (isOwnProfile) return;
    const handleProfileUpdated = (rawUser) => {
      if (profile && rawUser.id === profile.id) {
        const normalized = normalizeUser(rawUser);
        setProfile((prev) => ({ ...prev, ...normalized }));
      }
    };
    on("profile_updated", handleProfileUpdated);
    return () => off("profile_updated", handleProfileUpdated);
  }, [on, off, isOwnProfile, profile?.id]);

  // Load posts authored by this profile.
  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      if (!profileUser?.id) return;
      try {
        const data = await postsApi.list({ limit: 100, currentUserId: user?.id });
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
  }, [profileUser?.id, user?.id]);

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

  const [isUploading, setIsUploading] = useState(false);

  // Save changes from CreatePostModal (create or edit)
  const handleSavePost = async (updatedPayload) => {
    setIsUploading(true);
    try {
      if (editingPost) {
        const updated = await postsApi.update(editingPost.id, {
          title: updatedPayload.title,
          content: updatedPayload.details ?? updatedPayload.content,
          type: updatedPayload.type,
          allowMentoring: updatedPayload.allowMentoring,
          tags: (updatedPayload.tags || []).map((t) => String(t).replace(/^#/, '')),
          imageFile: updatedPayload.imageFile,
          image_url: updatedPayload.image_url,
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
          imageFile: updatedPayload.imageFile,
          image_url: updatedPayload.image_url,
        });
        setUserPosts((prev) =>
          [created, ...prev].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        );
      }
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
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
      avatarUrl: profileUser.avatarUrl || null,
      gen: profileUser.gen ?? null,
      department: profileUser.department || null,
      specialization: profileUser.specialization || null,
      university: 'CADT — Cambodia Academy of Digital Technology',
      bio: profileUser.bio || '',
      isAvailableForMentoring: profileUser.isAvailableForMentoring ?? true,
      karma: profileUser.karma ?? 0,
      sessionsConducted: 0,
      rating: profileUser.rating ?? 0,
      expertise: profileUser.interests?.length
        ? profileUser.interests.map((i) => (String(i).startsWith('#') ? i : `#${i}`))
        : [],
    };
  }, [profileUser]);

  const startEditing = useCallback(() => {
    setEditForm({
      displayName: profileUser?.displayName || '',
      bio: profileUser?.bio || '',
      gen: profileUser?.gen ?? '',
      department: profileUser?.department || '',
      specialization: profileUser?.specialization || '',
      avatarUrl: profileUser?.avatarUrl || null,
    });
    setIsEditing(true);
  }, [profileUser]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditForm({});
  }, []);

  const handleAvatarPick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      alert('Please choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    setAvatarUploading(true);
    try {
      const { url } = await uploadsApi.upload(file);
      setEditForm((p) => ({ ...p, avatarUrl: url }));
    } catch (err) {
      alert(err?.message || 'Could not upload the image. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setEditForm((p) => ({ ...p, avatarUrl: null }));
  };

  const maxGen = new Date().getFullYear() - 2014 + 1;

  const saveProfile = useCallback(async () => {
    if (!profileUser?.id) return;
    if (editForm.gen !== undefined && editForm.gen !== '') {
      const genVal = Number(editForm.gen);
      if (genVal < 1 || genVal > maxGen) {
        alert(`Generation must be between 1 and ${maxGen} (CADT started in 2014).`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {};
      if (editForm.displayName?.trim()) payload.displayName = editForm.displayName.trim();
      if (editForm.bio !== undefined) payload.bio = editForm.bio.trim();
      if (editForm.gen !== undefined && editForm.gen !== '') payload.gen = Number(editForm.gen);
      if (editForm.department) payload.department = editForm.department;
      if (editForm.specialization) payload.specialization = editForm.specialization.trim();
      // Always send avatarUrl (even when null) so removing a photo actually
      // clears it — the backend treats `avatarUrl: null` as "remove photo".
      payload.avatarUrl = editForm.avatarUrl || null;

      // Editing here is only ever shown for the signed-in user's own profile
      // (see the isOwnProfile check around the "Edit Profile" button), so
      // updateUserProfile — which also refreshes the AuthContext user object
      // — is the right call. Calling usersApi.update directly here used to
      // save to the database fine, but left the on-screen profile (and the
      // avatar/name shown in the navbar) stale until the next full reload.
      await updateUserProfile(payload);
      setIsEditing(false);
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [profileUser?.id, editForm, updateUserProfile]);

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
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#FF4F00] mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Editing Profile</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Profile Picture</label>
                <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] rounded-xl border border-gray-100">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6] text-white text-lg font-bold flex items-center justify-center shadow-xs overflow-hidden">
                      {avatarUploading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : editForm.avatarUrl ? (
                        <img src={editForm.avatarUrl} alt={editForm.displayName || 'Profile picture'} className="w-full h-full object-cover" />
                      ) : (
                        fullProfile.avatarInitials
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarPick}
                      disabled={avatarUploading}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF4F00] hover:bg-[#E64700] text-white flex items-center justify-center ring-2 ring-white shadow-xs cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Change profile picture"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 leading-relaxed">JPEG, PNG, or WebP. Max 5MB.</p>
                    {editForm.avatarUrl && !avatarUploading && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors mt-1 cursor-pointer"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell others about yourself..."
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Generation (Gen)</label>
                <input
                  type="number"
                  min="1"
                  max={maxGen}
                  value={editForm.gen}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 1 && Number(val) <= maxGen)) {
                      setEditForm((p) => ({ ...p, gen: val }));
                    }
                  }}
                  placeholder={`1 - ${maxGen}`}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all shadow-2xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">CADT started in 2014. Max: Gen {maxGen}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Department</label>
                <div className="grid grid-cols-1 gap-2">
                  {departmentOptions.map((dept) => (
                    <button
                      key={dept.name}
                      type="button"
                      onClick={() => setEditForm((p) => ({ ...p, department: dept.name, specialization: '' }))}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        editForm.department === dept.name
                          ? 'bg-[#FF4F00] border-[#FF4F00] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>

              {editForm.department && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Specialization</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(departmentOptions.find((d) => d.name === editForm.department)?.specializations || []).map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setEditForm((p) => ({ ...p, specialization: spec }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          editForm.specialization === spec
                            ? 'bg-[#FF4F00] border-[#FF4F00] text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-[#FF4F00] hover:text-[#FF4F00]'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 bg-[#FF4F00] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#E64700] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  <UserAvatar
                    initials={fullProfile.avatarInitials}
                    avatarUrl={fullProfile.avatarUrl}
                    userId={fullProfile.id}
                    size="xl"
                    rounded="rounded-2xl"
                    bg="bg-[#8B5CF6]"
                    className="shadow-xs"
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                        {fullProfile.displayName}
                      </h1>
                      <span className="bg-purple-50 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-purple-100">
                        {fullProfile.role}
                      </span>
                      {fullProfile.gen && (
                        <span className="bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-blue-100">
                          Gen {fullProfile.gen}
                        </span>
                      )}
                      {fullProfile.isAvailableForMentoring && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Available
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                      @{fullProfile.handle}
                    </p>

                    {(fullProfile.department || fullProfile.specialization) && (
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        {fullProfile.department && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {fullProfile.department}
                          </span>
                        )}
                        {fullProfile.specialization && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {fullProfile.specialization}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-400">{fullProfile.university}</p>

                    {fullProfile.bio && (
                      <p className="text-xs sm:text-sm text-gray-600 max-w-xl pt-1 leading-relaxed wrap-break-words">
                        {fullProfile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                  {!isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/request-session/${profileUser.id || ''}`)}
                      className="flex-1 md:flex-initial bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs text-center cursor-pointer active:scale-98"
                    >
                      Request Session
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={startEditing}
                        className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
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
                    </>
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

              {/* Info Cards Row */}
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
            </>
          )}
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
        isUploading={isUploading}
      />

      {/* Custom Confirmation Delete Modal */}
      <DeletePostModal
        isOpen={Boolean(postToDelete)}
        postTitle={postToDelete?.title}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Report User Modal */}
      <ReportModal
        targetType="user"
        targetName={profileUser?.displayName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </ThreeColumnLayout>
  );
}