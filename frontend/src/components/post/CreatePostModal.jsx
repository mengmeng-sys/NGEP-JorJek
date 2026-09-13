import React, { useState, useRef, useEffect } from 'react';

export function CreatePostModal({ isOpen, onClose, onPublish, initialData = null }) {
  const isEditing = Boolean(initialData);

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
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Sync state with incoming initialData whenever the modal opens or data changes
  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '');
      setDetails(initialData.content || initialData.details || '');
      setIsMentoringEnabled(Boolean(initialData.allowMentoring));

      const rawTags = initialData.tags || (initialData.tag ? [initialData.tag] : ['#SQL']);
      const formatted = rawTags.map((t) => (t.startsWith('#') ? t : `#${t}`));
      setSelectedTags(formatted);

      if (initialData.image_url || initialData.imagePreview) {
        setImagePreview(initialData.image_url || initialData.imagePreview);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
      setUploadError('');
    } else if (!initialData && isOpen) {
      setTitle('');
      setDetails('');
      setIsMentoringEnabled(false);
      setSelectedTags(['#SQL']);
      setTagInput('');
      setSelectedImage(null);
      setImagePreview(null);
      setUploadError('');
    }
  }, [initialData, isOpen]);

  // Clean up Object URL blobs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  const toggleSuggestedTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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

  // Image validation and preview generation
  const processImageFile = (file) => {
    setUploadError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onPublish) {
      onPublish({
        ...(initialData || {}),
        title: title.trim(),
        content: details.trim(),
        tags: selectedTags,
        allowMentoring: isMentoringEnabled,
        image_url: imagePreview,
        imageFile: selectedImage,
        imagePreview,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[92vh] sm:h-auto sm:max-h-[88vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="border-b border-gray-100 flex-shrink-0">
          <div className="sm:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2.5 mb-1" />
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {isEditing ? 'Edit Discussion' : 'Create a Post'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {isEditing
                  ? 'Update details and tags for your published post'
                  : 'Ask a question or share coursework with CADT students'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Title <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ask a question or share coursework..."
              className="w-full border border-gray-200 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] focus:bg-white shadow-2xs"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Details
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe your question, query bottleneck, or resource..."
              className="w-full border border-gray-200 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all bg-[#FAFAFA] focus:bg-white resize-none shadow-2xs leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Tags <span className="text-gray-400 font-normal normal-case">(tap to toggle or type)</span>
            </label>

            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 w-full border border-gray-200 rounded-xl p-2 sm:p-2.5 focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00] bg-white min-h-[44px] transition-all shadow-2xs">
              {suggestedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSuggestedTag(tag)}
                    className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? 'bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 font-bold shadow-2xs'
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
                    className="inline-flex items-center gap-1 bg-[#FFF4F0] text-[#FF4F00] border border-orange-200 text-[11px] sm:text-xs px-2.5 py-1 rounded-lg font-bold shadow-2xs select-none"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-orange-400 hover:text-[#FF4F00] ml-0.5 font-black text-xs cursor-pointer"
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
                placeholder={selectedTags.length > 0 ? 'add more...' : 'type tag & enter...'}
                className="flex-1 min-w-[110px] text-xs text-gray-700 outline-none placeholder-gray-400 ml-1 py-1 bg-transparent"
              />
            </div>
          </div>

          {/* Photo Attachment (Click & Drag-and-Drop) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                Attach Diagram / Screenshot
              </label>
              {selectedImage && (
                <span className="text-[10px] text-gray-400 font-medium truncate max-w-[180px]">
                  {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isDragging
                    ? 'border-[#FF4F00] bg-orange-50/50 scale-[0.99]'
                    : 'border-gray-200 hover:border-[#FF4F00]/50 bg-[#FAFAFA] hover:bg-orange-50/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-800">
                  Click to browse <span className="text-gray-400 font-normal">or drop image here</span>
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  PNG, JPG, WebP, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 max-h-56 sm:max-h-64 flex items-center justify-center p-2 group">
                <img
                  src={imagePreview}
                  alt="Post preview"
                  className="max-h-52 sm:max-h-60 w-auto object-contain rounded-lg shadow-2xs"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black/75 hover:bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-1.5 transition-colors shadow-sm cursor-pointer"
                    title="Remove Photo"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <span>⚠</span> {uploadError}
              </p>
            )}
          </div>

          {/* Mentoring Toggle */}
          <div className="border border-gray-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setIsMentoringEnabled(!isMentoringEnabled)}
              className={`${isMentoringEnabled ? 'bg-[#FF4F00]' : 'bg-gray-200'} relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5`}
            >
              <span className={`${isMentoringEnabled ? 'translate-x-4' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out`} />
            </button>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-gray-900 leading-tight">Allow mentoring requests for this post</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isMentoringEnabled
                  ? 'A "Request Mentoring" button will appear on this post.'
                  : 'Post will appear as a standard discussion question.'}
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between pb-2 sm:pb-0">
            <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
              {!title.trim() ? 'Add a title to save' : ''}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  title.trim()
                    ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] shadow-xs cursor-pointer active:scale-98'
                    : 'bg-orange-200 text-white cursor-not-allowed'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}