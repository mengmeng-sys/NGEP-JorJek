import React, { useState, useRef } from 'react';

export function CreatePostModal({ isOpen, onClose, onPublish }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isMentoringEnabled, setIsMentoringEnabled] = useState(false);

  // Suggested default tag pool
  const suggestedTags = ['#C++', '#SQL', '#Java', '#Machine Learning', '#Figma'];
  
  // State for selected and custom tags
  const [selectedTags, setSelectedTags] = useState(['#SQL']);
  const [tagInput, setTagInput] = useState('');

  // File/Photo state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  // Photo handlers
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be under 5MB.');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onPublish) {
      onPublish({
        title: title.trim(),
        content: details.trim(),
        tags: selectedTags,
        allowMentoring: isMentoringEnabled,
        imageFile: selectedImage,
        imagePreview,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create a Post</h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ask a question or share a resource..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-2xs"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Details
            </label>
            <textarea 
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe your question, problem, or resource in detail..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-2xs min-h-[110px] resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Add Tags <span className="text-gray-400 font-normal normal-case">(e.g. #Figma, #C++)</span>
            </label>
            
            <div className="flex items-center flex-wrap gap-2 w-full border border-gray-200 rounded-xl p-2.5 shadow-2xs focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 bg-white min-h-[46px]">
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

              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedTags.length > 0 ? "add more..." : "or type a tag and hit enter..."} 
                className="flex-1 min-w-[140px] text-xs text-gray-700 outline-none placeholder-gray-400 ml-1 bg-transparent"
              />
            </div>
          </div>

          {/* Photo Attachment Section */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Attach Image
            </label>
            
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl p-4 text-center cursor-pointer bg-[#FAFAFA] hover:bg-orange-50/20 transition-all flex items-center justify-center gap-3"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  onChange={handlePhotoSelect} 
                />
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-gray-600">Click to upload a screenshot or diagram (PNG, JPG up to 5MB)</span>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-52 bg-gray-50 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="object-contain max-h-52 w-full" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Mentoring Toggle */}
          <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs bg-white">
            <button 
              type="button"
              onClick={() => setIsMentoringEnabled(!isMentoringEnabled)}
              className={`${isMentoringEnabled ? 'bg-[#FF4F00]' : 'bg-gray-200'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5`}
            >
              <span className={`${isMentoringEnabled ? 'translate-x-4' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out`} />
            </button>
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-0.5">Allow users to request a mentoring session for this post</h4>
              <p className="text-[11px] text-gray-500">
                {isMentoringEnabled 
                  ? 'A "Request Mentoring" button will appear on your post card.'
                  : 'Your post will appear without a mentoring request button.'}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              {!title ? 'Add a title to publish' : ''}
            </span>
            <div className="flex items-center gap-2.5">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  title.trim() 
                    ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] shadow-sm cursor-pointer' 
                    : 'bg-[#FFD5A3] text-white cursor-not-allowed'
                }`}
              >
                Publish
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}