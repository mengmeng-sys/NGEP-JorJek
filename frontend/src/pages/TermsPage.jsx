import React from 'react';
import { Link } from 'react-router-dom';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function TermsPage() {
  const sections = [
    {
      number: '1',
      title: 'Academic Integrity',
      content:
        'JorJek is an academic learning community. Users must not share unauthorized exam solutions, live test answers, or facilitate academic dishonesty. Violations result in immediate suspension and university administrative escalation.',
    },
    {
      number: '2',
      title: 'Respectful Collaboration',
      content:
        'Constructive feedback and debate are welcomed; harassment, hate speech, or spamming will not be tolerated. Flagged comments undergo moderation review.',
    },
    {
      number: '3',
      title: 'Mentor Session Etiquette',
      content:
        'Mentors and students agree to arrive punctually to scheduled meetings and adhere to university professional conduct guidelines throughout all video sessions.',
    },
  ];

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="border-b border-gray-100 pb-3.5 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black text-[#FF4F00] uppercase tracking-wider">
            Campus Guidelines
          </span>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1 leading-tight">
            Terms of Service & Code of Conduct
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Effective: Academic Year 2026
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-3.5 sm:space-y-5 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {sections.map((sec) => (
            <section
              key={sec.number}
              className="bg-[#FAFAFA] sm:bg-transparent border border-gray-100 sm:border-0 rounded-xl p-3.5 sm:p-0"
            >
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-[#FF4F00] font-black">{sec.number}.</span>
                <span>{sec.title}</span>
              </h2>
              <p className="leading-relaxed text-gray-600 break-words">
                {sec.content}
              </p>
            </section>
          ))}
        </div>

        {/* Compliance Footer */}
        <div className="border-t border-gray-100 pt-4 text-[11px] sm:text-xs text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Violations can be reported via inline flags or directly to administration.</span>
          <Link to="/contact" className="text-[#FF4F00] font-bold hover:underline self-start sm:self-auto">
            Report an issue →
          </Link>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}