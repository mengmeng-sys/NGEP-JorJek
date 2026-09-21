import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';
import { usersApi } from '@/lib/api';

export default function RequestSessionPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadMentor() {
      if (!mentorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const found = await usersApi.getById(mentorId);
      if (!cancelled) {
        setMentor(found);
        setLoading(false);
      }
    }
    loadMentor();
    return () => {
      cancelled = true;
    };
  }, [mentorId]);

  const safeName = mentor?.displayName || 'CADT Student';
  const initials = mentor?.initials || 'CA';
  const role = mentor?.role || 'STUDENT';
  const department =
    mentor?.department || 'Computer Science & Software Engineering';

  return (
    <ThreeColumnLayout>
      <div className="w-full max-w-2xl mx-auto">
        {/* Back button — always clickable, above the blurred overlay */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-[#FF4F00] transition-colors cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 shadow-2xs mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go back
        </button>

        {/* Blurred underlay — real UI the page will have in Phase 2 */}
        <div className="relative w-full">
          <div
            className="blur-md opacity-70 select-none pointer-events-none"
            aria-hidden="true"
          >
            <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">Request a Session</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
              Book a 1-on-1 mentoring session with a verified CADT mentor.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500 gap-2">
                <div className="w-6 h-6 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading mentor...</span>
              </div>
            ) : (
              <>
                {/* Mentor Summary Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 bg-[#111827] text-white font-bold flex items-center justify-center rounded-full text-xs sm:text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={mentor?.handle ? `/user/${mentor.handle.toLowerCase().replace(/\s+/g, '')}` : '#'}
                        className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm hover:text-[#FF4F00] transition-colors truncate block"
                      >
                        {safeName}
                      </Link>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-purple-50 dark:bg-purple-900/20 text-[#8B5CF6] text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30">
                          {role}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate">
                          {department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
                    You're requesting an in-person or online study session with{' '}
                    <span className="font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">{safeName}</span>. Propose a
                    time below and the mentor will confirm or suggest an alternative.
                  </p>
                </div>

                {/* Request Form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                      Session Type
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['Coursework Help', 'Coding Review', 'Career Guidance', 'General'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer select-none ${
                            type === 'Coursework Help'
                              ? 'bg-[#FFF4F0] dark:bg-orange-900/20 text-[#FF4F00] border border-orange-200 dark:border-orange-900/30'
                              : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                      Topic / What do you need help with?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Understanding B+ trees for DB exam..."
                      className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] dark:bg-gray-800 focus:bg-white dark:bg-gray-900 shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-700 dark:text-gray-300 dark:text-gray-600 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] dark:bg-gray-800 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-700 dark:text-gray-300 dark:text-gray-600 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] dark:bg-gray-800 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                        Duration
                      </label>
                      <select className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-700 dark:text-gray-300 dark:text-gray-600 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] dark:bg-gray-800 shadow-2xs cursor-pointer">
                        <option>30 min</option>
                        <option>45 min</option>
                        <option>60 min</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1.5">
                      Message <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share your syllabus level, what you've tried, and anything specific you want to cover..."
                      className="w-full border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] dark:bg-gray-800 focus:bg-white dark:bg-gray-900 resize-none shadow-2xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium hidden sm:inline">
                      The mentor will confirm through notifications.
                    </span>
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
                    >
                      Send Request
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Coming Soon overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-lg text-3xl sm:text-4xl font-black text-[#FF4F00] tracking-tight">
              Coming Soon!
            </span>
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}