import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({
  value = 0,
  onChange,
  interactive = false,
  size = 'md',
  showNumber = false,
  totalStars = 5,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  }[size] || 'w-5 h-5';

  const effectiveValue = interactive && hoverValue > 0 ? hoverValue : Math.round(Number(value) || 0);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(totalStars)].map((_, idx) => {
          const starNumber = idx + 1;
          const isFilled = starNumber <= effectiveValue;

          return (
            <button
              key={starNumber}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverValue(starNumber)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform focus:outline-none p-0.5'
                  : 'cursor-default pointer-events-none'
              }`}
              title={interactive ? `Rate ${starNumber} star${starNumber > 1 ? 's' : ''}` : `${value} stars`}
            >
              <Star
                className={`${starSizes} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {Number(value) > 0 ? Number(value).toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
