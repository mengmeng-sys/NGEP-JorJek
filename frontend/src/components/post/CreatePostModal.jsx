import React, { useState } from 'react';

export function CreatePostModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isMentoringEnabled, setIsMentoringEnabled] = useState(false);

  // Suggested default tag pool
  const suggestedTags = ['#C++', '#SQL', '#Java', '#Machine Learning'];
  
  // State for selected and custom tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  // Toggle selection for suggested tags
  const toggleSuggestedTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add custom typed tag
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      let formattedTag = tagInput.trim();
      if (!formattedTag) return;

      if (!formattedTag.startsWith('#')) {
        formattedTag = `#${formattedTag}`;
      }

      if (!selectedTags.includes(formattedTag)) {
        setSelectedTags([...selectedTags, formattedTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      // Remove last tag if input is empty
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };

  // Remove a specific tag chip
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        
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
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
            />
          </div>

          {/* Details Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Details
            </label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe your question, problem, or resource in detail..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm min-h-[120px] resize-none"
            ></textarea>
          </div>

          {/* Interactive Tags Section */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Add Tags <span className="text-gray-400 font-normal normal-case">(e.g. #Figma, #C++)</span>
            </label>
            
            <div className="flex items-center flex-wrap gap-2 w-full border border-gray-200 rounded-xl p-2.5 shadow-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 bg-white min-h-[46px]">
              
              {/* Render Suggested Tags as Selectable Buttons */}
              {suggestedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSuggestedTag(tag)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 font-bold'
                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {/* Render Custom Added Tags (Not in the default suggested list) */}
              {selectedTags
                .filter((tag) => !suggestedTags.includes(tag))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 text-xs px-2.5 py-1 rounded-lg font-bold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-400 hover:text-[#FF4F00] ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}

              {/* Dynamic Tag Text Input */}
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedTags.length > 0 ? "add more..." : "or type a custom tag and hit enter..."} 
                className="flex-1 min-w-[140px] text-xs text-gray-700 outline-none placeholder-gray-400 ml-1 bg-transparent"
              />
            </div>
          </div>

          {/* Mentoring Toggle Box */}
          <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-4 shadow-sm bg-white">
            <button 
              type="button"
              onClick={() => setIsMentoringEnabled(!isMentoringEnabled)}
              className={`${isMentoringEnabled ? 'bg-[#FF4F00]' : 'bg-gray-200'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5`}
            >
              <span className={`${isMentoringEnabled ? 'translate-x-4' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
            </button>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">Allow users to request a mentoring session for this post</h4>
              <p className="text-xs text-gray-500">
                {isMentoringEnabled 
                  ? 'A "Request Mentoring" button will appear on your post.'
                  : 'Your post will appear without a mentoring request option.'}
              </p>
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
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${
                title 
                  ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] shadow-sm' 
                  : 'bg-[#FFD5A3] text-white cursor-not-allowed'
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