import React from 'react';

export function DeletePostModal({ isOpen, onClose, onConfirm, postTitle = '' }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden p-5 sm:p-6 text-center animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150"
      >
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          Delete Discussion?
        </h3>

        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed break-words px-2">
          Are you sure you want to permanently delete{' '}
          {postTitle ? (
            <strong className="text-gray-800 font-semibold">"{postTitle}"</strong>
          ) : (
            'this post'
          )}
          ? All comments and karma linked to this post will be removed.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col-reverse xs:flex-row items-center gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full xs:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs cursor-pointer active:scale-98 text-center"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}