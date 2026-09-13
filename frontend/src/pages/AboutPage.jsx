import React from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function AboutPage() {
  const values = [
    {
      title: 'Peer-to-Peer Learning',
      desc: 'Connecting university students to share course notes, solve tricky bugs, and review exam concepts together.',
      icon: (
        <svg className="w-5 h-5 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Faculty & Mentor Support',
      desc: 'Direct access to verified professors and top student mentors for targeted 1-on-1 and small group study sessions.',
      icon: (
        <svg className="w-5 h-5 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Open Campus Knowledge',
      desc: 'A searchable repository of solved academic questions, code patterns, and practical guides tailored to our syllabus.',
      icon: (
        <svg className="w-5 h-5 text-[#FF4F00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs space-y-6 sm:space-y-8">
        {/* Header Banner */}
        <div>
          <span className="text-[10px] sm:text-xs font-black text-[#FF4F00] uppercase tracking-wider">
            About the Platform
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mt-1 leading-tight tracking-tight">
            Empowering Campus Academic Collaboration
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2.5 sm:mt-3 leading-relaxed">
            <strong className="text-gray-900 font-semibold">JorJek</strong> is an academic community platform designed specifically for students and faculty. It combines modern forum discussions with a structured peer mentoring network to make technical help accessible anytime.
          </p>
        </div>

        {/* Feature Cards Grid: Stacks on mobile, 3 columns on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-1 sm:pt-2">
          {values.map((val) => (
            <div
              key={val.title}
              className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col justify-start hover:border-gray-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center mb-3">
                {val.icon}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 leading-snug">
                {val.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="border-t border-gray-100 pt-5 sm:pt-6">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
            Our Mission
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We believe that no student should be blocked on a problem simply because office hours ended. By bridging the gap between juniors seeking guidance and seniors or professors eager to mentor, JorJek strengthens our academic ecosystem.
          </p>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}