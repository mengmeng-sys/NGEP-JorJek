import React, { useState } from 'react';
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <ThreeColumnLayout>
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <span className="text-xs font-black text-[#FF4F00] uppercase tracking-wider">Support & Inquiries</span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Get in Touch</h1>
          <p className="text-xs text-gray-500 mt-1">Have feedback, report a system issue, or suggest a new course tag?</p>
        </div>

        {submitted ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
            <span className="text-2xl">📬</span>
            <h3 className="text-sm font-bold text-gray-900 mt-2">Message Sent!</h3>
            <p className="text-xs text-gray-600 mt-1">Thanks for reaching out. A campus admin will review your message shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Your Name</label>
                <input required type="text" placeholder="e.g., Yola Osei" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-orange-500 bg-[#FAFAFA]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">University Email</label>
                <input required type="email" placeholder="student@cadt.edu.kh" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-orange-500 bg-[#FAFAFA]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Subject</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:border-orange-500 bg-[#FAFAFA]">
                <option value="general">General Feedback</option>
                <option value="bug">Report a Bug / Glitch</option>
                <option value="mentor">Mentor Application Question</option>
                <option value="other">Other Campus Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Message</label>
              <textarea required rows={4} placeholder="Describe your question or issue in detail..." className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 outline-none focus:border-orange-500 bg-[#FAFAFA] resize-none" />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </ThreeColumnLayout>
  );
}