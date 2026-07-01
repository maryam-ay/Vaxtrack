import { useState, useEffect } from 'react';
import { KPIIndicator } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Info, AlertCircle, CheckCircle, Flame } from 'lucide-react';

interface KPIGridProps {
  indicators: KPIIndicator[];
  onCardClick?: (id: string) => void;
  activeCardId?: string | null;
}

export function KPIGrid({ indicators, onCardClick, activeCardId }: KPIGridProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(indicators.length / 2);

  // Auto-focus page when active KPI filter is set externally
  useEffect(() => {
    if (activeCardId) {
      const activeIndex = indicators.findIndex((ind) => ind.id === activeCardId);
      if (activeIndex !== -1) {
        setPage(Math.floor(activeIndex / 2));
      }
    }
  }, [activeCardId, indicators]);

  const handlePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_target':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'critical':
        return <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />;
      case 'attention':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_target':
        return 'ON TARGET';
      case 'critical':
        return 'CRITICAL';
      case 'attention':
        return 'ATTENTION';
      default:
        return 'INFORMATIONAL';
    }
  };

  // Get exactly 2 indicators for the current page
  const visibleIndicators = indicators.slice(page * 2, page * 2 + 2);

  return (
    <div className="flex flex-col gap-3" id="kpi-carousel-root">
      {/* Viewport container with sliding/fading elements */}
      <div className="relative min-h-[114px] overflow-hidden" id="kpi-carousel-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-2.5 sm:gap-3 cursor-grab active:cursor-grabbing touch-pan-y select-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_event, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                handleNext();
              } else if (info.offset.x > swipeThreshold) {
                handlePrev();
              }
            }}
          >
            {visibleIndicators.map((indicator) => {
              const isActive = activeCardId === indicator.id;
              return (
                <motion.div
                  key={indicator.id}
                  onClick={() => onCardClick?.(indicator.id)}
                  className={`bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between p-3 min-h-[114px] transition-all cursor-pointer relative overflow-hidden select-none active:scale-98 ${
                    indicator.topColorClass
                  } ${
                    isActive
                      ? 'ring-2 ring-brand-teal-500 shadow-md bg-brand-teal-100/30'
                      : 'hover:shadow-sm hover:border-slate-200'
                  }`}
                  id={`kpi-card-${indicator.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${indicator.title}: ${indicator.value}. ${indicator.subtext}`}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Header / Title */}
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider font-display truncate max-w-full">
                      {indicator.title}
                    </span>
                  </div>

                  {/* Middle / Value */}
                  <div className="my-1">
                    <span className={`text-2xl font-bold font-display ${indicator.textColorClass}`}>
                      {indicator.value}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {indicator.subtext}
                    </p>
                  </div>

                  {/* Footer / Badge */}
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50/80 gap-1 overflow-hidden">
                    <span className="text-[8px] text-slate-400 font-medium font-mono truncate">
                      {indicator.target || 'N/A'}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${indicator.badgeBgClass} shrink-0`}
                    >
                      {getStatusIcon(indicator.status)}
                      <span className={`text-[7px] font-bold tracking-wide font-display ${indicator.badgeTextClass}`}>
                        {getStatusLabel(indicator.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CAROUSEL CONTROLS BAR: Centered pagination indicator dots */}
      <div className="flex items-center justify-center py-2" id="kpi-carousel-controls">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isCurrent = idx === page;
            return (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`transition-all rounded-full cursor-pointer h-2 min-h-[16px] min-w-[16px] flex items-center justify-center`}
                aria-label={`Go to page ${idx + 1}`}
                title={`Go to page ${idx + 1}`}
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isCurrent ? 'w-5 h-2 bg-brand-teal-500' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
