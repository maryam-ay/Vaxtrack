import { useState, useMemo, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  List,
  Columns,
  Check,
  MapPin,
  X,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface ThirdPartyLogisticsRecord {
  id: string;
  name: string;
  level: 'National' | 'State Level';
  states: string[]; // List of covered states, empty if National
  ehfs: number; // Associated EHF facilities count
  status: 'Active' | 'Inactive';
  contactPerson?: string;
  phone?: string;
  email?: string;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
  'Niger', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const INITIAL_RECORDS: ThirdPartyLogisticsRecord[] = [
  { id: '3PL-001', name: 'MDS Logistics Limited', level: 'National', states: [], ehfs: 142, status: 'Active', contactPerson: 'Tunde Harrison', phone: '+234 803 111 2222', email: 'tunde.h@mdslogistics.com' },
  { id: '3PL-002', name: 'DHL Aviation Nigeria', level: 'National', states: [], ehfs: 98, status: 'Active', contactPerson: 'Sarah Jenkins', phone: '+234 802 444 5555', email: 's.jenkins@dhl.com' },
  { id: '3PL-003', name: 'Red Star Express PLC', level: 'State Level', states: ['Kano State', 'Kaduna State', 'Katsina'], ehfs: 54, status: 'Active', contactPerson: 'Ibrahim Musa', phone: '+234 806 777 8888', email: 'i.musa@redstarplc.com' },
  { id: '3PL-004', name: 'GIG Logistics', level: 'State Level', states: ['Lagos State', 'Oyo State', 'Ogun State'], ehfs: 38, status: 'Active', contactPerson: 'Chioma Okeke', phone: '+234 809 333 4444', email: 'c.okeke@giglogistics.ng' },
  { id: '3PL-005', name: 'Ace Courier Services', level: 'State Level', states: ['Rivers State', 'Delta State'], ehfs: 25, status: 'Inactive', contactPerson: 'Boma George', phone: '+234 812 555 6666', email: 'b.george@acecouriers.com' }
];

export function ThreePLSetupView() {
  // Always populate table with data as requested by user
  const [records, setRecords] = useState<ThirdPartyLogisticsRecord[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'National' | 'State Level'>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  
  // View mode and expansion state for compact mode
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  
  // View states
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ThirdPartyLogisticsRecord | null>(null);
  
  // Table sorting
  const [sortField, setSortField] = useState<keyof ThirdPartyLogisticsRecord>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formLevel, setFormLevel] = useState<'National' | 'State Level' | ''>('');
  const [formName, setFormName] = useState('');
  const [formStates, setFormStates] = useState<string[]>([]);
  const [formEhfs, setFormEhfs] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  
  // Custom states search/selection
  const [stateSearchText, setStateSearchText] = useState('');
  
  // UI Actions menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Avatar text initials helper
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Avatar background helper
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
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const toggleExpandRecord = (id: string) => {
    if (expandedRecordIds.includes(id)) {
      setExpandedRecordIds(prev => prev.filter(item => item !== id));
    } else {
      setExpandedRecordIds(prev => [...prev, id]);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute stats dynamically
  const stats = useMemo(() => {
    const total = records.length;
    const national = records.filter(r => r.level === 'National').length;
    const stateLevel = records.filter(r => r.level === 'State Level').length;
    return { total, national, stateLevel };
  }, [records]);

  // Seed default records helper
  const handleLoadDemoData = () => {
    setRecords(INITIAL_RECORDS);
  };

  // Reset/Initialize form fields
  const initForm = (record?: ThirdPartyLogisticsRecord) => {
    if (record) {
      setFormLevel(record.level);
      setFormName(record.name);
      setFormStates(record.states);
      setFormEhfs(record.ehfs);
      setFormStatus(record.status);
      setFormContact(record.contactPerson || '');
      setFormPhone(record.phone || '');
      setFormEmail(record.email || '');
    } else {
      setFormLevel('');
      setFormName('');
      setFormStates([]);
      setFormEhfs(0);
      setFormStatus('Active');
      setFormContact('');
      setFormPhone('');
      setFormEmail('');
    }
    setStateSearchText('');
  };

  const handleAddClick = () => {
    initForm();
    setIsAdding(true);
  };

  const handleEditClick = (record: ThirdPartyLogisticsRecord) => {
    setEditingRecord(record);
    initForm(record);
    setIsAdding(false);
    setOpenMenuId(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingRecord(null);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formLevel) {
      alert('Please select a coverage Level');
      return;
    }
    if (!formName.trim()) {
      alert('Please enter a 3PL Name');
      return;
    }
    if (formLevel === 'State Level' && formStates.length === 0) {
      alert('Please select at least one State for State Level 3PL');
      return;
    }

    if (editingRecord) {
      // Edit existing
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        name: formName.trim(),
        level: formLevel as 'National' | 'State Level',
        states: formLevel === 'National' ? [] : formStates,
        ehfs: formEhfs,
        status: formStatus,
        contactPerson: formContact.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim()
      } : r));
      setEditingRecord(null);
    } else {
      // Add new
      const newId = `3PL-${String(records.length + 1).padStart(3, '0')}`;
      const newRecord: ThirdPartyLogisticsRecord = {
        id: newId,
        name: formName.trim(),
        level: formLevel as 'National' | 'State Level',
        states: formLevel === 'National' ? [] : formStates,
        ehfs: formEhfs,
        status: formStatus,
        contactPerson: formContact.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim()
      };
      setRecords(prev => [newRecord, ...prev]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this 3PL provider?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setOpenMenuId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r));
    setOpenMenuId(null);
  };

  const handleSort = (field: keyof ThirdPartyLogisticsRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.states && r.states.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (r.contactPerson && r.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchLevel = levelFilter === 'all' || r.level === levelFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchState = stateFilter === 'all' || 
                         (r.level === 'National') || // National covers all states
                         (r.states && r.states.some(s => s.toLowerCase().includes(stateFilter.toLowerCase())));
      return matchSearch && matchLevel && matchStatus && matchState;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [records, searchQuery, levelFilter, statusFilter, stateFilter, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, levelFilter, statusFilter, stateFilter]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const toggleStateSelect = (state: string) => {
    if (formStates.includes(state)) {
      setFormStates(prev => prev.filter(s => s !== state));
    } else {
      setFormStates(prev => [...prev, state]);
    }
  };

  const filteredNigerianStates = useMemo(() => {
    return NIGERIAN_STATES.filter(s => s.toLowerCase().includes(stateSearchText.toLowerCase()));
  }, [stateSearchText]);

  const handleNavigateRecords = (direction: 'prev' | 'next') => {
    if (!editingRecord) return;
    const currentIndex = records.findIndex(r => r.id === editingRecord.id);
    if (currentIndex === -1) return;
    
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < records.length) {
      const nextRecord = records[nextIndex];
      setEditingRecord(nextRecord);
      initForm(nextRecord);
    }
  };

  const hasPrevRecord = editingRecord ? records.findIndex(r => r.id === editingRecord.id) > 0 : false;
  const hasNextRecord = editingRecord ? records.findIndex(r => r.id === editingRecord.id) < records.length - 1 : false;

  return (
    <div className="flex flex-col gap-4 w-full select-none" id="threepl-setup-container">
      <AnimatePresence mode="wait">
        {(!isAdding && !editingRecord) ? (
          // LIST MODE / DASHBOARD STATE
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Top slate-header row with + Add 3PL (matches other setup views) */}
            <div className="flex flex-row items-center justify-between gap-4 px-1" id="threepl-page-header">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                  3PL Setup
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage third-party logistics providers
                </p>
              </div>
              <button
                id="add-3pl-btn"
                onClick={handleAddClick}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-teal-800 hover:bg-brand-teal-900 rounded-lg transition-all shadow-2xs cursor-pointer shrink-0 min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add 3PL</span>
              </button>
            </div>

            {/* KPI Stats row (reusable style & horizontally swipable on mobile) */}
            <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="threepl-stats-grid">
              {/* Card 1: TOTAL 3PL */}
              <div className="bg-white rounded-xl p-4 border border-blue-200 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#3b82f6' }}>
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">TOTAL 3PL</span>
                <span className="text-2xl font-bold text-slate-800 font-display mt-1">{stats.total}</span>
              </div>

              {/* Card 2: NATIONAL */}
              <div className="bg-white rounded-xl p-4 border border-emerald-250 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#0d9488' }}>
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">NATIONAL</span>
                <span className="text-2xl font-bold text-slate-800 font-display mt-1">{stats.national}</span>
              </div>

              {/* Card 3: STATE LEVEL */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#94a3b8' }}>
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">STATE LEVEL</span>
                <span className="text-2xl font-bold text-slate-800 font-display mt-1">{stats.stateLevel}</span>
              </div>
            </div>

            {/* Filter and Control Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col gap-3 animate-fade-in" id="threepl-filters-card">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search by 3PL name, contact person or state..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal-500 focus:bg-white text-slate-800 text-xs rounded-xl pl-9 pr-8 py-2 outline-none transition-all min-h-[40px] font-medium" 
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 relative">
                  <select 
                    value={levelFilter} 
                    onChange={(e) => setLevelFilter(e.target.value as any)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal-500 appearance-none min-h-[40px]"
                  >
                    <option value="all">Level</option>
                    <option value="National">National</option>
                    <option value="State Level">State Level</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <div className="col-span-4 relative">
                  <select 
                    value={stateFilter} 
                    onChange={(e) => setStateFilter(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal-500 appearance-none min-h-[40px]"
                  >
                    <option value="all">State Coverage</option>
                    {NIGERIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <div className="col-span-4 relative">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as any)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal-500 appearance-none min-h-[40px]"
                  >
                    <option value="all">Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Main Data Panel Card Container */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col overflow-hidden" id="threepl-data-panel-card">
              {/* Inner Card Title Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-sm font-bold text-slate-800 font-display">
                    3PL Setup Records
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold font-sans">
                    Showing {filteredRecords.length} of {records.length} providers
                  </p>
                </div>

                {/* Table / Compact toggle button group */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'table' 
                        ? 'bg-white text-brand-teal-800 shadow-3xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'compact' 
                        ? 'bg-white text-brand-teal-800 shadow-3xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compact View</span>
                  </button>
                </div>
              </div>

              {viewMode === 'compact' ? (
                /* Compact Mode layout: styled exactly like the user management view */
                <div className="divide-y divide-slate-100" id="threepl-compact-list">
                  {filteredRecords.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-7 h-7 text-slate-300" />
                        <span className="font-bold text-xs text-slate-500">No 3PL records match search filters</span>
                        <button 
                          onClick={() => { setSearchQuery(''); setLevelFilter('all'); setStatusFilter('all'); setStateFilter('all'); }}
                          className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-extrabold underline cursor-pointer mt-0.5"
                        >
                          Clear filters
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredRecords.map(record => {
                      const isExpanded = expandedRecordIds.includes(record.id);
                      return (
                        <div key={record.id} className="p-4 hover:bg-slate-50/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Initials Avatar */}
                              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(record.name)}`}>
                                {getInitials(record.name)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{record.name}</span>
                                <button 
                                  onClick={() => toggleExpandRecord(record.id)}
                                  className="flex items-center text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase mt-0.5"
                                >
                                  {isExpanded ? 'Hide Details' : 'View Details'} 
                                  {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Level Badge */}
                              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                record.level === 'National' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-150'
                              }`}>{record.level}</span>

                              {/* Status Badge */}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                record.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                              }`}>{record.status}</span>

                              {/* Action Menu Button */}
                              <div className="relative inline-block text-left" ref={openMenuId === record.id ? menuRef : null}>
                                <button 
                                  onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                  {openMenuId === record.id && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                                      exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                                      className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1"
                                    >
                                      <button 
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        onClick={() => handleEditClick(record)}
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Record
                                      </button>
                                      <button 
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        onClick={() => handleToggleStatus(record.id)}
                                      >
                                        <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                                      </button>
                                      <div className="border-t border-slate-100 my-1"></div>
                                      <button 
                                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        onClick={() => handleDelete(record.id)}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Record
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/70 rounded-xl p-3.5 mt-3 border border-slate-100">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider w-24 shrink-0">Level</span>
                                      <span className="text-slate-800 font-semibold">{record.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider w-24 shrink-0">Status</span>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        record.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                      }`}>{record.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider w-24 shrink-0">EHF Facilities</span>
                                      <span className="text-slate-800 font-bold">{record.ehfs}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider w-24 shrink-0 mt-0.5">Coverage</span>
                                      <span className="text-slate-800 font-medium">
                                        {record.level === 'National' ? (
                                          <span className="text-blue-600 font-bold">National Scope</span>
                                        ) : (
                                          record.states.join(', ')
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4">
                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">Contact Information</span>
                                    {record.contactPerson ? (
                                      <div className="flex flex-col gap-1 text-[11px] text-slate-700 font-medium">
                                        <div><strong>Person:</strong> {record.contactPerson}</div>
                                        {record.phone && <div><strong>Phone:</strong> {record.phone}</div>}
                                        {record.email && <div><strong>Email:</strong> {record.email}</div>}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic">No contact information provided</span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* High-fidelity Spreadsheet Grid - Always visible on all screen sizes in Table View with horizontal scroll */
                <>
                  <div>
                    <div className="overflow-x-auto w-full border border-slate-100 rounded-xl shadow-sm">
                      <table className="w-full min-w-[1400px] border-collapse text-left text-xs text-slate-600 bg-white">
                        <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                          <tr>
                            {/* 3PL ID Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('id')}>
                              <div className="flex items-center gap-1.5">
                                3PL ID <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Name Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('name')}>
                              <div className="flex items-center gap-1.5">
                                Provider Name <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Level Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('level')}>
                              <div className="flex items-center gap-1.5">
                                Level <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'level' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* States Covered Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('states')}>
                              <div className="flex items-center gap-1.5">
                                States Covered <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'states' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Associated EHFs Column */}
                            <th className="border-b border-slate-100 py-4 px-4 text-center select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('ehfs')}>
                              <div className="flex items-center justify-center gap-1.5">
                                Associated EHFs <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'ehfs' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Contact Person Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('contactPerson')}>
                              <div className="flex items-center gap-1.5">
                                Contact Person <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'contactPerson' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Phone Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('phone')}>
                              <div className="flex items-center gap-1.5">
                                Phone Number <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'phone' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Email Column */}
                            <th className="border-b border-slate-100 py-4 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('email')}>
                              <div className="flex items-center gap-1.5">
                                Email Address <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'email' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Status Column */}
                            <th className="border-b border-slate-100 py-4 px-4 text-center select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('status')}>
                              <div className="flex items-center justify-center gap-1.5">
                                Status <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                              </div>
                            </th>
                            {/* Actions Column */}
                            <th className="border-b border-slate-100 py-4 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {paginatedRecords.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="border border-slate-200 py-10 text-center text-slate-400 bg-slate-50/30">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <AlertCircle className="w-7 h-7 text-slate-300" />
                                <span className="font-bold text-xs text-slate-500">No 3PL records match search filters</span>
                                <button 
                                  onClick={() => { setSearchQuery(''); setLevelFilter('all'); setStatusFilter('all'); setStateFilter('all'); }}
                                  className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-extrabold underline cursor-pointer mt-0.5"
                                >
                                  Clear filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedRecords.map((record) => (
                            <tr key={record.id} className="bg-white hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                              {/* 3PL ID Cell */}
                              <td className="py-3 px-4 font-semibold text-teal-600">
                                {record.id}
                              </td>
                              
                              {/* Provider Name Cell */}
                              <td className="py-3 px-4 font-bold text-slate-800">
                                {record.name}
                              </td>
                              
                              {/* Level Cell */}
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  record.level === 'National' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  {record.level}
                                </span>
                              </td>
                              
                              {/* States Covered Cell */}
                              <td className="py-3 px-4 font-medium text-slate-600 max-w-[280px]">
                                {record.level === 'National' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-extrabold uppercase font-mono tracking-wider">
                                    <MapPin className="w-3 h-3 stroke-[2.5]" /> National Coverage
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {record.states && record.states.length > 0 ? (
                                      record.states.map((st, i) => (
                                        <span key={i} className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 font-bold uppercase">
                                          {st.replace(' State', '')}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">No states assigned</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              
                              {/* Associated EHFs Cell */}
                              <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono text-sm">
                                {record.ehfs}
                              </td>
                              
                              {/* Contact Person Cell */}
                              <td className="py-3 px-4 text-slate-700 font-medium">
                                {record.contactPerson || <span className="text-slate-400 italic">-</span>}
                              </td>
                              
                              {/* Phone Number Cell */}
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                {record.phone || <span className="text-slate-400 italic">-</span>}
                              </td>
                              
                              {/* Email Address Cell */}
                              <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]" title={record.email}>
                                {record.email || <span className="text-slate-400 italic">-</span>}
                              </td>
                              
                              {/* Status Cell */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  record.status === 'Active' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                              
                              {/* Actions Cell */}
                              <td className="py-3 px-4 text-center relative">
                                <div className="relative inline-block text-left" ref={openMenuId === record.id ? menuRef : null}>
                                  <button 
                                    onClick={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center mx-auto"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  <AnimatePresence>
                                    {openMenuId === record.id && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                                        className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1"
                                      >
                                        <button 
                                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          onClick={() => handleEditClick(record)}
                                        >
                                          <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Record
                                        </button>
                                        <button 
                                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          onClick={() => handleToggleStatus(record.id)}
                                        >
                                          <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                                        </button>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button 
                                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                          onClick={() => handleDelete(record.id)}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" /> Delete Record
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

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} results
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-brand-teal-700 border border-brand-teal-700 rounded-lg disabled:opacity-50 hover:bg-brand-teal-800 flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          // FORM STATE (CREATING OR EDITING A 3PL)
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Breadcrumb path (strictly matching Screenshot 2) */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 px-1">
              <span className="hover:text-slate-600 cursor-pointer transition-colors" onClick={handleCancel}>3PL Setup</span>
              <ChevronRight className="w-3 h-3 stroke-[3]" />
              <span className="text-brand-teal-700">{editingRecord ? 'Edit 3PL' : 'Add 3PL'}</span>
            </div>

            {/* Form title with prev/next navigation row */}
            <div className="flex items-center justify-between px-1">
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">
                {editingRecord ? 'Edit 3PL Record' : 'Add 3PL Record'}
              </h1>
              
              {editingRecord && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNavigateRecords('prev')}
                    disabled={!hasPrevRecord}
                    className={`p-1.5 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-all min-h-[34px] min-w-[34px] ${
                      hasPrevRecord ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 pointer-events-none opacity-55'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateRecords('next')}
                    disabled={!hasNextRecord}
                    className={`p-1.5 rounded-lg border border-slate-200 bg-white flex items-center justify-center transition-all min-h-[34px] min-w-[34px] ${
                      hasNextRecord ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 pointer-events-none opacity-55'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Input field cards structure */}
            <form onSubmit={handleSave} className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden" id="threepl-form">
              <div className="p-5 md:p-6 flex flex-col gap-5">
                {/* Level and 3PL Name side-by-side grid (strictly matching Screenshot 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Level dropdown selector (highlighted green/teal border & chevron arrow matching Screenshot 2) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Level
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formLevel}
                        onChange={(e) => {
                          setFormLevel(e.target.value as any);
                          if (e.target.value === 'National') setFormStates([]);
                        }}
                        className="w-full pl-3 pr-9 py-2.5 bg-white border-2 border-brand-teal-600 rounded-xl text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer min-h-[42px] transition-all"
                      >
                        <option value="">- Select level -</option>
                        <option value="National">National</option>
                        <option value="State Level">State Level</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-brand-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 3PL Name text input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      3PL Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter 3PL name..."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Cover States checkboxes if "State Level" is selected */}
                {formLevel === 'State Level' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 pt-2 border-t border-slate-50"
                  >
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Covered States</span>
                      <span className="text-[10px] text-brand-teal-600 font-extrabold normal-case">
                        {formStates.length} chosen
                      </span>
                    </label>

                    <div className="border border-slate-200 rounded-xl bg-slate-50/40 overflow-hidden">
                      <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search state/region..."
                          value={stateSearchText}
                          onChange={(e) => setStateSearchText(e.target.value)}
                          className="bg-transparent border-0 outline-none p-0 text-xs font-semibold text-slate-700 w-full placeholder:text-slate-400 min-h-[24px]"
                        />
                        {stateSearchText && (
                          <button 
                            type="button" 
                            onClick={() => setStateSearchText('')}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="p-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto">
                        {filteredNigerianStates.length === 0 ? (
                          <div className="col-span-full py-2 text-center text-xs text-slate-400 font-semibold">No matches</div>
                        ) : (
                          filteredNigerianStates.map((st) => {
                            const isSelected = formStates.includes(st);
                            return (
                              <button
                                type="button"
                                key={st}
                                onClick={() => toggleStateSelect(st)}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold text-left transition-all border select-none cursor-pointer ${
                                  isSelected 
                                    ? 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-800' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-brand-teal-600 border-brand-teal-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                                </span>
                                <span className="truncate">{st}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Optional Columns */}
                <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-4">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase font-display">
                    Optional Details
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        EHF Covered Count
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={formEhfs === 0 ? '' : formEhfs}
                        onChange={(e) => setFormEhfs(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs min-h-[42px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full pl-3 pr-9 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none appearance-none cursor-pointer min-h-[42px] transition-all"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Contact Person</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs min-h-[42px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone</label>
                      <input
                        type="text"
                        placeholder="+234..."
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs min-h-[42px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        placeholder="e.g. john@3pl.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-brand-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all shadow-2xs min-h-[42px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shaded buttons footer container strictly matching Screenshot 2 layout */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-start gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all shadow-2xs min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-teal-600 hover:bg-brand-teal-700 active:bg-brand-teal-800 rounded-xl transition-all shadow-sm cursor-pointer min-h-[40px]"
                >
                  {editingRecord ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
