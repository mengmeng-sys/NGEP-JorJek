import { useState } from "react";

const REPORT_REASONS = [
  { id: "harassment", label: "Harassment or bullying" },
  { id: "spam", label: "Spam or unwanted messages" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "impersonation", label: "Impersonating someone" },
  { id: "cheating", label: "Cheating or academic dishonesty" },
  { id: "offensive", label: "Offensive language or behavior" },
];

export function ReportUserModal({ targetUser, isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const finalReason = selectedReason === "other" ? customReason.trim() : selectedReason;
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

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Report Submitted</h3>
            <p className="text-xs text-gray-500 mb-5">
              Thank you. Our moderation team will review this report shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Report {targetUser?.displayName || "User"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3">
          <p className="text-xs text-gray-500">Why are you reporting this user?</p>

          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === reason.id
                    ? "border-[#FF4F00] bg-orange-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                      : "border-gray-300"
                  }`}
                >
                  {selectedReason === reason.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">{reason.label}</span>
              </label>
            ))}

            <label
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedReason === "other"
                  ? "border-[#FF4F00] bg-orange-50/50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value="other"
                checked={selectedReason === "other"}
                onChange={() => setSelectedReason("other")}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedReason === "other"
                    ? "border-[#FF4F00] bg-[#FF4F00]"
                    : "border-gray-300"
                }`}
              >
                {selectedReason === "other" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Other (write your own)</span>
            </label>
          </div>

          {selectedReason === "other" && (
            <textarea
              autoFocus
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] transition-all resize-none"
            />
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 text-white text-xs font-bold py-2.5 rounded-xl transition-colors ${
                canSubmit
                  ? "bg-red-500 hover:bg-red-600 cursor-pointer"
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
