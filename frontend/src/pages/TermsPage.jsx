import React from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function TermsPage() {
  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-gray-900">Terms of Service & Code of Conduct</h1>
          <p className="text-xs text-gray-400 mt-1">Effective: Academic Year 2026</p>
        </div>

        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">1. Academic Integrity</h2>
            <p>JorJek is an academic learning community. Users must not share unauthorized exam solutions, live test answers, or facilitate academic dishonesty. Violations result in immediate suspension and university administrative escalation.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">2. Respectful Collaboration</h2>
            <p>Constructive feedback and debate are welcomed; harassment, hate speech, or spamming will not be tolerated. Flagged comments undergo moderation review.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">3. Mentor Session Etiquette</h2>
            <p>Mentors and students agree to arrive punctually to scheduled meetings and adhere to university professional conduct guidelines throughout all video sessions.</p>
          </section>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}