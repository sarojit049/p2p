/**
 * Loader Component
 * Spinner for loading states.
 * Per 09_UI_UX_SPECIFICATION.md — Loading States
 */
const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full border-blue-600 border-t-transparent animate-spin ${sizes[size]} ${className}`}
    />
  );
};

export default Loader;
