import React from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function PrivacyPage() {
  const sections = [
    {
      number: '1',
      title: 'Information We Collect',
      content:
        'We collect university account details (email, display name, and department role) to authenticate your access. When scheduling sessions, your chosen calendar or meeting links are shared solely with confirmed participants.',
    },
    {
      number: '2',
      title: 'How Information is Used',
      content:
        'Information is used exclusively to facilitate academic Q&A, mentor discovery, and session notifications. We do not sell or monetize student data.',
    },
    {
      number: '3',
      title: 'Visibility Controls',
      content:
        'You can toggle whether your profile is viewable to unregistered guests or hide your active status via your account settings page at any time.',
    },
  ];

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-3.5 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black text-[#FF4F00] uppercase tracking-wider">
            Legal & Compliance
          </span>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Last Updated: September 2026
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm text-gray-600 leading-relaxed">
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

        {/* Contact Note */}
        <div className="border-t border-gray-100 pt-4 text-[11px] sm:text-xs text-gray-400">
          Have questions regarding data handling? Reach out via our{' '}
          <a href="/contact" className="text-[#FF4F00] font-bold hover:underline">
            Contact Support page
          </a>
          .
        </div>

      </div>
    </ThreeColumnLayout>
  );
}