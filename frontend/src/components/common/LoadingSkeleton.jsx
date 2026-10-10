import React from 'react';

const LoadingSkeleton = ({ rows = 4, columns = 4, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            <div className="h-4 bg-slate-100 rounded-md w-full"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default table skeleton
  return (
    <div className="w-full space-y-3 animate-pulse">
      {[...Array(rows)].map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center">
          {[...Array(columns)].map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-slate-200 rounded ${
                cIdx === 0 ? 'w-1/4' : cIdx === 1 ? 'w-1/3' : 'w-1/5'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
