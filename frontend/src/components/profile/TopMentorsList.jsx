import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/apiClient";
import { UserAvatar } from "@/components/shared/UserAvatar";

const ROLE_COLORS = {
  PROFESSOR: { bg: "bg-orange-50", text: "text-[#FF4F00]", border: "border-orange-100" },
  STUDENT: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
};

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
  "bg-gradient-to-br from-gray-300 to-gray-400 text-white",
  "bg-gradient-to-br from-orange-300 to-orange-400 text-white",
];

export function TopUsersList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/users/top-mentors").then(setUsers);
  }, []);

  const handleUserClick = (user) => {
    const handle = user.handle || (user.displayName || user.display_name || "").toLowerCase().replace(/\s+/g, "");
    navigate(`/user/${handle}`);
  };

  if (users.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-[11px] text-gray-400 font-medium">No top users yet</p>
        <p className="text-[10px] text-gray-300 mt-0.5">Start posting and earning karma!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {users.slice(0, 5).map((user, index) => {
        const initials = getInitials(user.displayName || user.display_name);
        const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT;
        const rankStyle = RANK_STYLES[index] || "bg-gray-100 text-gray-500";

        return (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Rank Badge */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${rankStyle}`}>
              {index + 1}
            </div>

            {/* Avatar */}
            <UserAvatar initials={initials} userId={user.id} size="md" gradient className="ring-2 ring-white shadow-xs" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                {user.displayName || user.display_name || "User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wide px-1.5 py-0 rounded ${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                  {user.role || "STUDENT"}
                </span>
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {user.karma ?? 0}
                </span>
              </div>
            </div>

            {/* Karma Badge for top 3 */}
            {index < 3 && (
              <div className="flex-shrink-0">
                {index === 0 && (
                  <span className="text-lg" title="Top contributor">👑</span>
                )}
                {index === 1 && (
                  <span className="text-lg" title="Runner up">🥈</span>
                )}
                {index === 2 && (
                  <span className="text-lg" title="Third place">🥉</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name) {
  if (!name) return "U";
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
