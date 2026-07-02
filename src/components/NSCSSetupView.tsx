import { useState, useMemo, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  MoreHorizontal,
  Edit2, 
  Trash2, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Database,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Check,
  X,
  ChevronRight as ChevronRightIcon,
  Layers,
  MapPin,
  Settings
} from 'lucide-react';

export interface NSCSRecord {
  id: string;
  state: string;
  name: string;
  storageCapacity: number; // e.g. 70
  statesServedCount: number; // e.g. 4
  statesServedList: string[]; // List of served states
  status: 'Active' | 'Inactive';
  equipmentType?: string;
}

const INITIAL_NSCS: NSCSRecord[] = [
  { 
    id: 'NSCS-001', 
    state: 'FCT', 
    name: 'FCT Central National Cold Store', 
    storageCapacity: 70, 
    statesServedCount: 4, 
    statesServedList: ['FCT', 'Kaduna State', 'Niger State', 'Nasarawa State'],
    status: 'Active',
    equipmentType: 'Walk-in Cold Room (WICR)'
  },
  { 
    id: 'NSCS-002', 
    state: 'Lagos', 
    name: 'Lagos NSCS Hub', 
    storageCapacity: 40, 
    statesServedCount: 3, 
    statesServedList: ['Lagos State', 'Ogun State', 'Oyo State'],
    status: 'Active',
    equipmentType: 'Ice Lined Refrigerator (ILR)'
  }
];

const NIGERIAN_STATES = [
  'ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 
  'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO', 
  'JIGAWA', 'KADUNA', 'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASARAWA', 
  'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'
];

const EQUIPMENT_OPTIONS = [
  'Walk-in Cold Room (WICR)',
  'Ice Lined Refrigerator (ILR)',
  'Solar Direct Drive (SDD)',
  'Deep Freezer (DF)',
  'Ultra-Low Temperature Freezer (ULT)'
];

export default function NSCSSetupView() {
  const [records, setRecords] = useState<NSCSRecord[]>(INITIAL_NSCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  
  // Sorting State
  const [sortField, setSortField] = useState<keyof NSCSRecord>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Actions Dropdown Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form values (editing/creating)
  const [formState, setFormState] = useState('FCT');
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState<number>(50);
  const [formEquipment, setFormEquipment] = useState('Walk-in Cold Room (WICR)');
  const [formSelectedStates, setFormSelectedStates] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Mobile Expanded Card details
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page number on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle Sort
  const handleSort = (field: keyof NSCSRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalNSCS = records.length;
    const totalStatesServed = records.reduce((sum, r) => sum + r.statesServedCount, 0);
    return { totalNSCS, totalStatesServed };
  }, [records]);

  // Filter & Sort
  const filteredAndSortedRecords = useMemo(() => {
    const filtered = records.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.equipmentType && r.equipmentType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortField]).toLowerCase();
      const bVal = String(b[sortField]).toLowerCase();
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [records, searchQuery, sortField, sortDirection]);

  // Paginated Results
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRecords.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRecords, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);

  // Handlers
  const handleAddClick = () => {
    setEditingId(null);
    setFormState('FCT');
    setFormName('');
    setFormCapacity(50);
    setFormEquipment('Walk-in Cold Room (WICR)');
    setFormSelectedStates(['FCT']);
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const handleEditClick = (record: NSCSRecord) => {
    setEditingId(record.id);
    setFormState(record.state.toUpperCase());
    setFormName(record.name);
    setFormCapacity(record.storageCapacity);
    setFormEquipment(record.equipmentType || 'Walk-in Cold Room (WICR)');
    setFormSelectedStates(record.statesServedList);
    setFormStatus(record.status);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this NSCS record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setOpenMenuId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r));
    setOpenMenuId(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter NSCS Name');
      return;
    }

    const payload: Omit<NSCSRecord, 'id'> = {
      state: formState,
      name: formName,
      storageCapacity: Number(formCapacity),
      statesServedCount: formSelectedStates.length,
      statesServedList: formSelectedStates,
      status: formStatus,
      equipmentType: formEquipment
    };

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...r, ...payload } : r));
    } else {
      const newId = `NSCS-${String(records.length + 1).padStart(3, '0')}`;
      setRecords(prev => [...prev, { id: newId, ...payload }]);
    }
    setIsModalOpen(false);
  };

  const toggleStateServed = (stateName: string) => {
    if (formSelectedStates.includes(stateName)) {
      setFormSelectedStates(prev => prev.filter(s => s !== stateName));
    } else {
      setFormSelectedStates(prev => [...prev, stateName]);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full" id="nscs-setup-container">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-4 mb-6" id="nscs-setup-header">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
            NSCS Setup
          </h1>
        </div>
        
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
          id="add-nscs-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add NSCS</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="nscs-stats-grid">
        <div 
          className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1"
          style={{ borderLeftColor: '#0f766e' }}
          id="kpi-total-nscs"
        >
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">TOTAL NSCS</span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">{stats.totalNSCS}</span>
        </div>
        <div 
          className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1"
          style={{ borderLeftColor: '#0ea5e9' }}
          id="kpi-states-served"
        >
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">TOTAL STATES SERVED</span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">{stats.totalStatesServed}</span>
        </div>
      </div>

      {/* DATA CARD CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-150/80 shadow-3xs overflow-hidden" id="nscs-data-panel">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 font-display">
              National Strategic Cold Store
            </h2>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Manage national strategic cold stores
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder="Search by NCS name..."
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white border border-slate-200 focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500/20 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition-all min-h-[36px] font-medium shadow-3xs" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-3xs">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'text-brand-teal-700 bg-brand-teal-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <Database className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('compact')} 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'compact' ? 'text-brand-teal-700 bg-brand-teal-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Compact Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Presentation views */}
        {viewMode === 'table' ? (
          /* Desktop Spreadsheet Grid */
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs text-slate-600 bg-white">
              <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                <tr>
                  <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('state')}>
                    <div className="flex items-center gap-1.5">
                      State <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortField === 'state' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      NCS Name <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('storageCapacity')}>
                    <div className="flex items-center gap-1.5">
                      Storage Capacity <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortField === 'storageCapacity' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('statesServedCount')}>
                    <div className="flex items-center gap-1.5">
                      States Served <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortField === 'statesServedCount' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="border-b border-slate-100 py-3.5 px-4 text-center select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="border-b border-slate-100 py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 bg-slate-50/20">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-xs font-bold text-slate-400">No matching strategic cold stores found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => (
                    <tr key={r.id} className="bg-white hover:bg-slate-50/40 transition-colors text-xs text-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-800">{r.state}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{r.name}</span>
                          {r.equipmentType && <span className="text-[10px] text-slate-400 font-medium">{r.equipmentType}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold font-mono">{r.storageCapacity}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-bold text-[10px]" title={r.statesServedList.join(', ')}>
                          {r.statesServedCount} states
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center relative">
                        <div className="relative inline-block text-left" ref={openMenuId === r.id ? menuRef : null}>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center mx-auto"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === r.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                                className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                              >
                                <button 
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => handleEditClick(r)}
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit NSCS Setup
                                </button>
                                <button 
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => handleToggleStatus(r.id)}
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button 
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  onClick={() => handleDelete(r.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Store
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Mobile Compact Grid View */
          <div className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/30 text-xs font-bold">
                No matching units found
              </div>
            ) : (
              paginatedRecords.map((r) => (
                <div key={r.id} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-teal-50 text-brand-teal-700 border border-brand-teal-100 flex items-center justify-center font-bold text-xs">
                        {r.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-snug">{r.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">{r.id} • {r.state}</span>
                      </div>
                    </div>
                    
                    {/* Inline Actions inside header */}
                    <div className="relative" ref={openMenuId === r.id ? menuRef : null}>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === r.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                            className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                          >
                            <button 
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => handleEditClick(r)}
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit NSCS Setup
                            </button>
                            <button 
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => handleToggleStatus(r.id)}
                            >
                              <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button 
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Store
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <button 
                      onClick={() => setExpandedCardId(expandedCardId === r.id ? null : r.id)}
                      className="text-xs text-brand-teal-600 font-bold hover:text-brand-teal-700 cursor-pointer flex items-center gap-1"
                    >
                      {expandedCardId === r.id ? 'Hide Details' : 'View Details'} 
                      {expandedCardId === r.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                    }`}>{r.status}</span>
                  </div>

                  <AnimatePresence>
                    {expandedCardId === r.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1.5 pt-2 border-t border-slate-100"
                      >
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                          <div><strong>State:</strong> {r.state}</div>
                          <div><strong>Equipment:</strong> {r.equipmentType || 'N/A'}</div>
                          <div><strong>Storage Capacity:</strong> {r.storageCapacity}</div>
                          <div><strong>States Served ({r.statesServedCount}):</strong></div>
                          <div className="col-span-2 text-slate-500 font-medium">
                            {r.statesServedList.join(', ') || 'None'}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredAndSortedRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length)} of {filteredAndSortedRecords.length} results
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 text-xs font-bold text-white bg-brand-teal-700 border border-brand-teal-700 rounded-lg disabled:opacity-50 hover:bg-brand-teal-800 flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL MATCHING PREVIOUS FORM SCREENS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold tracking-wider font-mono uppercase">
                    NSCS Setup Screen Form
                  </span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col">
                <div className="p-5 max-h-[70vh] overflow-y-auto flex flex-col gap-4">
                  
                  {/* Title & Nav Indicators */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 font-display">
                      {editingId ? 'Edit National Strategic Cold Store Setup' : 'Add National Strategic Cold Store Setup'}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button type="button" className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-pointer">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 cursor-pointer">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* SECTION 1: FACILITY INFORMATION */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                      FACILITY INFORMATION
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">State *</label>
                        <div className="relative">
                          <select 
                            value={formState}
                            onChange={(e) => setFormState(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-brand-teal-500 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer"
                          >
                            {NIGERIAN_STATES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">National Strategic Cold Store Name *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Enter NCS name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-brand-teal-500 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: VACCINE STORAGE CAPACITY */}
                  <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 mt-1">
                    <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                      VACCINE STORAGE CAPACITY
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Storage Equipment</label>
                        <div className="relative">
                          <select 
                            value={formEquipment}
                            onChange={(e) => setFormEquipment(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-brand-teal-500 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer"
                          >
                            {EQUIPMENT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Storage Capacity (L)</label>
                        <input 
                          type="number"
                          value={formCapacity}
                          onChange={(e) => setFormCapacity(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 focus:border-brand-teal-500 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: STATES SERVED MULTISELECT */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                        STATES SERVED
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        {formSelectedStates.length} Selected
                      </span>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-1.5">
                        {NIGERIAN_STATES.map((st) => {
                          const isSelected = formSelectedStates.includes(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => toggleStateServed(st)}
                              className={`px-2 py-1 text-[10px] font-bold rounded border text-left flex items-center justify-between transition-colors ${
                                isSelected 
                                  ? 'bg-brand-teal-50 text-brand-teal-700 border-brand-teal-200' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span>{st}</span>
                              {isSelected && <Check className="w-3 h-3 text-brand-teal-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: STATUS */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-1">
                    <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                      STATUS
                    </span>
                    
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormStatus('Active')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                          formStatus === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${formStatus === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus('Inactive')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                          formStatus === 'Inactive' 
                            ? 'bg-amber-50 text-amber-700 border-amber-300' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${formStatus === 'Inactive' ? 'bg-amber-600' : 'bg-slate-400'}`} />
                        Inactive
                      </button>
                    </div>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/30">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-brand-teal-700 hover:bg-brand-teal-800 rounded-lg shadow-2xs cursor-pointer"
                  >
                    {editingId ? 'Save Changes' : 'Add NSCS'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
