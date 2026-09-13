import React, { useState } from 'react';

export function CommunityRulesCard() {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const rules = [
    {
      number: 1,
      title: 'Be respectful and constructive',
      description: 'Treat all members with respect regardless of skill level.',
    },
    {
      number: 2,
      title: 'Verify before sharing',
      description: 'Ensure resources and solutions are accurate before posting.',
    },
    {
      number: 3,
      title: 'No spam or self-promotion',
      description: 'Promotional content not related to academic topics is removed.',
    },
    {
      number: 4,
      title: 'Tag posts correctly',
      description: 'Use relevant skill tags so the right mentors can find your post.',
    },
    {
      number: 5,
      title: 'Mentors must be verified',
      description: 'Only enrolled students and faculty may offer mentoring sessions.',
    },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs transition-all">
      {/* Header: Clickable on mobile to collapse/expand */}
      <div 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 cursor-pointer lg:cursor-default select-none"
      >
        <div className="flex items-center gap-2 sm:gap-2.5">
          <svg
            className="w-4 h-4 text-[#FF4F00] flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-tight">
            JorJek Community Rules
          </h3>
        </div>

        {/* Mobile Accordion Chevron */}
        <button
          type="button"
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-transform"
          aria-label="Toggle rules"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isMobileExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Rules List: Collapsible on mobile, always visible on desktop (lg:block) */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden'} lg:block divide-y divide-gray-100`}>
        {rules.map((rule) => (
          <div 
            key={rule.number} 
            className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3.5 hover:bg-gray-50/50 transition-colors"
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-50 text-[#FF4F00] text-[10px] sm:text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-100">
              {rule.number}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-800 leading-snug break-words">
                {rule.title}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 sm:mt-1 leading-relaxed break-words">
                {rule.description}
              </p>
            </div>
          </div>
        ))}

        {/* Footer Notice */}
        <div className="bg-gray-50/70 p-3 sm:p-4 border-t border-gray-100 text-center">
          <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-medium">
            Violations may result in post removal or account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}