import React from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function PrivacyPage() {
  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: September 2026</p>
        </div>

        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">1. Information We Collect</h2>
            <p>We collect university account details (email, display name, and department role) to authenticate your access. When scheduling sessions, your chosen calendar or meeting links are shared solely with confirmed participants.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">2. How Information is Used</h2>
            <p>Information is used exclusively to facilitate academic Q&A, mentor discovery, and session notifications. We do not sell or monetize student data.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">3. Visibility Controls</h2>
            <p>You can toggle whether your profile is viewable to unregistered guests or hide your active status via your account settings page at any time.</p>
          </section>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}