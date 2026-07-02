import { useState, useMemo, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronUp,
  LayoutGrid,
  Database,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface FacilityRecord {
  id: string;
  name: string;
  type: 'EHF' | 'UHF';
  lga: string;
  state: string;
  assignedStore: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_FACILITIES: FacilityRecord[] = [
  { id: 'F001', name: 'Kaduna PHC', type: 'EHF', lga: 'Kaduna North', state: 'Kaduna State', assignedStore: 'State Central', status: 'Active' },
  { id: 'F002', name: 'Kano General Hospital', type: 'UHF', lga: 'Kano Municipal', state: 'Kano State', assignedStore: 'Kano Warehouse', status: 'Active' },
  { id: 'F003', name: 'Rivers Medical Centre', type: 'EHF', lga: 'Port Harcourt', state: 'Rivers State', assignedStore: 'PH Warehouse', status: 'Active' },
  { id: 'F004', name: 'Borno Primary Clinic', type: 'UHF', lga: 'Maiduguri', state: 'Borno State', assignedStore: 'Borno Central', status: 'Inactive' },
];

export function FacilitySetupView() {
  const [facilities, setFacilities] = useState<FacilityRecord[]>(INITIAL_FACILITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedLga, setSelectedLga] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedMobileFacilityId, setExpandedMobileFacilityId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof FacilityRecord>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field: keyof FacilityRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const stats = useMemo(() => {
    const total = facilities.length;
    const ehf = facilities.filter(f => f.type === 'EHF').length;
    const uhf = facilities.filter(f => f.type === 'UHF').length;
    return { total, ehf, uhf };
  }, [facilities]);

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(facilities.map(f => f.state))).sort();
  }, [facilities]);

  const uniqueLgas = useMemo(() => {
    const stateFiltered = selectedState === 'all' 
      ? facilities 
      : facilities.filter(f => f.state === selectedState);
    return Array.from(new Set(stateFiltered.map(f => f.lga))).sort();
  }, [facilities, selectedState]);

  const filteredFacilities = useMemo(() => {
    const filtered = facilities.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'all' || f.type === selectedType;
      const matchState = selectedState === 'all' || f.state === selectedState;
      const matchLga = selectedLga === 'all' || f.lga === selectedLga;
      const matchStatus = selectedStatus === 'all' || f.status === selectedStatus;
      return matchSearch && matchType && matchState && matchLga && matchStatus;
    });

    return [...filtered].sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [facilities, searchQuery, selectedType, selectedState, selectedLga, selectedStatus, sortField, sortDirection]);

  const deleteFacility = (id: string) => {
    setFacilities(prev => prev.filter(f => f.id !== id));
    setOpenMenuId(null);
  };

  const toggleFacilityStatus = (id: string) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f));
    setOpenMenuId(null);
  };

  const getInitials = (name: string) => {
    if (!name) return 'FC';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-150',
      'bg-emerald-50 text-emerald-700 border-emerald-150',
      'bg-indigo-50 text-indigo-700 border-indigo-150',
      'bg-purple-50 text-purple-700 border-purple-150',
      'bg-amber-50 text-amber-700 border-amber-150',
      'bg-rose-50 text-rose-700 border-rose-150',
      'bg-teal-50 text-teal-700 border-teal-150'
    ];
    let sum = 0;
    const cleanName = name || 'FC';
    for (let i = 0; i < cleanName.length; i++) sum += cleanName.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const ActionMenu = ({ facility }: { facility: FacilityRecord }) => (
    <div className="relative inline-block text-left" ref={openMenuId === facility.id ? menuRef : null}>
      <button 
        onClick={() => setOpenMenuId(openMenuId === facility.id ? null : facility.id)} 
        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {openMenuId === facility.id && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -5 }} 
            className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1"
          >
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => alert(`Edit ${facility.name}`)}
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Facility
            </button>
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => toggleFacilityStatus(facility.id)}
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
            </button>
            <div className="border-t border-slate-100 my-1"></div>
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={() => deleteFacility(facility.id)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Facility
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full" id="facility-setup-view">
      {/* 3 KPI Cards Row */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="facility-stats-grid">
        {[
          { label: 'TOTAL FACILITIES', val: stats.total, color: '#3b82f6' },
          { label: 'EHF - EQUIPPED', val: stats.ehf, color: '#0d9488' },
          { label: 'UHF - UNEQUIPPED', val: stats.uhf, color: '#6366f1' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: card.color }}>
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">{card.label}</span>
            <span className="text-2xl font-bold text-slate-800 font-display mt-1">{card.val}</span>
          </div>
        ))}
      </div>

      {/* Main Container wrapping Header, Controls, and Data */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="facilities-data-card">
        
        {/* CARD HEADER */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col gap-0.5" id="facility-card-header">
          <h3 className="text-xs font-bold text-slate-700 font-display">
            Facility Directory
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            All registered facilities and their current status
          </p>
        </div>

        {/* CONTROLS BAR: SEARCH, FILTERS & GRID PREFERENCES */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3" id="facility-controls-bar">
          
          {/* Search Box and Dropdowns */}
          <div className="flex flex-1 gap-3 flex-col lg:flex-row w-full lg:w-auto">
            
            <div className="flex items-center gap-2 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search facility name..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white text-slate-800 text-[11px] rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all min-h-[32px]" 
                />
              </div>

              <div className="flex items-center gap-1 shrink-0 select-none">
                <button 
                  onClick={() => setViewMode('table')} 
                  className={`p-1 rounded transition-colors ${viewMode === 'table' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Spreadsheet Table View"
                >
                  <Database className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('compact')} 
                  className={`p-1 rounded transition-colors ${viewMode === 'compact' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Compact Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <div className="relative flex-1 sm:w-24 shrink-0">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">Type</option>
                  <option value="EHF">EHF</option>
                  <option value="UHF">UHF</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:w-24 shrink-0">
                <select 
                  value={selectedState} 
                  onChange={(e) => { setSelectedState(e.target.value); setSelectedLga('all'); }} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">State</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:w-24 shrink-0">
                <select 
                  value={selectedLga} 
                  onChange={(e) => setSelectedLga(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">LGA</option>
                  {uniqueLgas.map(lga => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:w-24 shrink-0">
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Data Panel */}
        <div id="facilities-data-panel">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto" id="facilities-table-horizontal-wrapper">
              <table className="w-full min-w-[950px] border-collapse text-left" id="facilities-table">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[150px]" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1.5">
                        FACILITY NAME <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[80px]" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-1.5">
                        TYPE <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'type' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[120px]" onClick={() => handleSort('lga')}>
                      <div className="flex items-center gap-1.5">
                        LGA <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'lga' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[120px]" onClick={() => handleSort('state')}>
                      <div className="flex items-center gap-1.5">
                        STATE <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'state' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[150px]" onClick={() => handleSort('assignedStore')}>
                      <div className="flex items-center gap-1.5">
                        ASSIGNED STORE <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'assignedStore' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[100px]" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1.5">
                        STATUS <ArrowUpDown className="w-2.5 h-2.5" />
                        {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-teal-600" /> : <ArrowDown className="w-2.5 h-2.5 text-teal-600" />)}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[60px]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFacilities.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors text-[11.5px] bg-white group">
                      <td className="py-3 px-3 font-bold text-teal-600">{f.name}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${f.type === 'EHF' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {f.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{f.lga}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{f.state}</td>
                      <td className="py-3 px-3 text-slate-600">{f.assignedStore}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${f.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right"><ActionMenu facility={f} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
               {filteredFacilities.map(f => (
                  <div key={f.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(f.name)}`}>
                          {getInitials(f.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-teal-600 text-[13px]">{f.name}</span>
                          <button 
                            onClick={() => setExpandedMobileFacilityId(expandedMobileFacilityId === f.id ? null : f.id)} 
                            className="flex items-center text-[10px] text-slate-400 font-bold uppercase cursor-pointer hover:text-slate-600"
                          >
                            {expandedMobileFacilityId === f.id ? 'Hide Details' : 'View Details'} 
                            {expandedMobileFacilityId === f.id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                          </button>
                        </div>
                      </div>
                      <ActionMenu facility={f} />
                    </div>
                    <AnimatePresence>
                      {expandedMobileFacilityId === f.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }} 
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2 text-xs">
                              <div className="text-slate-500">
                                <strong>Type:</strong> <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${f.type === 'EHF' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'}`}>{f.type}</span> · <strong>State:</strong> {f.state}
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${f.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{f.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 rounded-xl p-2.5">
                              <div><strong>LGA:</strong> {f.lga}</div>
                              <div><strong>Assigned Store:</strong> {f.assignedStore}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>
          )}
        </div>
        
        {/* FOOTER */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Showing {filteredFacilities.length} facilities
          </span>
        </div>
      </div>
    </div>
  );
}
