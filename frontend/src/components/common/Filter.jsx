import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';

const Filter = ({ label = 'Filter', value, options = [], onChange, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
        <FilterIcon className="w-3.5 h-3.5 mr-1" />
        {label}:
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
