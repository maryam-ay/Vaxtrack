import { StockStatus } from '../types';
import { getStatusDetails } from '../data';
import { motion } from 'motion/react';

interface LegendFilterProps {
  selectedStatuses: StockStatus[];
  onToggleStatus: (status: StockStatus) => void;
  stockoutCount: number;
}

const ALL_STATUSES: StockStatus[] = ['out_of_stock', 'below_min', 'reorder', 'adequate', 'overstock'];

export function LegendFilter({ selectedStatuses, onToggleStatus, stockoutCount }: LegendFilterProps) {
  const hasActiveFilters = selectedStatuses.length > 0;
  return (
    <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-2xs flex flex-col gap-2" id="legend-container">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-extrabold text-slate-500 tracking-wider font-display uppercase">
          VACCINE STOCK LEGEND
        </span>
        {hasActiveFilters && (
          <button 
            onClick={() => {
              ALL_STATUSES.forEach(status => {
                if (selectedStatuses.includes(status)) {
                  onToggleStatus(status);
                }
              });
            }}
            className="text-[10px] text-brand-teal-600 hover:text-brand-teal-800 font-bold select-none cursor-pointer"
          >
            Clear Filter ({selectedStatuses.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1" id="legend-pills-list">
        {ALL_STATUSES.map((status) => {
          const details = getStatusDetails(status);
          const isSelected = selectedStatuses.includes(status);
          
          let colorDot = 'bg-slate-400';
          if (status === 'out_of_stock') colorDot = 'bg-red-500';
          else if (status === 'below_min') colorDot = 'bg-amber-500';
          else if (status === 'reorder') colorDot = 'bg-yellow-400';
          else if (status === 'adequate') colorDot = 'bg-emerald-500';
          else if (status === 'overstock') colorDot = 'bg-blue-500';

          return (
            <button
              key={status}
              onClick={() => onToggleStatus(status)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-semibold transition-all select-none cursor-pointer min-h-[30px] ${
                isSelected
                  ? 'border-brand-teal-500 bg-brand-teal-100/25 text-brand-teal-800 shadow-3xs'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50 hover:border-slate-200'
              }`}
              id={`legend-pill-${status}`}
              title={`Click to filter by ${details.label}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colorDot} shrink-0`} />
              <span className="truncate">{details.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
