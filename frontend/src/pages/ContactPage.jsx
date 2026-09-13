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
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
        {/* Header */}
        <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6">
          <span className="text-[10px] sm:text-xs font-black text-[#FF4F00] uppercase tracking-wider">
            Support & Inquiries
          </span>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1 leading-tight">
            Get in Touch
          </h1>
          <p className="text-xs text-gray-500 mt-1 sm:mt-1.5 leading-relaxed">
            Have feedback, report a system issue, or suggest a new course tag?
          </p>
        </div>

        {submitted ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 sm:p-8 text-center animate-in fade-in duration-200">
            <span className="text-3xl sm:text-4xl block">📬</span>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-3">Message Sent!</h3>
            <p className="text-xs text-gray-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Thanks for reaching out. A campus admin will review your message shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-bold text-[#FF4F00] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* 2-Column Responsive Name & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Your Name <span className="text-[#FF4F00]">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Yola Osei"
                  className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-800 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] focus:bg-white transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  University Email <span className="text-[#FF4F00]">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="student@cadt.edu.kh"
                  className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-800 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 pr-9 text-xs text-gray-800 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] focus:bg-white transition-all shadow-2xs cursor-pointer">
                  <option value="general">General Feedback</option>
                  <option value="bug">Report a Bug / Glitch</option>
                  <option value="mentor">Mentor Application Question</option>
                  <option value="other">Other Campus Inquiry</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Message <span className="text-[#FF4F00]">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your question or issue in detail..."
                className="w-full border border-gray-200 rounded-xl p-3 sm:p-3.5 text-xs text-gray-800 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] bg-[#FAFAFA] focus:bg-white transition-all resize-none shadow-2xs min-h-[110px]"
              />
            </div>

            {/* Submission CTA: Full-width on mobile, auto-width on desktop */}
            <div className="pt-2 flex flex-col sm:flex-row justify-end items-center gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
              >
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </ThreeColumnLayout>
  );
}