import { cn } from '../lib/utils';

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
      className={cn(
        "rounded-full border-blue-600 dark:border-blue-500 border-t-transparent dark:border-t-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

export default Loader;
