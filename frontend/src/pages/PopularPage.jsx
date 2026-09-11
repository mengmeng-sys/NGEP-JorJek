import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { PostCard } from '@/components/post/PostCard';

export default function PopularPage() {
  const [timeframe, setTimeframe] = useState('week'); // 'today' | 'week' | 'all'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularPosts() {
      setLoading(true);
      try {
        // Query Supabase: order by upvotes descending to surface top discussions
        let query = supabase
          .from('posts')
          .select('*, profiles(display_name, role)')
          .order('upvotes', { ascending: false });

        // Optional timeframe filtering
        if (timeframe === 'today') {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('created_at', yesterday);
        } else if (timeframe === 'week') {
          const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('created_at', lastWeek);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          // Fallback mock data matching platform design
          setPosts([
            {
              id: 201,
              author: 'Lena Brandt',
              role: 'STUDENT',
              tags: ['C++'],
              timestamp: '5h ago',
              title: 'Best practices for memory management in C++ — when to use smart pointers vs raw?',
              content:
                'I keep running into segfaults in my data structures assignment when I mix unique_ptr and raw pointers. Looking for a clear mental model on ownership semantics before my exam next week.',
              upvotes: 211,
              hasUpvoted: true,
              comments: 29,
              isSaved: false,
            },
            {
              id: 202,
              author: 'Kwame Mensah',
              role: 'STUDENT',
              tags: ['SQL'],
              timestamp: '3h ago',
              title: 'How do I implement a CREATE VIEW statement for a multi-table database dashboard?',
              content:
                "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
              upvotes: 124,
              hasUpvoted: false,
              comments: 14,
              isSaved: true,
            },
            {
              id: 203,
              author: 'Nadia Osei',
              role: 'STUDENT',
              tags: ['Figma'],
              timestamp: '1d ago',
              title: 'Design System component architecture for multi-device responsive dashboards',
              content:
                'Sharing my open component kit designed for university student portals. It includes tokens for light/dark mode and responsive breakpoints ready for Tailwind CSS export.',
              upvotes: 98,
              hasUpvoted: false,
              comments: 19,
              isSaved: false,
            },
          ]);
        } else {
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load popular feed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularPosts();
  }, [timeframe]);

  return (
    <ThreeColumnLayout>
      {/* Popular Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF4F00] flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Popular Discussions</h1>
              <p className="text-xs text-gray-500 mt-0.5">The highest-rated study materials and questions across campus</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[#FAFAFA] border border-gray-200 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'today'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'week'
                  ? 'bg-[#FF4F00] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === 'all'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="flex justify-center items-center py-16 text-gray-400 text-sm font-medium">
          Loading top discussions...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm">
          No trending posts found for this period.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </ThreeColumnLayout>
  );
}