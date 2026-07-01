import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StateData, StockStatus } from '../types';
import { getStockStatus, getStatusDetails, VACCINE_INFO_MAP } from '../data';
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Database, MapPin, Building, Hospital } from 'lucide-react';

interface StateCardProps {
  state: StateData;
  isExpanded: boolean;
  onToggle: () => void;
  highlightedStatuses: StockStatus[];
}

export function StateCard({ state, isExpanded, onToggle, highlightedStatuses }: StateCardProps) {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'lgas'>('vaccines');
  const [expandedLgaId, setExpandedLgaId] = useState<string | null>(null);
  const [expandedWardId, setExpandedWardId] = useState<string | null>(null);

  // Calculate some state statistics
  const totalDoses = Object.values(state.vaccines).reduce((sum, val) => sum + val, 0);
  const stockoutCount = Object.entries(state.vaccines).filter(([_, val]) => val === 0).length;

  // Check if this state has any vaccine in the highlighted statuses
  const hasHighlightedStatus = () => {
    if (highlightedStatuses.length === 0) return true; // no filter active, show normal
    return Object.entries(state.vaccines).some(([code, val]) => {
      const { status } = getStockStatus(code, val);
      return highlightedStatuses.includes(status);
    });
  };

  const getStatusBorderColor = () => {
    if (stockoutCount > 0) return 'border-l-4 border-l-red-500';
    const hasLowStock = Object.entries(state.vaccines).some(([code, val]) => {
      const { status } = getStockStatus(code, val);
      return status === 'below_min' || status === 'reorder';
    });
    if (hasLowStock) return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-emerald-500';
  };

  if (!hasHighlightedStatus()) {
    // If we are filtering and this state doesn't have any matching vaccine status, render with lower opacity or keep hidden
    // Let's render with low opacity to show it doesn't match the active filter, or we can filter it out in App.tsx. 
    // Filtering out in App.tsx is cleaner, so we'll do that there. Let's just render normally here.
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden transition-all duration-200 ${
        isExpanded ? 'ring-1 ring-brand-teal-500 shadow-md' : 'hover:border-slate-200'
      } ${getStatusBorderColor()}`}
      id={`state-card-${state.id}`}
    >
      {/* 44px minimum touch target expand button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 cursor-pointer text-left select-none outline-none focus:bg-slate-50 min-h-[52px]"
        id={`state-card-header-${state.id}`}
        aria-expanded={isExpanded}
        aria-controls={`state-details-${state.id}`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-800 tracking-tight font-display text-base">
            {state.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase font-mono">
            {state.lgas ? `${state.lgas.length} LGAs Covered` : 'State Authority'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Summary Stat */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {totalDoses.toLocaleString()} doses
            </span>
            {stockoutCount > 0 ? (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.2 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />
                {stockoutCount} Stockout{stockoutCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" />
                Adequate Stock
              </span>
            )}
          </div>

          {/* Chevron */}
          <div className="p-1 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Accordion Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`state-details-${state.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-slate-50 bg-slate-50/40"
          >
            {/* Tabs for State with LGAs */}
            {state.lgas && (
              <div className="flex border-b border-slate-100 bg-white/80 px-4" id={`state-tabs-${state.id}`}>
                <button
                  onClick={() => setActiveTab('vaccines')}
                  className={`flex-1 py-3 text-xs font-bold tracking-wide uppercase border-b-2 text-center cursor-pointer transition-all select-none min-h-[44px] ${
                    activeTab === 'vaccines'
                      ? 'border-brand-teal-500 text-brand-teal-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Vaccine Stocks
                </button>
                <button
                  onClick={() => setActiveTab('lgas')}
                  className={`flex-1 py-3 text-xs font-bold tracking-wide uppercase border-b-2 text-center cursor-pointer transition-all select-none min-h-[44px] ${
                    activeTab === 'lgas'
                      ? 'border-brand-teal-500 text-brand-teal-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  LGAs Breakdown ({state.lgas.length})
                </button>
              </div>
            )}

            <div className="p-4 flex flex-col gap-4">
              {/* VACCINES TAB */}
              {(activeTab === 'vaccines' || !state.lgas) && (
                <div className="flex flex-col gap-3.5" id={`vaccines-list-${state.id}`}>
                  {Object.entries(state.vaccines).map(([code, val]) => {
                    const { status, percentage } = getStockStatus(code, val);
                    const details = getStatusDetails(status);
                    
                    let progressColorClass = 'bg-slate-400';
                    if (status === 'out_of_stock') progressColorClass = 'bg-red-500';
                    else if (status === 'below_min') progressColorClass = 'bg-amber-500';
                    else if (status === 'reorder') progressColorClass = 'bg-yellow-400';
                    else if (status === 'adequate') progressColorClass = 'bg-emerald-500';
                    else if (status === 'overstock') progressColorClass = 'bg-blue-500';

                    const isFiltered = highlightedStatuses.length > 0 && !highlightedStatuses.includes(status);

                    return (
                      <div
                        key={code}
                        className={`flex flex-col gap-1.5 p-3 rounded-xl bg-white border border-slate-100/70 transition-all ${
                          isFiltered ? 'opacity-40 scale-98 border-slate-50' : 'shadow-xs'
                        }`}
                      >
                        {/* Key-Value Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono text-sm text-slate-800 tracking-tight">
                                {code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {VACCINE_INFO_MAP[code]?.name || ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm font-mono text-slate-700">
                              {val.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">doses</span>
                          </div>
                        </div>

                        {/* Status Label and Progress Bar */}
                        <div className="flex items-center justify-between text-[10px] mt-0.5">
                          <span className={`font-bold uppercase tracking-wider ${details.colorClass}`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-400 font-mono font-medium">{percentage}% of min-target</span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`h-full rounded-full ${progressColorClass}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LGAs TAB (DRILL DOWN IMPLEMENTATION) */}
              {activeTab === 'lgas' && state.lgas && (
                <div className="flex flex-col gap-3" id={`lgas-list-${state.id}`}>
                  {state.lgas.map((lga) => {
                    const lgaDoses = Object.values(lga.vaccines).reduce((sum, val) => sum + val, 0);
                    const lgaStockout = Object.values(lga.vaccines).filter((val) => val === 0).length;
                    const isLgaExpanded = expandedLgaId === lga.id;

                    return (
                      <div
                        key={lga.id}
                        className="bg-white rounded-xl border border-slate-200/60 overflow-hidden"
                      >
                        {/* LGA Header Button */}
                        <button
                          onClick={() => setExpandedLgaId(isLgaExpanded ? null : lga.id)}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer min-h-[44px] text-left outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-teal-500 shrink-0" />
                            <span className="font-bold text-xs text-slate-700 font-display">
                              {lga.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-100 px-1.5 py-0.5 rounded">
                              {lgaDoses.toLocaleString()} doses
                            </span>
                            {lgaStockout > 0 && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 py-0.5 rounded">
                                {lgaStockout} stockout{lgaStockout > 1 ? 's' : ''}
                              </span>
                            )}
                            {isLgaExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {/* LGA Body */}
                        {isLgaExpanded && (
                          <div className="p-3 border-t border-slate-100 bg-slate-50/20 flex flex-col gap-3.5">
                            {/* Wards list or generic stock display */}
                            {lga.wards ? (
                              <div className="flex flex-col gap-2.5">
                                <div className="text-[9px] font-bold text-slate-400 tracking-wider font-display uppercase">
                                  Wards in {lga.name}
                                </div>
                                {lga.wards.map((ward) => {
                                  const wardDoses = Object.values(ward.vaccines).reduce((sum, val) => sum + val, 0);
                                  const isWardExpanded = expandedWardId === ward.id;

                                  return (
                                    <div key={ward.id} className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                                      <button
                                        onClick={() => setExpandedWardId(isWardExpanded ? null : ward.id)}
                                        className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer min-h-[44px] text-left outline-none"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Building className="w-3.5 h-3.5 text-brand-teal-400 shrink-0" />
                                          <span className="font-semibold text-xs text-slate-600 font-display">
                                            {ward.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-mono text-slate-500 bg-slate-50 px-1 rounded">
                                            {wardDoses.toLocaleString()} doses
                                          </span>
                                          {isWardExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </div>
                                      </button>

                                      {isWardExpanded && (
                                        <div className="p-2.5 border-t border-slate-50 bg-slate-50/10 flex flex-col gap-3">
                                          {/* Facilities drill down */}
                                          {ward.facilities ? (
                                            <div className="flex flex-col gap-2">
                                              <div className="text-[8px] font-bold text-slate-400 tracking-wider font-display uppercase">
                                                Health Facilities
                                              </div>
                                              {ward.facilities.map((facility) => {
                                                const facDoses = Object.values(facility.vaccines).reduce((sum, val) => sum + val, 0);
                                                return (
                                                  <div key={facility.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                                    <div className="flex items-center gap-1.5">
                                                      <Hospital className="w-3.5 h-3.5 text-brand-teal-600 shrink-0" />
                                                      <span className="text-[11px] font-medium text-slate-700">{facility.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-100 px-1.5 py-0.2 rounded">
                                                      {facDoses.toLocaleString()} doses
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : null}

                                          {/* Ward Vaccine grid */}
                                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                                            {Object.entries(ward.vaccines).map(([code, val]) => {
                                              const isZero = val === 0;
                                              const isLow = val < 500;
                                              return (
                                                <div key={code} className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${
                                                  isZero 
                                                    ? 'bg-red-50 border-red-200 text-red-700' 
                                                    : isLow 
                                                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                      : 'bg-slate-50 border-slate-100 text-slate-600'
                                                }`}>
                                                  <span className="text-[8px] font-bold font-mono">{code}</span>
                                                  <span className="text-[10px] font-bold font-mono mt-0.5">{val}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* LGA generic vaccine grid */
                              <div className="grid grid-cols-4 gap-1.5 pt-1">
                                {Object.entries(lga.vaccines).map(([code, val]) => {
                                  const isZero = val === 0;
                                  const isLow = val < 2000;
                                  return (
                                    <div key={code} className={`p-1.5 rounded-lg border flex flex-col items-center justify-center text-center ${
                                      isZero 
                                        ? 'bg-red-50 border-red-200 text-red-700' 
                                        : isLow 
                                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                                          : 'bg-slate-50 border-slate-100 text-slate-600'
                                    }`}>
                                      <span className="text-[8px] font-bold font-mono">{code}</span>
                                      <span className="text-[10px] font-bold font-mono mt-0.5">{val.toLocaleString()}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
