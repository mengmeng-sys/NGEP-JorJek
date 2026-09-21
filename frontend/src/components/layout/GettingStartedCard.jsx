import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export function GettingStartedCard({ onOpenAuth }) {
  const { user, onboarding, isOnboardingComplete } = useAuth();
  const isLoggedIn = Boolean(user && (user.displayName || user.email || user.id));

  if (isOnboardingComplete()) return null;

  const tasks = [
    {
      id: 'profile',
      label: 'Add your Department & Skills',
      completed: isLoggedIn,
    },
    {
      id: 'upvote',
      label: 'Upvote a helpful post',
      completed: isLoggedIn && onboarding.hasUpvoted,
    },
    {
      id: 'save',
      label: 'Save a resource for later',
      completed: isLoggedIn && onboarding.hasSaved,
    },
    {
      id: 'comment',
      label: 'Leave your first comment',
      completed: isLoggedIn && onboarding.hasCommented,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
          Getting Started
        </h3>
        <span className={`text-xs font-bold ${completedCount > 0 ? 'text-[#FF4F00]' : 'text-gray-400 dark:text-gray-500'}`}>
          {completedCount}/{tasks.length} Completed
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        Complete your setup to unlock the Top Mentors leaderboard.
      </p>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-5">
        <div
          className="bg-[#FF4F00] h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task Checklist */}
      <div className="space-y-3.5">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            {task.completed ? (
              // Completed Icon (Orange Filled Checkmark)
              <div className="w-5 h-5 rounded-full bg-[#FF4F00] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              // Incomplete Icon (Empty Circle)
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
            )}

             <span
              className={`text-xs font-medium ${
                task.completed
                  ? 'text-gray-400 dark:text-gray-500 line-through'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}