import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No records found',
  description = 'There are no records matching your request or filter criteria.',
  icon: Icon = Inbox,
  actionButton = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
