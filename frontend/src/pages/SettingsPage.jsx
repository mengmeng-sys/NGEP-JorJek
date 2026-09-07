import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // General Tab State
  const [displayName, setDisplayName] = useState('Yola Osei');
  const [role, setRole] = useState('Student');
  const [bio, setBio] = useState('Computer Science student passionate about database architecture and systems programming.');

  // My Posts Tab State
  const [myPosts, setMyPosts] = useState([
    {
      id: 1,
      tag: '#C++',
      time: '2d ago',
      title: 'Tracking down memory leaks in a large C++ codebase — tools and strategies?',
      snippet: "Our team's app has a slow memory growth over 24h that's hard to reproduce. Valgrind is too slow for production load. Looking for lightweight leak detection workflows that scale.",
      stars: 38,
      comments: 9,
    },
    {
      id: 2,
      tag: '#SQL',
      time: '5d ago',
      title: 'Optimizing complex multi-join queries — where do I start with EXPLAIN output?',
      snippet: "I have a 5-table JOIN that drops from 200ms to 4 seconds when the dataset grows past 500K rows. I've run EXPLAIN ANALYZE but I can't tell which node is the bottleneck.",
      stars: 21,
      comments: 5,
    },
    {
      id: 3,
      tag: '#Machine Learning',
      time: '1w ago',
      title: 'When should I normalize features vs. use tree-based models that don\'t need it?',
      snippet: 'I keep second-guessing when to apply StandardScaler. My intuition says skip it for Random Forests but apply it for SVMs and logistic regression. Is this right, and why?',
      stars: 45,
      comments: 12,
    },
  ]);

  // Mentoring Preferences State
  const [mentoringStatus, setMentoringStatus] = useState('Available for Sessions');
  const [maxSessions, setMaxSessions] = useState(3);
  const [expertiseTags, setExpertiseTags] = useState(['#SQL', '#C++', '#Figma', '#Data Structures']);

  // Privacy Settings Toggles
  const [privacySettings, setPrivacySettings] = useState({
    showProfileToGuests: true,
    allowDirectRequests: true,
    showOnlineStatus: false,
    receiveEmailNotifications: true,
  });

  const togglePrivacy = (key) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeletePost = (id) => {
    setMyPosts(myPosts.filter((post) => post.id !== id));
  };

  const navigationItems = [
    {
      section: 'CONTENT',
      items: [
        {
          id: 'posts',
          label: 'My Posts',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ),
        },
        {
          id: 'mentoring-dashboard',
          label: 'Mentoring Dashboard',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        {
          id: 'general',
          label: 'General',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          id: 'preferences',
          label: 'Mentoring Preferences',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          id: 'privacy',
          label: 'Privacy',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        {/* User Header Stats Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#111827] text-white text-xl font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              YO
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Yola Osei</h1>
              <p className="text-sm text-gray-500 mt-0.5">yola.osei@cadt.edu.kh</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-gray-600">Available for Sessions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center divide-x divide-gray-100 self-stretch md:self-auto justify-around md:justify-end gap-2 md:gap-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">142</span>
              <span className="text-xs text-gray-400 font-medium">Campus Karma</span>
            </div>
            
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">12</span>
              <span className="text-xs text-gray-400 font-medium">Posts Created</span>
            </div>
            
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">5</span>
              <span className="text-xs text-gray-400 font-medium">Sessions Done</span>
            </div>
          </div>
        </div>

        {/* Main Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Settings Sidebar Tabs */}
          <div className="md:col-span-4 lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-6">
            {navigationItems.map((group) => (
              <div key={group.section}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#FFF4F0] text-[#FF4F00] border-l-4 border-[#FF4F00] rounded-l-none'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                        }`}
                      >
                        <span className={isActive ? 'text-[#FF4F00]' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Main Content Pane */}
          <div className="md:col-span-8 lg:col-span-9 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
              <div>
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">General</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage your display name, profile picture, and academic details.
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full bg-[#111827] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    YO
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="border border-[#FF4F00] text-[#FF4F00] hover:bg-orange-50 font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                      Change Picture
                    </button>
                    <button type="button" className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-[#FAFAFA] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                      University Email
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        disabled
                        value="yola.osei@cadt.edu.kh"
                        className="w-full border border-gray-200 bg-gray-50/80 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed pr-10"
                      />
                      <svg className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Platform Role
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      {['Student', 'Professor'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                            role === r
                              ? 'bg-[#FFF4F0] text-[#FF4F00] border-orange-200'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a short summary of what you are working on or studying..."
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all bg-[#FAFAFA] focus:bg-white resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="button" className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY POSTS TAB */}
            {activeTab === 'posts' && (
              <div>
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">My Posts</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage and view the questions and resources you have shared.
                  </p>
                </div>

                <div className="space-y-4">
                  {myPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all bg-white shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#FF4F00] bg-orange-50 px-2 py-0.5 rounded-md">
                          {post.tag}
                        </span>
                        <span className="text-xs text-gray-400">{post.time}</span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug hover:text-[#FF4F00] transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {post.snippet}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                          <span className="flex items-center gap-1 text-[#FF4F00]">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {post.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {post.comments} comments
                          </span>
                        </div>

                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MENTORING DASHBOARD TAB */}
            {activeTab === 'mentoring-dashboard' && (
              <div>
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Mentoring Dashboard</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage incoming requests and your upcoming sessions.
                  </p>
                </div>

                {/* Incoming Requests Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Incoming Requests</h3>
                    <span className="w-5 h-5 bg-[#FF4F00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        KM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">Kwame Mensah</span>
                          <span className="bg-purple-50 text-[#8B5CF6] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                            STUDENT
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Requesting mentoring for: <strong className="text-gray-900 font-semibold">CREATE VIEW statement for a multi-table dashboard</strong>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs italic text-gray-600 ml-13 mb-4">
                      "I'm stuck on joining three tables, can we do a quick review?"
                    </div>

                    <div className="flex items-center gap-3 justify-start ml-13">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        Decline
                      </button>
                      <button className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                        Accept & Schedule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upcoming Sessions Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Upcoming Sessions</h3>
                  
                  <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">Oct 12 • 2:00 PM - 3:00 PM</span>
                          <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-1.5 py-0.5 rounded">#SQL</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">1/3 Students Enrolled</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          meet.google.com/abc-defg-hij
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                        Join Meeting
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MENTORING PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div>
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Mentoring Preferences</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Control your availability, specialties, and session limits.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Current Mentoring Status */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-1">Current Mentoring Status</h3>
                    <p className="text-xs text-gray-400 mb-3">This controls whether other users can send you session requests.</p>
                    
                    <div className="relative mb-3">
                      <select 
                        value={mentoringStatus} 
                        onChange={(e) => setMentoringStatus(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-orange-500 appearance-none cursor-pointer"
                      >
                        <option value="Available for Sessions">Available for Sessions</option>
                        <option value="Busy / Temporarily Paused">Busy / Temporarily Paused</option>
                        <option value="Not Accepting Requests">Not Accepting Requests</option>
                      </select>
                      <div className="absolute left-4 top-3.5 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none"></div>
                      <svg className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-gray-700">Status set to: <strong>{mentoringStatus}</strong></span>
                    </div>
                  </div>

                  {/* Max Sessions per Week */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-1">Max Sessions per Week</h3>
                    <p className="text-xs text-gray-400 mb-3">Limit how many active sessions you can have at a time.</p>
                    
                    <div className="flex items-center gap-2.5">
                      {[1, 2, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxSessions(num)}
                          className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                            maxSessions === num
                              ? 'bg-[#FF4F00] text-white shadow-sm'
                              : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <span className="text-xs text-gray-400 ml-2 font-medium">sessions / week</span>
                    </div>
                  </div>

                  {/* Areas of Expertise */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-1">Areas of Expertise</h3>
                    <p className="text-xs text-gray-400 mb-3">Tags that will appear on your mentor profile.</p>

                    <div className="flex items-center flex-wrap gap-2.5">
                      {expertiseTags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-white border border-[#FF4F00] text-[#FF4F00] font-bold text-xs px-3.5 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      <button className="border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 font-semibold text-xs px-3.5 py-1.5 rounded-full transition-colors">
                        + Add tag
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div>
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Control who can see your activity and contact you.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Show my profile to guests</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Non-registered users can view your posts and profile page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('showProfileToGuests')}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        privacySettings.showProfileToGuests ? 'bg-[#FF4F00]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        privacySettings.showProfileToGuests ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Allow direct session requests</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Users can request a private mentoring session from your profile.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('allowDirectRequests')}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        privacySettings.allowDirectRequests ? 'bg-[#FF4F00]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        privacySettings.allowDirectRequests ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </button>
                  </div>

                  {/* Toggle 3 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Show online status</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Display a green dot when you are active on the platform.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('showOnlineStatus')}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        privacySettings.showOnlineStatus ? 'bg-[#FF4F00]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        privacySettings.showOnlineStatus ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </button>
                  </div>

                  {/* Toggle 4 */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900">Receive email notifications</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Get notified by email when someone replies to your post.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('receiveEmailNotifications')}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        privacySettings.receiveEmailNotifications ? 'bg-[#FF4F00]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        privacySettings.receiveEmailNotifications ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}