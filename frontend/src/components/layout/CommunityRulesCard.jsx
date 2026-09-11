import React from 'react';

export function CommunityRulesCard() {
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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <svg
          className="w-4 h-4 text-[#FF4F00]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          JorJek Community Rules
        </h3>
      </div>

      {/* Rules List */}
      <div className="divide-y divide-gray-100">
        {rules.map((rule) => (
          <div key={rule.number} className="p-4 flex items-start gap-3.5">
            <span className="w-5 h-5 rounded-full bg-orange-50 text-[#FF4F00] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {rule.number}
            </span>
            <div>
              <h4 className="text-xs font-bold text-gray-800 leading-snug">
                {rule.title}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Notice */}
      <div className="bg-gray-50/70 p-4 border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
          Violations may result in post removal or account suspension.
        </p>
      </div>
    </div>
  );
}