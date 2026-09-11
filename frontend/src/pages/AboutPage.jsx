import React from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function AboutPage() {
  const values = [
    { title: 'Peer-to-Peer Learning', desc: 'Connecting university students to share course notes, solve tricky bugs, and review exam concepts together.' },
    { title: 'Faculty & Mentor Support', desc: 'Direct access to verified professors and top student mentors for targeted 1-on-1 and small group study sessions.' },
    { title: 'Open Campus Knowledge', desc: 'A searchable repository of solved academic questions, code patterns, and practical guides tailored to our syllabus.' },
  ];

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-black text-[#FF4F00] uppercase tracking-wider">About the Platform</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Empowering Campus Academic Collaboration</h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            <strong>JorJek</strong> is an academic community platform designed specifically for students and faculty. It combines modern forum discussions with a structured peer mentoring network to make technical help accessible anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {values.map((val) => (
            <div key={val.title} className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-1.5">{val.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Our Mission</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            We believe that no student should be blocked on a problem simply because office hours ended. By bridging the gap between juniors seeking guidance and seniors or professors eager to mentor, JorJek strengthens our academic ecosystem.
          </p>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}