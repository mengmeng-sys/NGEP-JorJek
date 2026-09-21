import { useState } from "react";

const REPORT_REASONS = [
  { id: "harassment", label: "Harassment or bullying" },
  { id: "spam", label: "Spam or unwanted content" },
  { id: "inappropriate", label: "Inappropriate or offensive content" },
  { id: "misinformation", label: "Misinformation" },
  { id: "cheating", label: "Cheating or academic dishonesty" },
  { id: "other", label: "Other (write your own)" },
];

export function ReportModal({ targetType, targetName, isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isOther = selectedReason === "other";
  const finalReason = isOther ? customReason.trim() : REPORT_REASONS.find((r) => r.id === selectedReason)?.label || "";
  const canSubmit = finalReason.length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(finalReason);
      setSubmitted(true);
    } catch {
      alert("Could not submit report. Please try again.");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setSubmitted(false);
    setSubmitting(false);
    onClose();
  };

  const targetLabel = targetType === "user" ? targetName : targetType === "post" ? "this post" : "this comment";

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Report Submitted</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Thank you. Our moderation team will review this shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-[#FF4F00] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#E64700] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
            Report {targetLabel}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Why are you reporting {targetLabel}?</p>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === reason.id
                    ? "border-[#FF4F00] bg-orange-50 dark:bg-orange-900/20/50"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={() => setSelectedReason(reason.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedReason === reason.id
                      ? "border-[#FF4F00] bg-[#FF4F00]"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {selectedReason === reason.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-900" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{reason.label}</span>
              </label>
            ))}
          </div>

          {isOther && (
            <textarea
              autoFocus
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full bg-[#FAFAFA] dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all resize-none"
            />
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 text-white text-xs font-bold py-2.5 rounded-xl transition-colors ${
                canSubmit
                  ? "bg-red-50 dark:bg-red-900/200 hover:bg-red-600 cursor-pointer"
                  : "bg-red-200 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
