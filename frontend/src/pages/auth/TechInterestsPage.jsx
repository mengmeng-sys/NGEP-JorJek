import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TECH_CATEGORIES = [
  {
    id: 'cpp',
    name: 'C++ & Low-Level Systems',
    tag: '#C++',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'sql',
    name: 'Databases & PostgreSQL',
    tag: '#SQL',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    id: 'java',
    name: 'Java & Object-Oriented',
    tag: '#Java',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'ml',
    name: 'Machine Learning & AI',
    tag: '#Machine Learning',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'UI/UX & Product Design',
    tag: '#Figma',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'web',
    name: 'Full-Stack React & Node',
    tag: '#WebDev',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    id: 'arch',
    name: 'Computer Architecture',
    tag: '#Architecture',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps / Supabase',
    tag: '#Cloud',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    id: 'mobile',
    name: 'Mobile (Flutter / Android)',
    tag: '#Mobile',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function TechInterestsPage() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState(['cpp', 'sql']);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleFinishOnboarding = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-center items-center px-3.5 sm:px-6 py-6 sm:py-12">
      <div className="w-full max-w-lg sm:max-w-2xl bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-xs p-4 sm:p-7 md:p-8">
        
        {/* Brand & Progress Header */}
        <div className="text-center mb-5 sm:mb-6">
          <Link to="/" className="inline-block group mb-3">
            <img 
              src="/jorjek_logo.jpg" 
              alt="JorJek" 
              className="h-8 sm:h-9 w-auto mx-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4F00] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 inline-block">
              Step 2 of 2 • Personalize
            </span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-tight">
            Select Your Technical Interests
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
            Choose subjects you want to explore. We tailor your campus discussion feed and peer mentor recommendations to these areas.
          </p>
        </div>

        {/* Interests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-4 sm:my-6 max-h-[52vh] sm:max-h-none overflow-y-auto pr-0.5 sm:pr-0">
          {TECH_CATEGORIES.map((cat) => {
            const isSelected = selectedInterests.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleInterest(cat.id)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none ${
                  isSelected
                    ? 'border-[#FF4F00] bg-orange-50/50 text-gray-900 shadow-2xs'
                    : 'border-gray-200 bg-[#FAFAFA] hover:bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Clean SVG Vector Icon Capsule */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#FF4F00] text-white shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {cat.icon}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xs font-bold leading-snug truncate text-gray-900">
                      {cat.name}
                    </h2>
                    <span className="text-[10px] font-semibold text-[#FF4F00] block mt-0.5">
                      {cat.tag}
                    </span>
                  </div>
                </div>

                {/* Selection Checkmark Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors flex-shrink-0 ml-2 ${
                    isSelected
                      ? 'bg-[#FF4F00] text-white shadow-2xs'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse xs:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full xs:w-auto text-center py-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="w-full xs:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
          >
            Done & Enter JorJek ({selectedInterests.length} Selected)
          </button>
        </div>

      </div>
    </div>
  );
}