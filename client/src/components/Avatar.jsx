import { cn } from '../lib/utils';

const Avatar = ({ username = '', size = 'md', online = false, className = '' }) => {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '?';

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500',
  ];

  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center text-white font-semibold shadow-sm",
          sizes[size],
          bgColor
        )}
        aria-label={username ? `${username}'s avatar` : 'User avatar'}
        role="img"
      >
        {initials}
      </div>
      {online && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900",
            size === 'sm' ? "h-2 w-2" : size === 'xl' ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
};

export default Avatar;
