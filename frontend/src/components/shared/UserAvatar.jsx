import { useOnline } from "@/context/OnlineContext";

const sizes = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 sm:h-7 sm:w-7 text-xs",
  md: "h-9 w-9 sm:h-10 sm:w-10 text-sm",
  lg: "h-11 w-11 sm:h-12 sm:h-12 text-base",
  xl: "w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl",
};

const dotSizes = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border-[1.5px]",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-4 h-4 border-2",
};

export function UserAvatar({ initials = "U", size = "md", userId, className = "", gradient = false, rounded = "rounded-full", bg, avatarUrl }) {
  const { isOnline } = useOnline();
  const online = userId ? isOnline(userId) : false;
  const sizeClass = sizes[size] || sizes.md;
  const dotSize = dotSizes[size] || dotSizes.md;
  const bgClass = bg || (gradient ? "bg-linear-to-br from-gray-700 to-gray-900" : "bg-[#111827]");

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClass} ${rounded} ${bgClass} flex items-center justify-center font-bold text-white overflow-hidden`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {userId && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotSize} rounded-full border-white ${
            online ? "bg-green-500" : "bg-gray-300"
          }`}
          title={online ? "Online" : "Offline"}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
