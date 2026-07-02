import { useState, useMemo, useRef, useEffect } from 'react';
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
  Upload,
  Sparkles,
  Server,
  Thermometer,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ColdChainStoreRecord {
  id: string;
  name: string;
  type: 'SCS' | 'LCS';
  state: string;
  lga: string;
  storageCapacity: string; // e.g., "12,400 L"
  cceUnits: number; // Cold Chain Equipment units
  status: 'Active' | 'Inactive';
}

const INITIAL_STORES: ColdChainStoreRecord[] = [
  { id: 'S001', name: 'Kaduna State Central Store', type: 'SCS', state: 'Kaduna State', lga: 'Kaduna North', storageCapacity: '15,000 L', cceUnits: 12, status: 'Active' },
  { id: 'S002', name: 'Kano Zonal Store', type: 'SCS', state: 'Kano State', lga: 'Kano Municipal', storageCapacity: '25,000 L', cceUnits: 18, status: 'Active' },
  { id: 'S003', name: 'Zaria LGA Store', type: 'LCS', state: 'Kaduna State', lga: 'Zaria', storageCapacity: '4,500 L', cceUnits: 4, status: 'Active' },
  { id: 'S004', name: 'Fagge Cold Room', type: 'LCS', state: 'Kano State', lga: 'Fagge', storageCapacity: '6,200 L', cceUnits: 5, status: 'Inactive' },
  { id: 'S005', name: 'Port Harcourt Apex Store', type: 'SCS', state: 'Rivers State', lga: 'Port Harcourt', storageCapacity: '18,500 L', cceUnits: 14, status: 'Active' },
];

export function ColdChainStoreSetupView() {
  const [stores, setStores] = useState<ColdChainStoreRecord[]>(INITIAL_STORES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedMobileStoreId, setExpandedMobileStoreId] = useState<string | null>(null);
  
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

  const stats = useMemo(() => {
    const total = stores.length;
    const scs = stores.filter(s => s.type === 'SCS').length;
    const lcs = stores.filter(s => s.type === 'LCS').length;
    return { total, scs, lcs };
  }, [stores]);

  const uniqueStates = useMemo(() => {
    const states = new Set(stores.map(s => s.state));
    return Array.from(states);
  }, [stores]);

  const filteredStores = useMemo(() => stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'all' || s.type === selectedType;
    const matchState = selectedState === 'all' || s.state === selectedState;
    const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchSearch && matchType && matchState && matchStatus;
  }), [stores, searchQuery, selectedType, selectedState, selectedStatus]);

  const toggleStatus = (id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    setOpenMenuId(null);
  };

  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
    setOpenMenuId(null);
  };

  const getInitials = (name: string) => {
    if (!name) return 'CS';
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
    const cleanName = name || 'CS';
    for (let i = 0; i < cleanName.length; i++) sum += cleanName.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const ActionMenu = ({ store }: { store: ColdChainStoreRecord }) => (
    <div className="relative inline-block" ref={openMenuId === store.id ? menuRef : null}>
      <button 
        onClick={() => setOpenMenuId(openMenuId === store.id ? null : store.id)} 
        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {openMenuId === store.id && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -5 }} 
            className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1"
          >
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => alert(`Edit ${store.name}`)}
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Store
            </button>
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => toggleStatus(store.id)}
            >
              <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
            </button>
            <div className="border-t border-slate-100 my-1"></div>
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={() => deleteStore(store.id)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Store
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full" id="cold-chain-store-setup-view">
      
      {/* Action Buttons Row */}
      <div className="flex items-center justify-end gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all select-none cursor-pointer min-h-[36px]"
          id="header-upload-bulk-btn"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Bulk Data</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
          id="header-add-store-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Store</span>
        </button>
      </div>

      {/* 3 KPI Cards Row */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="store-stats-grid">
        {[
          { label: 'TOTAL STORES', val: stats.total, color: 'blue' },
          { label: 'STATE STORES (SCS)', val: stats.scs, color: 'teal' },
          { label: 'LGA STORES (LCS)', val: stats.lcs, color: 'indigo' }
        ].map((card, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" 
            style={{ borderLeftColor: i === 0 ? '#3b82f6' : i === 1 ? '#0d9488' : '#6366f1' }}
          >
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">{card.label}</span>
            <span className="text-2xl font-bold text-slate-800 font-display mt-1">{card.val}</span>
          </div>
        ))}
      </div>

      {/* Main Container wrapping Header, Controls, and Data */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="stores-data-card">
        
        {/* CARD HEADER */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col gap-0.5" id="store-card-header">
          <h3 className="text-xs font-bold text-slate-700 font-display">
            Cold Chain Store Directory
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            All registered cold chain stores (SCS & LCS) and their current status
          </p>
        </div>

        {/* CONTROLS BAR: SEARCH, FILTERS & GRID PREFERENCES */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3" id="store-controls-bar">
          
          <div className="flex flex-1 gap-3 flex-col lg:flex-row w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search store name..." 
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
              <div className="relative flex-1 sm:w-32 shrink-0">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">Type</option>
                  <option value="SCS">SCS (State Store)</option>
                  <option value="LCS">LCS (LGA Store)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:w-28 shrink-0">
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)} 
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[32px] cursor-pointer"
                >
                  <option value="all">State</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:w-28 shrink-0">
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
        <div id="stores-data-panel">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto" id="stores-table-horizontal-wrapper">
              <table className="w-full min-w-[950px] border-collapse text-left" id="stores-table">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        STORE NAME <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[80px]">
                      <div className="flex items-center gap-1.5">
                        TYPE <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        STATE <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        LGA <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        STORAGE CAPACITY <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none text-center min-w-[100px]">
                      <div className="flex items-center justify-center gap-1.5">
                        CCE UNITS <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none min-w-[100px]">
                      <div className="flex items-center gap-1.5">
                        STATUS <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[60px]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStores.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors text-[11.5px] bg-white group">
                      <td className="py-3 px-3 font-bold text-teal-600">{s.name}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.type === 'SCS' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{s.state}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{s.lga || '-'}</td>
                      <td className="py-3 px-3 text-slate-600">{s.storageCapacity}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">{s.cceUnits}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right"><ActionMenu store={s} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
               {filteredStores.map(s => (
                  <div key={s.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(s.name)}`}>
                          {getInitials(s.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-teal-600 text-[13px]">{s.name}</span>
                          <button 
                            onClick={() => setExpandedMobileStoreId(expandedMobileStoreId === s.id ? null : s.id)} 
                            className="flex items-center text-[10px] text-slate-400 font-bold uppercase cursor-pointer hover:text-slate-600"
                          >
                            {expandedMobileStoreId === s.id ? 'Hide Details' : 'View Details'} 
                            {expandedMobileStoreId === s.id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                          </button>
                        </div>
                      </div>
                      <ActionMenu store={s} />
                    </div>
                    
                    <AnimatePresence>
                      {expandedMobileStoreId === s.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }} 
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2 text-xs">
                              <div className="text-slate-500">
                                <strong>Type:</strong> <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${s.type === 'SCS' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>{s.type}</span> · <strong>State:</strong> {s.state}
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{s.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 rounded-xl p-2.5">
                               <div><strong>CCE Units:</strong> {s.cceUnits}</div>
                               <div><strong>Storage Capacity:</strong> {s.storageCapacity}</div>
                               <div><strong>LGA:</strong> {s.lga || '-'}</div>
                               <div><strong>ID:</strong> {s.id}</div>
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
            Showing {filteredStores.length} stores
          </span>
        </div>
      </div>
    </div>
  );
}
