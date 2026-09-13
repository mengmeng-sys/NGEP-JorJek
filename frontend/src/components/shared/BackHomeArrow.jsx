import { Link } from "react-router-dom";

export function BackHomeArrow() {
  return (
    <Link
      to="/"
      aria-label="Back to home"
      className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-xs transition-colors"
    >
      <span className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center hover:border-gray-300 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </span>
      Back to Home
    </Link>
  );
}