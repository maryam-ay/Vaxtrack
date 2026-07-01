import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, MapPin, Building, Hospital } from 'lucide-react';
import { StateData } from '../types';
import { getStockStatus } from '../data';

interface StockMatrixTableProps {
  states: StateData[];
  searchQuery: string;
}

const VACCINE_COLUMNS = [
  'BCG',
  'BOPV',
  'HPV',
  'HEPB',
  'IPV',
  'MEASLES',
  'MENA',
  'MR',
  'PCV',
  'PENTA',
  'ROTA',
  'TD',
  'YF',
];

export function StockMatrixTable({ states, searchQuery }: StockMatrixTableProps) {
  // Expanded rows state tracking
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({
    abia: true, // Expand Abia by default to match screenshot and show nested LGA/Ward/Facility structure
  });
  const [expandedLgas, setExpandedLgas] = useState<Record<string, boolean>>({
    'aba-north': true, // Expand Aba North by default
  });
  const [expandedWards, setExpandedWards] = useState<Record<string, boolean>>({
    'ward-1': true, // Expand Ward 1 by default
  });

  const toggleState = (stateId: string) => {
    setExpandedStates((prev) => ({ ...prev, [stateId]: !prev[stateId] }));
  };

  const toggleLga = (lgaId: string) => {
    setExpandedLgas((prev) => ({ ...prev, [lgaId]: !prev[lgaId] }));
  };

  const toggleWard = (wardId: string) => {
    setExpandedWards((prev) => ({ ...prev, [wardId]: !prev[wardId] }));
  };

  // Cell color status coding according to getStockStatus / screenshot rules
  const getCellStyles = (code: string, value: number | undefined) => {
    if (value === undefined) {
      return 'bg-slate-50 text-slate-300 text-center font-mono text-[11px] border-slate-100';
    }

    if (value === 0) {
      return 'bg-red-50 text-red-700 font-bold text-right font-mono text-[11px] border-slate-100 px-2';
    }

    const { status } = getStockStatus(code, value);

    switch (status) {
      case 'out_of_stock':
        return 'bg-red-50 text-red-700 font-bold text-right font-mono text-[11px] border-slate-100 px-2';
      case 'below_min':
      case 'reorder':
        return 'bg-amber-50/70 text-amber-700 font-semibold text-right font-mono text-[11px] border-slate-100 px-2';
      case 'adequate':
        return 'bg-emerald-50/50 text-emerald-700 font-medium text-right font-mono text-[11px] border-slate-100 px-2';
      case 'overstock':
        return 'bg-cyan-50/50 text-cyan-700 font-medium text-right font-mono text-[11px] border-slate-100 px-2';
      default:
        return 'bg-white text-slate-700 text-right font-mono text-[11px] border-slate-100 px-2';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="stock-matrix-table-container">
      {/* Table responsive horizontal scroll wrapper */}
      <div className="overflow-x-auto select-none">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200">
              <th className="py-3 px-4 font-display text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 w-[240px] border-r border-slate-200">
                STATE / LGA
              </th>
              {VACCINE_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="py-3 px-2 font-display text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right border-r border-slate-200/50 last:border-r-0 min-w-[76px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {states.map((state) => {
              const isStateExpanded = !!expandedStates[state.id];

              return (
                <Fragment key={state.id}>
                  {/* LEVEL 1: State Row */}
                  <tr className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-3 font-display text-xs font-bold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-1 cursor-pointer select-none min-h-[38px] border-r border-slate-100 shadow-xs"
                        onClick={() => toggleState(state.id)}>
                      <span className="text-slate-400 shrink-0">
                        {isStateExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                      <span>{state.name}</span>
                    </td>

                    {VACCINE_COLUMNS.map((col) => {
                      const val = state.vaccines[col];
                      return (
                        <td key={col} className={`py-2 px-2 border-r border-slate-200/30 text-right ${getCellStyles(col, val)}`}>
                          {val !== undefined ? val.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* LEVEL 2: LGAs (rendered if State is expanded) */}
                  {isStateExpanded &&
                    state.lgas?.map((lga) => {
                      const isLgaExpanded = !!expandedLgas[lga.id];

                      return (
                        <Fragment key={lga.id}>
                          <tr className="bg-slate-50/20 hover:bg-slate-50/50 transition-colors group">
                            <td className="py-2 px-3 text-xs font-medium text-slate-600 pl-8 sticky left-0 bg-slate-50 group-hover:bg-slate-50 z-10 flex items-center gap-1 cursor-pointer select-none border-r border-slate-100"
                                onClick={() => toggleLga(lga.id)}>
                              <span className="text-slate-400 shrink-0">
                                {isLgaExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </span>
                              <MapPin className="w-3 h-3 text-brand-teal-500 shrink-0" />
                              <span className="text-slate-700 font-semibold">{lga.name}</span>
                            </td>

                            {VACCINE_COLUMNS.map((col) => {
                              const val = lga.vaccines[col];
                              return (
                                <td key={col} className={`py-1.5 px-2 border-r border-slate-200/30 text-right ${getCellStyles(col, val)}`}>
                                  {val !== undefined ? val.toLocaleString() : '-'}
                                </td>
                              );
                            })}
                          </tr>

                          {/* LEVEL 3: Wards (rendered if LGA is expanded) */}
                          {isLgaExpanded &&
                            lga.wards?.map((ward) => {
                              const isWardExpanded = !!expandedWards[ward.id];

                              return (
                                <Fragment key={ward.id}>
                                  <tr className="bg-white hover:bg-slate-50/40 transition-colors group">
                                    <td className="py-2 px-3 text-[11px] text-slate-500 pl-14 sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-1 cursor-pointer select-none border-r border-slate-100"
                                        onClick={() => toggleWard(ward.id)}>
                                      <span className="text-slate-400 shrink-0">
                                        {isWardExpanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                      </span>
                                      <Building className="w-3 h-3 text-brand-teal-400 shrink-0" />
                                      <span className="text-slate-600 font-medium">{ward.name}</span>
                                    </td>

                                    {VACCINE_COLUMNS.map((col) => {
                                      const val = ward.vaccines[col];
                                      return (
                                        <td key={col} className={`py-1 px-2 border-r border-slate-200/30 text-right ${getCellStyles(col, val)}`}>
                                          {val !== undefined ? val.toLocaleString() : '-'}
                                        </td>
                                      );
                                    })}
                                  </tr>

                                  {/* LEVEL 4: Health Facilities (rendered if Ward is expanded) */}
                                  {isWardExpanded &&
                                    ward.facilities?.map((facility) => (
                                      <tr key={facility.id} className="bg-white/40 hover:bg-slate-50/60 transition-colors group">
                                        <td className="py-1.5 px-3 text-[10px] text-slate-400 pl-20 sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-1 select-none border-r border-slate-100">
                                          <span className="text-slate-300 shrink-0 font-mono">└─</span>
                                          <Hospital className="w-3 h-3 text-brand-teal-600 shrink-0" />
                                          <span className="text-slate-500 truncate max-w-[130px]">{facility.name}</span>
                                        </td>

                                        {VACCINE_COLUMNS.map((col) => {
                                          const val = facility.vaccines[col];
                                          return (
                                            <td key={col} className={`py-0.5 px-2 border-r border-slate-200/30 text-right ${getCellStyles(col, val)}`}>
                                              {val !== undefined ? val.toLocaleString() : '-'}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                </Fragment>
                              );
                            })}
                        </Fragment>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
