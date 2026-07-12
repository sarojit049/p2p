/**
 * Avatar Component
 * Displays user initials or profile image.
 */
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

  // Generate a consistent background color from username
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-amber-500', 'bg-red-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500',
  ];

  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;
  const bgColor = colors[colorIndex];

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold`}
        aria-label={username ? `${username}'s avatar` : 'User avatar'}
        role="img"
      >
        {initials}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"
          aria-label="Online"
        />
      )}
    </div>
  );
};

export default Avatar;
