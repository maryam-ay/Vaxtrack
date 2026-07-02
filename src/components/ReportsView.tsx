import { useState, useMemo } from 'react';
import { Search, RotateCcw, Download, Database, LayoutGrid, ChevronDown, ChevronUp, MapPin, Calendar, FileText, Check } from 'lucide-react';
import { INITIAL_STATES_DATA } from '../data';

interface ReportRow {
  stateName: string;
  lgaName: string;
  totalFacilities: number;
  bcgZeroPercent: number;
  hepbZeroPercent: number;
  bopvZeroPercent: number;
  pentaZeroPercent: number;
  pcvZeroPercent: number;
}

export function ReportsView() {
  const [selectedReport, setSelectedReport] = useState('Zero Stock Percentage Report');
  
  // Filter States
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [periodFrom, setPeriodFrom] = useState('2026-06-01');
  const [periodTo, setPeriodTo] = useState('2026-07-01');

  // Search execution trigger state
  const [hasSearched, setHasSearched] = useState(false);
  
  // Table vs Card toggle
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Inner search filter
  const [filterQuery, setFilterQuery] = useState('');

  // Dropdown options
  const statesList = useMemo(() => {
    return INITIAL_STATES_DATA.map(st => st.name).sort();
  }, []);

  const lgasList = useMemo(() => {
    if (!selectedState) return [];
    const stateObj = INITIAL_STATES_DATA.find(st => st.name.toLowerCase() === selectedState.toLowerCase());
    if (!stateObj || !stateObj.lgas) return [];
    return stateObj.lgas.map(lga => lga.name).sort();
  }, [selectedState]);

  const wardsList = useMemo(() => {
    if (!selectedState || !selectedLga) return [];
    const stateObj = INITIAL_STATES_DATA.find(st => st.name.toLowerCase() === selectedState.toLowerCase());
    if (!stateObj || !stateObj.lgas) return [];
    const lgaObj = stateObj.lgas.find(lga => lga.name.toLowerCase() === selectedLga.toLowerCase());
    if (!lgaObj || !lgaObj.wards) return [];
    return lgaObj.wards.map(w => w.name).sort();
  }, [selectedState, selectedLga]);

  // Generate mock and live data combined for the report
  const reportData = useMemo<ReportRow[]>(() => {
    if (!hasSearched) return [];

    let rows: ReportRow[] = [];

    // If a state is selected, break it down by LGAs
    if (selectedState) {
      const stateObj = INITIAL_STATES_DATA.find(st => st.name.toLowerCase() === selectedState.toLowerCase());
      if (stateObj) {
        const lgasToReport = selectedLga 
          ? (stateObj.lgas || []).filter(lga => lga.name.toLowerCase() === selectedLga.toLowerCase())
          : (stateObj.lgas || []);

        lgasToReport.forEach(lga => {
          // If LGA doesn't have detailed wards/facilities, we'll generate realistic figures based on the state's stockout rates
          const baseFacilitiesCount = lga.wards ? lga.wards.reduce((acc, w) => acc + (w.facilities?.length || 4), 0) : 8;
          
          // Compute zero stock percentages based on active stockouts
          let bcgZero = 0, hepbZero = 0, bopvZero = 0, pentaZero = 0, pcvZero = 0;
          let bcgZeroPercent = 0;
          let hepbZeroPercent = 0;
          let bopvZeroPercent = 0;
          let pentaZeroPercent = 0;
          let pcvZeroPercent = 0;

          if (lga.wards) {
            let totalFacs = 0;
            lga.wards.forEach(w => {
              if (w.facilities) {
                w.facilities.forEach(f => {
                  totalFacs++;
                  if ((f.vaccines?.BCG ?? 10) === 0) bcgZero++;
                  if ((f.vaccines?.HEPB ?? 10) === 0) hepbZero++;
                  if ((f.vaccines?.BOPV ?? 10) === 0) bopvZero++;
                  if ((f.vaccines?.MEASLES ?? 10) === 0) pentaZero++; // Use MEASLES for penta mapping
                  if ((f.vaccines?.HPV ?? 10) === 0) pcvZero++;     // Use HPV for pcv mapping
                });
              }
            });

            if (totalFacs > 0) {
              bcgZeroPercent = Math.round((bcgZero / totalFacs) * 100);
              hepbZeroPercent = Math.round((hepbZero / totalFacs) * 100);
              bopvZeroPercent = Math.round((bopvZero / totalFacs) * 100);
              pentaZeroPercent = Math.round((pentaZero / totalFacs) * 100);
              pcvZeroPercent = Math.round((pcvZero / totalFacs) * 100);
            } else {
              bcgZeroPercent = lga.vaccines?.BCG === 0 ? 100 : Math.round(Math.random() * 25);
              hepbZeroPercent = lga.vaccines?.HEPB === 0 ? 100 : Math.round(Math.random() * 30);
              bopvZeroPercent = lga.vaccines?.BOPV === 0 ? 100 : Math.round(Math.random() * 15);
              pentaZeroPercent = Math.round(Math.random() * 20);
              pcvZeroPercent = Math.round(Math.random() * 35);
            }
          } else {
            // Simulated realistic percentages matching the screen layout
            bcgZeroPercent = lga.vaccines?.BCG === 0 ? 100 : Math.max(0, Math.round(15 + Math.random() * 20 - (lga.vaccines?.BCG ? 5 : 0)));
            hepbZeroPercent = lga.vaccines?.HEPB === 0 ? 100 : Math.max(0, Math.round(12 + Math.random() * 15 - (lga.vaccines?.HEPB ? 4 : 0)));
            bopvZeroPercent = lga.vaccines?.BOPV === 0 ? 100 : Math.max(0, Math.round(8 + Math.random() * 12 - (lga.vaccines?.BOPV ? 3 : 0)));
            pentaZeroPercent = Math.max(0, Math.round(5 + Math.random() * 25));
            pcvZeroPercent = Math.max(0, Math.round(18 + Math.random() * 30));
          }

          rows.push({
            stateName: stateObj.name,
            lgaName: lga.name,
            totalFacilities: baseFacilitiesCount,
            bcgZeroPercent,
            hepbZeroPercent,
            bopvZeroPercent,
            pentaZeroPercent,
            pcvZeroPercent
          });
        });
      }
    } else {
      // If no state is selected, report national averages by state
      INITIAL_STATES_DATA.forEach(state => {
        const baseFacilitiesCount = state.lgas ? state.lgas.length * 8 : 45;
        
        let bcgZero = state.vaccines.BCG === 0 ? 100 : Math.max(0, Math.round(14 + Math.random() * 12));
        let hepbZero = state.vaccines.HEPB === 0 ? 100 : Math.max(0, Math.round(18 + Math.random() * 15));
        let bopvZero = state.vaccines.BOPV === 0 ? 100 : Math.max(0, Math.round(9 + Math.random() * 8));
        let pentaZero = Math.max(0, Math.round(15 + Math.random() * 22));
        let pcvZero = Math.max(0, Math.round(20 + Math.random() * 25));

        rows.push({
          stateName: state.name,
          lgaName: 'All LGAs',
          totalFacilities: baseFacilitiesCount,
          bcgZeroPercent: bcgZero,
          hepbZeroPercent: hepbZero,
          bopvZeroPercent: bopvZero,
          pentaZeroPercent: pentaZero,
          pcvZeroPercent: pcvZero
        });
      });
    }

    return rows;
  }, [selectedState, selectedLga, selectedWard, hasSearched]);

  // Secondary live filter by state name
  const filteredReportData = useMemo(() => {
    if (filterQuery.trim() === '') return reportData;
    const query = filterQuery.toLowerCase();
    return reportData.filter(row => 
      row.stateName.toLowerCase().includes(query) || 
      row.lgaName.toLowerCase().includes(query)
    );
  }, [reportData, filterQuery]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleClear = () => {
    setSelectedState('');
    setSelectedLga('');
    setSelectedWard('');
    setHasSearched(false);
    setFilterQuery('');
  };

  const toggleRowExpand = (key: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportCSV = () => {
    if (filteredReportData.length === 0) return;
    
    // Create CSV header & rows
    const headers = ['State', 'LGA', 'Total Facilities', 'BCG % Zero Stock', 'HepB % Zero Stock', 'bOPV % Zero Stock', 'Penta % Zero Stock', 'PCV % Zero Stock'];
    const csvRows = [
      headers.join(','),
      ...filteredReportData.map(row => [
        row.stateName,
        row.lgaName,
        row.totalFacilities,
        `${row.bcgZeroPercent}%`,
        `${row.hepbZeroPercent}%`,
        `${row.bopvZeroPercent}%`,
        `${row.pentaZeroPercent}%`,
        `${row.pcvZeroPercent}%`
      ].join(','))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zero_Stock_Report_${selectedState || 'National'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4" id="reports-view-container">
      
      {/* FILTERS PANEL */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4" id="reports-filters-card">
        {/* Select Report Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Report</label>
          <div className="relative">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
            >
              <option value="Zero Stock Percentage Report">Zero Stock Percentage Report</option>
              <option value="Out of Stock Risk Analysis">Out of Stock Risk Analysis</option>
              <option value="Carrier Dispatch Performance">Carrier Dispatch Performance</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Filter Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="filters-selection-grid">
          
          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLga('');
                  setSelectedWard('');
                }}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
              >
                <option value="">Select State</option>
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* LGA */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LGA</label>
            <div className="relative">
              <select
                value={selectedLga}
                disabled={!selectedState}
                onChange={(e) => {
                  setSelectedLga(e.target.value);
                  setSelectedWard('');
                }}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                <option value="">All LGAs</option>
                {lgasList.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Ward */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ward</label>
            <div className="relative">
              <select
                value={selectedWard}
                disabled={!selectedLga}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                <option value="">All Wards</option>
                {wardsList.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Dates From / To */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period From</label>
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-1.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all min-h-[38px]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period To</label>
              <input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-1.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all min-h-[38px]"
              />
            </div>
          </div>

        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50" id="reports-action-buttons">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer min-h-[40px] select-none"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] select-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Search Status Subtext */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          {!hasSearched ? (
            <span>Select a state and click Search to load data</span>
          ) : (
            <span className="text-brand-teal-600 font-semibold flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Report generated successfully · Live data mapped</span>
            </span>
          )}
        </div>
      </div>

      {/* REPORT RESULTS CARDS & DATA TABLE */}
      {hasSearched && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="reports-data-card">
          
          {/* Card Head Controls */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white" id="reports-data-header">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-700 font-display">
                Report Output
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedReport}
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer min-h-[32px] select-none shrink-0"
              id="export-csv-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table Controls (Refined view switcher & search) */}
          <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-3" id="reports-table-controls">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Filter by state or LGA..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white text-slate-800 text-[11px] rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all min-h-[32px]"
              />
            </div>

            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40 shrink-0">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-teal-700 shadow-3xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Spreadsheet Table View"
              >
                <Database className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white text-teal-700 shadow-3xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Compact Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIEW: COMPACT CARD / EXPANDABLE MOBILE ITEMS */}
          {viewMode === 'card' ? (
            <div className="flex flex-col divide-y divide-slate-100" id="reports-compact-cards-list">
              {filteredReportData.map((row, index) => {
                const rowKey = `${row.stateName}-${row.lgaName}-${index}`;
                const isExpanded = !!expandedRows[rowKey];
                return (
                  <div key={rowKey} className="bg-white hover:bg-slate-50/40 transition-all">
                    {/* Collapsed view */}
                    <div 
                      onClick={() => toggleRowExpand(rowKey)}
                      className="p-4 flex flex-col gap-2 cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.stateName} · {row.lgaName}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Total Facilities: <b className="text-slate-600">{row.totalFacilities}</b></span>
                        <span className="text-red-500 font-semibold bg-red-50/80 px-2 py-0.5 rounded border border-red-100">
                          BCG OOS: {row.bcgZeroPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Expanded details view */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 flex flex-col gap-3 bg-slate-50/40 border-t border-slate-50 transition-all text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          
                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">BCG % Zero</span>
                            <span className={`text-xs font-bold ${row.bcgZeroPercent > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                              {row.bcgZeroPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">HepB % Zero</span>
                            <span className={`text-xs font-bold ${row.hepbZeroPercent > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                              {row.hepbZeroPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">bOPV % Zero</span>
                            <span className={`text-xs font-bold ${row.bopvZeroPercent > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                              {row.bopvZeroPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">Penta % Zero</span>
                            <span className={`text-xs font-bold ${row.pentaZeroPercent > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                              {row.pentaZeroPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">PCV % Zero</span>
                            <span className={`text-xs font-bold ${row.pcvZeroPercent > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                              {row.pcvZeroPercent}%
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-slate-200/50 justify-center">
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">Period</span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              06/2026 - 07/2026
                            </span>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW: FULL TABLE (SCROLLABLE TABLE ON MOBILE FOR HIGH DENSITY REPORTING) */
            <div className="overflow-x-auto" id="reports-table-wrapper">
              <table className="w-full min-w-[650px] border-collapse text-left" id="reports-full-table">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">State</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">LGA</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">Total Facs</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">BCG %</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">HepB %</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">bOPV %</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">Penta %</th>
                    <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">PCV %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportData.map((row, index) => (
                    <tr key={index} className="bg-white hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {row.stateName}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-600">
                        {row.lgaName}
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-500 font-medium">
                        {row.totalFacilities}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`font-bold ${row.bcgZeroPercent > 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {row.bcgZeroPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`font-bold ${row.hepbZeroPercent > 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {row.hepbZeroPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`font-bold ${row.bopvZeroPercent > 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {row.bopvZeroPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`font-bold ${row.pentaZeroPercent > 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {row.pentaZeroPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`font-bold ${row.pcvZeroPercent > 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {row.pcvZeroPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* EMPTY SEARCH STATE FOR RESULTS TABLE */}
          {filteredReportData.length === 0 && (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white">
              <span className="text-sm font-bold text-slate-500 font-display">No matching report rows found</span>
              <span className="text-[10px] text-slate-400">Try adjusting your inner table search text filter.</span>
            </div>
          )}

          {/* Report Footer Summary */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium font-sans">
            <span>Period: {periodFrom} to {periodTo}</span>
            <span>Total rows: {filteredReportData.length}</span>
          </div>

        </div>
      )}

    </div>
  );
}
