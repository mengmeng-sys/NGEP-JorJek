import { Link } from "react-router-dom";

export function BackHomeArrow() {
  return (
    <Link
      to="/"
      aria-label="Back to home"
      className="inline-flex items-center gap-2 text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F8FAFC] font-semibold text-xs transition-colors"
    >
      <span className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/[0.1] shadow-xs flex items-center justify-center hover:border-gray-300 dark:hover:border-white/[0.2] dark:hover:bg-[#1E293B] transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </span>
      Go to home
    </Link>
  );
}