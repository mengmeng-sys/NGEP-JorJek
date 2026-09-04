import React, { useState } from 'react';

export function CreatePostModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [isMentoringEnabled, setIsMentoringEnabled] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-40 backdrop-blur-sm">
      
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create a Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ask a question or share a resource..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
            />
          </div>

          {/* Details Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Details
            </label>
            <textarea 
              placeholder="Describe your question, problem, or resource in detail..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm min-h-[120px] resize-none"
            ></textarea>
          </div>

          {/* Tags Input area */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Add Tags <span className="text-gray-400 font-normal normal-case">(e.g. #Figma, #C++)</span>
            </label>
            <div className="flex items-center flex-wrap gap-2 w-full border border-gray-200 rounded-lg p-2.5 shadow-sm">
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">#C++</span>
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">#SQL</span>
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">#Java</span>
              <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">#Machine Learning</span>
              <input 
                type="text" 
                placeholder="or type a custom tag..." 
                className="flex-1 min-w-[150px] text-sm text-gray-700 outline-none placeholder-gray-400 ml-1 bg-transparent"
              />
            </div>
          </div>

          {/* Mentoring Toggle Box */}
          <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            {/* Custom Toggle Switch */}
            <button 
              type="button"
              onClick={() => setIsMentoringEnabled(!isMentoringEnabled)}
              className={`${isMentoringEnabled ? 'bg-[#FF4F00]' : 'bg-gray-200'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5`}
            >
              <span className={`${isMentoringEnabled ? 'translate-x-4' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
            </button>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Allow users to request a mentoring session for this post</h4>
              <p className="text-xs text-gray-500">Your post will appear without a mentoring request option.</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-xs text-gray-400 font-medium">
            {!title ? 'Add a title' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={!title}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                title 
                  ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] shadow-sm' 
                  : 'bg-orange-200 text-white cursor-not-allowed'
              }`}
            >
              Publish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}