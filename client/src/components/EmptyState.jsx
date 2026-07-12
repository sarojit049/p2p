import { cn } from '../lib/utils';
import { MessageSquareDashed } from 'lucide-react';

const EmptyState = ({
  icon: Icon = MessageSquareDashed,
  title = "Nothing to see here",
  description = "There is currently no data available to display.",
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]", className)}>
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
