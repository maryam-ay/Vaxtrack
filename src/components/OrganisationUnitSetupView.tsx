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
  Layers,
  Building2,
  MapPin,
  Check,
  X
} from 'lucide-react';

export interface OrganisationUnitRecord {
  id: string;
  facilityName: string;
  state: string;
  lga: string;
  ward: string;
  status: 'Active' | 'Inactive';
}

export interface OrganisationLevelRecord {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_UNITS: OrganisationUnitRecord[] = [
  { id: 'OU-001', facilityName: 'Kaduna Central Store', state: 'Kaduna State', lga: 'Kaduna North', ward: 'Kawo Ward', status: 'Active' },
  { id: 'OU-002', facilityName: 'Kano Warehouse Depot', state: 'Kano State', lga: 'Kano Municipal', ward: 'Nassarawa Ward', status: 'Active' },
  { id: 'OU-003', facilityName: 'Port Harcourt Store', state: 'Rivers State', lga: 'Port Harcourt', ward: 'Township Ward', status: 'Active' },
  { id: 'OU-004', facilityName: 'Borno State Clinic Depot', state: 'Borno State', lga: 'Maiduguri', ward: 'Shehuri Ward', status: 'Inactive' },
  { id: 'OU-005', facilityName: 'Abuja Federal Cold Room', state: 'FCT Abuja', lga: 'Garki', ward: 'Garki II', status: 'Active' },
  { id: 'OU-006', facilityName: 'Enugu Regional Hub', state: 'Enugu State', lga: 'Enugu North', ward: 'Asata Ward', status: 'Active' },
  { id: 'OU-007', facilityName: 'Lagos Main Logistics Center', state: 'Lagos State', lga: 'Ikeja', ward: 'Alausa Ward', status: 'Active' },
];

const INITIAL_LEVELS: OrganisationLevelRecord[] = [
  { id: 'OL-001', name: 'National Level', description: 'Federal coordination, policy-making, and primary strategic storage.', status: 'Active' },
  { id: 'OL-002', name: 'State Level', description: 'State-wide cold stores, regional allocations, and logistics supervision.', status: 'Active' },
  { id: 'OL-003', name: 'LGA Level', description: 'Local Government Area cold chain stores and localized hub distribution.', status: 'Active' },
  { id: 'OL-004', name: 'Ward / Facility Level', description: 'Primary health facilities, health centers, and end-user immunization points.', status: 'Active' },
];

export default function OrganisationUnitSetupView() {
  const [activeTab, setActiveTab] = useState<'units' | 'levels'>('units');
  const [units, setUnits] = useState<OrganisationUnitRecord[]>(INITIAL_UNITS);
  const [levels, setLevels] = useState<OrganisationLevelRecord[]>(INITIAL_LEVELS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  
  // Sorting State
  const [unitSortField, setUnitSortField] = useState<keyof OrganisationUnitRecord>('facilityName');
  const [unitSortDir, setUnitSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [levelSortField, setLevelSortField] = useState<keyof OrganisationLevelRecord>('name');
  const [levelSortDir, setLevelSortDir] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [unitPage, setUnitPage] = useState(1);
  const [levelPage, setLevelPage] = useState(1);
  const itemsPerPage = 5;

  // Actions Dropdown Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modal / Form state
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  
  // Form values (editing/creating)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitForm, setUnitForm] = useState({
    facilityName: '',
    state: '',
    lga: '',
    ward: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [levelForm, setLevelForm] = useState({
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

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

  // Reset page numbers on tab switch or search
  useEffect(() => {
    setUnitPage(1);
    setLevelPage(1);
  }, [activeTab, searchQuery]);

  // Handle Sort for Units
  const handleUnitSort = (field: keyof OrganisationUnitRecord) => {
    if (unitSortField === field) {
      setUnitSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setUnitSortField(field);
      setUnitSortDir('asc');
    }
  };

  // Handle Sort for Levels
  const handleLevelSort = (field: keyof OrganisationLevelRecord) => {
    if (levelSortField === field) {
      setLevelSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setLevelSortField(field);
      setLevelSortDir('asc');
    }
  };

  // Filter & Sort Units
  const filteredAndSortedUnits = useMemo(() => {
    const filtered = units.filter(u => 
      u.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lga.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.ward.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aVal = String(a[unitSortField]).toLowerCase();
      const bVal = String(b[unitSortField]).toLowerCase();
      return unitSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [units, searchQuery, unitSortField, unitSortDir]);

  // Filter & Sort Levels
  const filteredAndSortedLevels = useMemo(() => {
    const filtered = levels.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aVal = String(a[levelSortField]).toLowerCase();
      const bVal = String(b[levelSortField]).toLowerCase();
      return levelSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [levels, searchQuery, levelSortField, levelSortDir]);

  // Paginated Results
  const paginatedUnits = useMemo(() => {
    const start = (unitPage - 1) * itemsPerPage;
    return filteredAndSortedUnits.slice(start, start + itemsPerPage);
  }, [filteredAndSortedUnits, unitPage]);

  const paginatedLevels = useMemo(() => {
    const start = (levelPage - 1) * itemsPerPage;
    return filteredAndSortedLevels.slice(start, start + itemsPerPage);
  }, [filteredAndSortedLevels, levelPage]);

  const totalUnitPages = Math.ceil(filteredAndSortedUnits.length / itemsPerPage);
  const totalLevelPages = Math.ceil(filteredAndSortedLevels.length / itemsPerPage);

  // Unit handlers
  const handleAddUnitClick = () => {
    setEditingUnitId(null);
    setUnitForm({ facilityName: '', state: '', lga: '', ward: '', status: 'Active' });
    setIsUnitModalOpen(true);
  };

  const handleEditUnitClick = (unit: OrganisationUnitRecord) => {
    setEditingUnitId(unit.id);
    setUnitForm({
      facilityName: unit.facilityName,
      state: unit.state,
      lga: unit.lga,
      ward: unit.ward,
      status: unit.status
    });
    setIsUnitModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteUnit = (id: string) => {
    if (confirm('Are you sure you want to delete this organisation unit?')) {
      setUnits(prev => prev.filter(u => u.id !== id));
      setOpenMenuId(null);
    }
  };

  const handleToggleUnitStatus = (id: string) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    setOpenMenuId(null);
  };

  const handleUnitFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!unitForm.facilityName || !unitForm.state || !unitForm.lga || !unitForm.ward) {
      alert('Please fill in all fields.');
      return;
    }

    if (editingUnitId) {
      setUnits(prev => prev.map(u => u.id === editingUnitId ? { ...u, ...unitForm } : u));
    } else {
      const newId = `OU-${String(units.length + 1).padStart(3, '0')}`;
      setUnits(prev => [...prev, { id: newId, ...unitForm }]);
    }
    setIsUnitModalOpen(false);
  };

  // Level handlers
  const handleAddLevelClick = () => {
    setEditingLevelId(null);
    setLevelForm({ name: '', description: '', status: 'Active' });
    setIsLevelModalOpen(true);
  };

  const handleEditLevelClick = (level: OrganisationLevelRecord) => {
    setEditingLevelId(level.id);
    setLevelForm({
      name: level.name,
      description: level.description,
      status: level.status
    });
    setIsLevelModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteLevel = (id: string) => {
    if (confirm('Are you sure you want to delete this organisation level?')) {
      setLevels(prev => prev.filter(l => l.id !== id));
      setOpenMenuId(null);
    }
  };

  const handleToggleLevelStatus = (id: string) => {
    setLevels(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'Active' ? 'Inactive' : 'Active' } : l));
    setOpenMenuId(null);
  };

  const handleLevelFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!levelForm.name || !levelForm.description) {
      alert('Please fill in all fields.');
      return;
    }

    if (editingLevelId) {
      setLevels(prev => prev.map(l => l.id === editingLevelId ? { ...l, ...levelForm } : l));
    } else {
      const newId = `OL-${String(levels.length + 1).padStart(3, '0')}`;
      setLevels(prev => [...prev, { id: newId, ...levelForm }]);
    }
    setIsLevelModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full" id="organisation-setup-container">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
            Organisation Unit
          </h1>
          <span className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">
            Manage organisation units and hierarchy levels
          </span>
        </div>
        
        {/* Primary Action Button (Add Level or Add Unit depending on selection) */}
        <div>
          {activeTab === 'units' ? (
            <button
              onClick={handleAddUnitClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
              id="add-org-unit-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Unit</span>
            </button>
          ) : (
            <button
              onClick={handleAddLevelClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-850 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
              id="add-org-level-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Level</span>
            </button>
          )}
        </div>
      </div>

      {/* SEGMENTED / INTERACTIVE KPI CARDS */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="org-stats-grid">
        {/* Organisation Units KPI */}
        <div 
          onClick={() => setActiveTab('units')}
          className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1 ${
            activeTab === 'units' 
              ? 'border-brand-teal-500 ring-2 ring-brand-teal-500/10 shadow-sm border-l-4' 
              : 'border-slate-100 border-l-4 hover:border-slate-200'
          }`}
          style={{ borderLeftColor: activeTab === 'units' ? '#0f766e' : '#cbd5e1' }}
          id="kpi-org-units"
        >
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">ORGANISATION UNITS</span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">{units.length}</span>
        </div>

        {/* Organisation Levels KPI */}
        <div 
          onClick={() => setActiveTab('levels')}
          className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1 ${
            activeTab === 'levels' 
              ? 'border-brand-teal-500 ring-2 ring-brand-teal-500/10 shadow-sm border-l-4' 
              : 'border-slate-100 border-l-4 hover:border-slate-200'
          }`}
          style={{ borderLeftColor: activeTab === 'levels' ? '#0ea5e9' : '#cbd5e1' }}
          id="kpi-org-levels"
        >
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">ORGANISATION LEVELS</span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">{levels.length}</span>
        </div>
      </div>

      {/* MAIN DATA CARD CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-150/80 shadow-3xs overflow-hidden" id="organisation-data-panel">
        
        {/* Header inside the panel with Search & View-mode Toggles */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 font-display">
              {activeTab === 'units' ? 'Organisation Units' : 'Organisation Levels'}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              {activeTab === 'units' ? 'Organisation units are managed by the system' : 'Define the hierarchy levels for organisation units'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder={activeTab === 'units' ? "Search by facility name..." : "Search levels..."}
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

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-3xs">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'text-brand-teal-700 bg-brand-teal-50 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Spreadsheet Table View"
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

        {/* DATA PRESENTATION */}
        {activeTab === 'units' ? (
          /* ========================================================================= */
          /* ORGANISATION UNITS VIEW */
          /* ========================================================================= */
          viewMode === 'table' ? (
            /* Desktop / Always-available Horizontal Scroll Spreadsheet Grid */
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs text-slate-600 bg-white">
                <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                  <tr>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('id')}>
                      <div className="flex items-center gap-1.5">
                        ID <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'id' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('facilityName')}>
                      <div className="flex items-center gap-1.5">
                        Facility Name <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'facilityName' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('state')}>
                      <div className="flex items-center gap-1.5">
                        State <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'state' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('lga')}>
                      <div className="flex items-center gap-1.5">
                        LGA <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'lga' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('ward')}>
                      <div className="flex items-center gap-1.5">
                        Ward <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'ward' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 text-center select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleUnitSort('status')}>
                      <div className="flex items-center justify-center gap-1.5">
                        Status <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {unitSortField === 'status' && (unitSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUnits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 bg-slate-50/20">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building2 className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <span className="text-xs font-bold text-slate-400">No matching organisation units found</span>
                          <span className="text-[10px] text-slate-400 font-medium">Try broadening your search term</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUnits.map((u) => (
                      <tr key={u.id} className="bg-white hover:bg-slate-50/40 transition-colors text-xs text-slate-700">
                        <td className="py-3 px-4 font-mono font-semibold text-teal-600">{u.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{u.facilityName}</td>
                        <td className="py-3 px-4 text-slate-600">{u.state}</td>
                        <td className="py-3 px-4 text-slate-600">{u.lga}</td>
                        <td className="py-3 px-4 text-slate-600">{u.ward}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center relative">
                          <div className="relative inline-block text-left" ref={openMenuId === u.id ? menuRef : null}>
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center mx-auto"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === u.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                                  className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                                >
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => handleEditUnitClick(u)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Unit
                                  </button>
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => handleToggleUnitStatus(u.id)}
                                  >
                                    <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={() => handleDeleteUnit(u.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Unit
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
            /* Responsive Mobile-first Compact Cards view matching allocations/facilities setup */
            <div className="divide-y divide-slate-100">
              {paginatedUnits.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50/30 text-xs font-bold">
                  No matching units found
                </div>
              ) : (
                paginatedUnits.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-teal-50 text-brand-teal-700 border border-brand-teal-100 flex items-center justify-center font-bold text-xs">
                          {u.facilityName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm leading-snug">{u.facilityName}</span>
                          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">{u.id}</span>
                        </div>
                      </div>
                      
                      {/* Inline Actions inside header */}
                      <div className="relative" ref={openMenuId === u.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === u.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                              animate={{ opacity: 1, scale: 1, y: 0 }} 
                              exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                              className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                            >
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => handleEditUnitClick(u)}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Unit
                              </button>
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => handleToggleUnitStatus(u.id)}
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => handleDeleteUnit(u.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Unit
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-1">
                      <button 
                        onClick={() => setExpandedCardId(expandedCardId === u.id ? null : u.id)}
                        className="text-xs text-brand-teal-600 font-bold hover:text-brand-teal-700 cursor-pointer flex items-center gap-1"
                      >
                        {expandedCardId === u.id ? 'Hide Details' : 'View Details'} 
                        {expandedCardId === u.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                      }`}>{u.status}</span>
                    </div>

                    <AnimatePresence>
                      {expandedCardId === u.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-1.5 pt-2 border-t border-slate-100"
                        >
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                            <div><strong>State:</strong> {u.state}</div>
                            <div><strong>LGA:</strong> {u.lga}</div>
                            <div className="col-span-2 border-t border-slate-150/60 pt-1.5 mt-1">
                              <strong>Ward:</strong> {u.ward}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* ORGANISATION LEVELS VIEW */
          /* ========================================================================= */
          viewMode === 'table' ? (
            /* Desktop / Always-available Horizontal Scroll Spreadsheet Grid */
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[750px] border-collapse text-left text-xs text-slate-600 bg-white">
                <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                  <tr>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleLevelSort('id')}>
                      <div className="flex items-center gap-1.5">
                        ID <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {levelSortField === 'id' && (levelSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleLevelSort('name')}>
                      <div className="flex items-center gap-1.5">
                        Name <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {levelSortField === 'name' && (levelSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors animate-fade-in" onClick={() => handleLevelSort('description')}>
                      <div className="flex items-center gap-1.5">
                        Description <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {levelSortField === 'description' && (levelSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 text-center select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleLevelSort('status')}>
                      <div className="flex items-center justify-center gap-1.5">
                        Status <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        {levelSortField === 'status' && (levelSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-brand-teal-600" /> : <ArrowDown className="w-3.5 h-3.5 text-brand-teal-600" />)}
                      </div>
                    </th>
                    <th className="border-b border-slate-100 py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLevels.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 bg-slate-50/20">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Layers className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <span className="text-xs font-bold text-slate-400">No matching organisation levels found</span>
                          <span className="text-[10px] text-slate-400 font-medium">Try broadening your search term</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLevels.map((l) => (
                      <tr key={l.id} className="bg-white hover:bg-slate-50/40 transition-colors text-xs text-slate-700">
                        <td className="py-3.5 px-4 font-mono font-semibold text-teal-600">{l.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{l.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[350px] truncate" title={l.description}>{l.description}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            l.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center relative">
                          <div className="relative inline-block text-left" ref={openMenuId === l.id ? menuRef : null}>
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === l.id ? null : l.id)}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center mx-auto"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === l.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                                  className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                                >
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => handleEditLevelClick(l)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Level
                                  </button>
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => handleToggleLevelStatus(l.id)}
                                  >
                                    <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button 
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={() => handleDeleteLevel(l.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Level
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
            /* Responsive Mobile-first Compact Cards view matching allocations/facilities setup */
            <div className="divide-y divide-slate-100">
              {paginatedLevels.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50/30 text-xs font-bold">
                  No matching levels found
                </div>
              ) : (
                paginatedLevels.map((l) => (
                  <div key={l.id} className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-teal-50 text-brand-teal-700 border border-brand-teal-100 flex items-center justify-center font-bold text-xs">
                          {l.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm leading-snug">{l.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">{l.id}</span>
                        </div>
                      </div>
                      
                      {/* Inline Actions inside header */}
                      <div className="relative" ref={openMenuId === l.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === l.id ? null : l.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === l.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                              animate={{ opacity: 1, scale: 1, y: 0 }} 
                              exit={{ opacity: 0, scale: 0.95, y: -5 }} 
                              className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1 text-left"
                            >
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => handleEditLevelClick(l)}
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Level
                              </button>
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => handleToggleLevelStatus(l.id)}
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400" /> Toggle Status
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button 
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => handleDeleteLevel(l.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Level
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-1">
                      <button 
                        onClick={() => setExpandedCardId(expandedCardId === l.id ? null : l.id)}
                        className="text-xs text-brand-teal-600 font-bold hover:text-brand-teal-700 cursor-pointer flex items-center gap-1"
                      >
                        {expandedCardId === l.id ? 'Hide Description' : 'View Description'} 
                        {expandedCardId === l.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                      }`}>{l.status}</span>
                    </div>

                    <AnimatePresence>
                      {expandedCardId === l.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-1.5 pt-2 border-t border-slate-100"
                        >
                          <div className="text-xs text-slate-600 bg-slate-50/70 rounded-xl p-3 border border-slate-100 leading-relaxed">
                            {l.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )
        )}

        {/* PAGINATION CONTROLS FOOTER */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            {activeTab === 'units' ? (
              <>
                Showing {filteredAndSortedUnits.length === 0 ? 0 : (unitPage - 1) * itemsPerPage + 1} to {Math.min(unitPage * itemsPerPage, filteredAndSortedUnits.length)} of {filteredAndSortedUnits.length} results
              </>
            ) : (
              <>
                Showing {filteredAndSortedLevels.length === 0 ? 0 : (levelPage - 1) * itemsPerPage + 1} to {Math.min(levelPage * itemsPerPage, filteredAndSortedLevels.length)} of {filteredAndSortedLevels.length} results
              </>
            )}
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (activeTab === 'units') setUnitPage(prev => Math.max(prev - 1, 1));
                else setLevelPage(prev => Math.max(prev - 1, 1));
              }}
              disabled={activeTab === 'units' ? unitPage === 1 : levelPage === 1}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 flex items-center gap-1 select-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'units') setUnitPage(prev => Math.min(prev + 1, totalUnitPages));
                else setLevelPage(prev => Math.min(prev + 1, totalLevelPages));
              }}
              disabled={activeTab === 'units' ? (unitPage === totalUnitPages || totalUnitPages === 0) : (levelPage === totalLevelPages || totalLevelPages === 0)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-brand-teal-700 border border-brand-teal-700 rounded-lg disabled:opacity-50 hover:bg-brand-teal-800 flex items-center gap-1 select-none cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */
      /* ORGANISATION UNIT FORM MODAL */
      /* ========================================================================= */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 font-display">
                  {editingUnitId ? 'Edit Organisation Unit' : 'Add Organisation Unit'}
                </h3>
                <button 
                  onClick={() => setIsUnitModalOpen(false)}
                  className="p-1 hover:bg-slate-150/65 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUnitFormSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Facility Name</label>
                  <input 
                    type="text" 
                    value={unitForm.facilityName}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, facilityName: e.target.value }))}
                    placeholder="e.g. Kaduna Central Store"
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[38px] font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</label>
                    <input 
                      type="text" 
                      value={unitForm.state}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="e.g. Kaduna State"
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[38px] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LGA</label>
                    <input 
                      type="text" 
                      value={unitForm.lga}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, lga: e.target.value }))}
                      placeholder="e.g. Kaduna North"
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[38px] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward</label>
                    <input 
                      type="text" 
                      value={unitForm.ward}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, ward: e.target.value }))}
                      placeholder="e.g. Kawo Ward"
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[38px] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                    <div className="relative">
                      <select 
                        value={unitForm.status}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal-500 appearance-none min-h-[38px]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsUnitModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-3.5 py-2 text-xs font-bold text-white bg-brand-teal-700 border border-brand-teal-700 rounded-xl hover:bg-brand-teal-800 shadow-2xs cursor-pointer"
                  >
                    Save Unit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */
      /* ORGANISATION LEVEL FORM MODAL */
      /* ========================================================================= */}
      <AnimatePresence>
        {isLevelModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 font-display">
                  {editingLevelId ? 'Edit Organisation Level' : 'Add Organisation Level'}
                </h3>
                <button 
                  onClick={() => setIsLevelModalOpen(false)}
                  className="p-1 hover:bg-slate-150/65 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLevelFormSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level Name</label>
                  <input 
                    type="text" 
                    value={levelForm.name}
                    onChange={(e) => setLevelForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Zone Level"
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[38px] font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea 
                    value={levelForm.description}
                    onChange={(e) => setLevelForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter level descriptions, administrative role, or strategic purpose..."
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 outline-none focus:border-brand-teal-500 focus:bg-white min-h-[80px] font-medium resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select 
                      value={levelForm.status}
                      onChange={(e) => setLevelForm(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal-500 appearance-none min-h-[38px]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsLevelModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-3.5 py-2 text-xs font-bold text-white bg-brand-teal-700 border border-brand-teal-700 rounded-xl hover:bg-brand-teal-800 shadow-2xs cursor-pointer"
                  >
                    Save Level
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
