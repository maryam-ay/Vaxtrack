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
  Upload,
  Eye,
  AlertTriangle
} from 'lucide-react';

export interface MaximumStockRecord {
  sn: number;
  id: string; // Unique ID, e.g. ABIA-0001
  ehfName: string;
  state: string;
  lga: string;
  ward: string;
  phone: string;
  cceCount: number;
  cceModel: string;
  cceStatus: string;
  
  // Vaccines doses
  bcg: number;
  hepb: number;
  bopv: number;
  penta: number;
  pcv: number;
  ipv: number;
  measles: number;
  yf: number;
  td: number;
  mena: number;
  rota: number;
  hpv: number;
  mr: number;
  malaria: number;

  storageUtilized?: string;
  remainingCapacity?: string;
}

const INITIAL_RECORDS: MaximumStockRecord[] = [
  {
    sn: 1,
    id: 'ABIA-0001',
    ehfName: 'Umunneato wphc',
    state: 'ABIA',
    lga: 'ABA NORTH',
    ward: 'ARIARIA',
    phone: '08039491518',
    cceCount: 1,
    cceModel: 'TCW 40 SDD',
    cceStatus: 'Functional',
    bcg: 60,
    hepb: 40,
    bopv: 160,
    penta: 120,
    pcv: 120,
    ipv: 60,
    measles: 120,
    yf: 80,
    td: 40,
    mena: 80,
    rota: 80,
    hpv: 20,
    mr: 120,
    malaria: 0,
    storageUtilized: '—',
    remainingCapacity: '—'
  },
  {
    sn: 4,
    id: 'ABIA-0004',
    ehfName: 'Asaopuaja WPHC',
    state: 'ABIA',
    lga: 'ABA NORTH',
    ward: 'ASAOKPUAJA',
    phone: '0807838209',
    cceCount: 1,
    cceModel: 'TCW 40 SDD',
    cceStatus: 'Non-functional (awaiting repairs)',
    bcg: 40,
    hepb: 20,
    bopv: 80,
    penta: 60,
    pcv: 64,
    ipv: 40,
    measles: 60,
    yf: 60,
    td: 40,
    mena: 40,
    rota: 60,
    hpv: 40,
    mr: 60,
    malaria: 0,
    storageUtilized: '—',
    remainingCapacity: '—'
  },
  {
    sn: 3,
    id: 'ABIA-0003',
    ehfName: 'Asaopulor 2 phc',
    state: 'ABIA',
    lga: 'ABA NORTH',
    ward: 'ASAOPULOR',
    phone: '08143475351',
    cceCount: 1,
    cceModel: 'TCW 40 SDD',
    cceStatus: 'Functional',
    bcg: 20,
    hepb: 20,
    bopv: 40,
    penta: 60,
    pcv: 64,
    ipv: 40,
    measles: 60,
    yf: 20,
    td: 40,
    mena: 40,
    rota: 40,
    hpv: 20,
    mr: 60,
    malaria: 0,
    storageUtilized: '—',
    remainingCapacity: '—'
  },
  {
    sn: 2,
    id: 'ABIA-0002',
    ehfName: 'asokpulo 1wphc',
    state: 'ABIA',
    lga: 'ABA NORTH',
    ward: 'ASAOPULOR',
    phone: '08130537006',
    cceCount: 1,
    cceModel: 'TCW 2000',
    cceStatus: 'Functional',
    bcg: 60,
    hepb: 40,
    bopv: 80,
    penta: 80,
    pcv: 80,
    ipv: 60,
    measles: 100,
    yf: 80,
    td: 80,
    mena: 80,
    rota: 80,
    hpv: 40,
    mr: 100,
    malaria: 0,
    storageUtilized: '—',
    remainingCapacity: '—'
  }
];

export default function MaximumStockView() {
  const [records, setRecords] = useState<MaximumStockRecord[]>(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');

  // Sorting State
  const [sortField, setSortField] = useState<keyof MaximumStockRecord>('sn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Actions Dropdown Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOnlyOpen, setIsViewOnlyOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<MaximumStockRecord | null>(null);

  // Form states for creating/editing
  const [formEHFName, setFormEHFName] = useState('');
  const [formState, setFormState] = useState('ABIA');
  const [formLGA, setFormLGA] = useState('ABA NORTH');
  const [formWard, setFormWard] = useState('ARIARIA');
  const [formPhone, setFormPhone] = useState('');
  const [formID, setFormID] = useState('');
  const [formCCECount, setFormCCECount] = useState<number>(1);
  const [formCCEModel, setFormCCEModel] = useState('TCW 40 SDD');
  const [formCCEStatus, setFormCCEStatus] = useState('Functional');

  // Vaccine dose forms
  const [bcg, setBcg] = useState<number>(0);
  const [hepb, setHepb] = useState<number>(0);
  const [bopv, setBopv] = useState<number>(0);
  const [penta, setPenta] = useState<number>(0);
  const [pcv, setPcv] = useState<number>(0);
  const [ipv, setIpv] = useState<number>(0);
  const [measles, setMeasles] = useState<number>(0);
  const [yf, setYf] = useState<number>(0);
  const [td, setTd] = useState<number>(0);
  const [mena, setMena] = useState<number>(0);
  const [rota, setRota] = useState<number>(0);
  const [hpv, setHpv] = useState<number>(0);
  const [mr, setMr] = useState<number>(0);
  const [malaria, setMalaria] = useState<number>(0);

  // Mobile list expanded cards
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Handle outside click to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter & Sort logic
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = records.filter(r => 
      r.ehfName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      r.lga.toLowerCase().includes(q) ||
      r.ward.toLowerCase().includes(q)
    );

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [records, searchQuery, sortField, sortDirection]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSort = (field: keyof MaximumStockRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open Form for Editing
  const handleEditClick = (record: MaximumStockRecord) => {
    setActiveRecord(record);
    setFormEHFName(record.ehfName);
    setFormState(record.state);
    setFormLGA(record.lga);
    setFormWard(record.ward);
    setFormPhone(record.phone);
    setFormID(record.id);
    setFormCCECount(record.cceCount);
    setFormCCEModel(record.cceModel);
    setFormCCEStatus(record.cceStatus);

    setBcg(record.bcg);
    setHepb(record.hepb);
    setBopv(record.bopv);
    setPenta(record.penta);
    setPcv(record.pcv);
    setIpv(record.ipv);
    setMeasles(record.measles);
    setYf(record.yf);
    setTd(record.td);
    setMena(record.mena);
    setRota(record.rota);
    setHpv(record.hpv);
    setMr(record.mr);
    setMalaria(record.malaria);

    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  // Open Detailed View Only mode (matching screenshot detail view)
  const handleViewClick = (record: MaximumStockRecord) => {
    setActiveRecord(record);
    setIsViewOnlyOpen(true);
    setOpenMenuId(null);
  };

  const handlePrevRecord = () => {
    if (!activeRecord) return;
    const currentIndex = filteredRecords.findIndex(r => r.id === activeRecord.id);
    if (currentIndex > 0) {
      setActiveRecord(filteredRecords[currentIndex - 1]);
    } else {
      setActiveRecord(filteredRecords[filteredRecords.length - 1]);
    }
  };

  const handleNextRecord = () => {
    if (!activeRecord) return;
    const currentIndex = filteredRecords.findIndex(r => r.id === activeRecord.id);
    if (currentIndex < filteredRecords.length - 1) {
      setActiveRecord(filteredRecords[currentIndex + 1]);
    } else {
      setActiveRecord(filteredRecords[0]);
    }
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this Maximum Stock record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      setOpenMenuId(null);
    }
  };

  // Submit Form changes
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formEHFName.trim()) {
      alert('Please provide EHF Name');
      return;
    }

    const updatedData: Omit<MaximumStockRecord, 'sn'> = {
      id: formID || activeRecord?.id || `ABIA-${String(records.length + 1).padStart(4, '0')}`,
      ehfName: formEHFName,
      state: formState,
      lga: formLGA,
      ward: formWard,
      phone: formPhone,
      cceCount: Number(formCCECount),
      cceModel: formCCEModel,
      cceStatus: formCCEStatus,
      bcg,
      hepb,
      bopv,
      penta,
      pcv,
      ipv,
      measles,
      yf,
      td,
      mena,
      rota,
      hpv,
      mr,
      malaria,
      storageUtilized: activeRecord?.storageUtilized || '—',
      remainingCapacity: activeRecord?.remainingCapacity || '—'
    };

    if (activeRecord) {
      setRecords(prev => prev.map(r => r.id === activeRecord.id ? { ...r, ...updatedData } : r));
    } else {
      const nextSn = records.length > 0 ? Math.max(...records.map(r => r.sn)) + 1 : 1;
      setRecords(prev => [...prev, { sn: nextSn, ...updatedData }]);
    }

    setIsFormOpen(false);
    setActiveRecord(null);
  };

  // Excel simulation upload
  const handleExcelUpload = (e: FormEvent) => {
    e.preventDefault();
    alert('Excel file imported successfully! New facilities added/updated.');
    setIsUploadOpen(false);
  };

  if (isViewOnlyOpen && activeRecord) {
    return (
      <div className="flex flex-col gap-5 w-full animate-fade-in" id="maximum-stock-detail-screen">
        {/* PRIMARY HEADER with facility name and back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-150 shadow-3xs">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
              {activeRecord.ehfName}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 uppercase">
              Facility ID: {activeRecord.id} • {activeRecord.state} • {activeRecord.lga}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button 
                type="button" 
                onClick={handlePrevRecord}
                className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center transition-all"
                title="Previous Facility"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={handleNextRecord}
                className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center transition-all"
                title="Next Facility"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setIsViewOnlyOpen(false)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View only content scroll */}
        <div className="flex flex-col gap-6">
          
          {/* SECTION 1: FACILITY INFORMATION */}
          <div className="bg-white rounded-xl p-6 border border-slate-150/60 shadow-3xs flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                FACILITY INFORMATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">State</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  {activeRecord.state}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LGA</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  {activeRecord.lga}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ward</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  {activeRecord.ward}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EHF Name</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 font-display">
                  {activeRecord.ehfName}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unique ID</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 font-mono">
                  {activeRecord.id}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 font-mono">
                  {activeRecord.phone}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CCE Count</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  {activeRecord.cceCount}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CCE Model</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  {activeRecord.cceModel}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CCE Status</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg px-3 py-2 text-xs font-bold text-slate-700">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    activeRecord.cceStatus === 'Functional' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {activeRecord.cceStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: VACCINE DOSES & STORAGE */}
          <div className="bg-white rounded-xl p-6 border border-slate-150/60 shadow-3xs flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                VACCINE DOSES & STORAGE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3.5">
              {[
                { label: 'BCG', value: activeRecord.bcg },
                { label: 'HepB', value: activeRecord.hepb },
                { label: 'bOPV', value: activeRecord.bopv },
                { label: 'Penta', value: activeRecord.penta },
                { label: 'PCV', value: activeRecord.pcv },
                { label: 'IPV', value: activeRecord.ipv },
                { label: 'Measles', value: activeRecord.measles },
                { label: 'YF', value: activeRecord.yf },
                { label: 'TD', value: activeRecord.td },
                { label: 'MenA', value: activeRecord.mena },
                { label: 'Rota', value: activeRecord.rota },
                { label: 'HPV', value: activeRecord.hpv },
                { label: 'MR', value: activeRecord.mr },
                { label: 'Malaria', value: activeRecord.malaria },
              ].map((vac) => (
                <div key={vac.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{vac.label}</span>
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-center text-xs font-bold font-mono text-slate-700">
                    {vac.value}
                  </div>
                </div>
              ))}
              
              {/* Storage info fields */}
              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Storage Utilized</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-center text-xs font-medium text-slate-500">
                  {activeRecord.storageUtilized || '—'}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Remaining Capacity</span>
                <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-center text-xs font-medium text-slate-500">
                  {activeRecord.remainingCapacity || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* BACK BUTTON */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsViewOnlyOpen(false)}
              className="px-5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-3xs rounded-xl transition-all cursor-pointer min-h-[38px] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to List
            </button>
            <button 
              onClick={() => handleEditClick(activeRecord)}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-teal-800 hover:bg-brand-teal-900 shadow-3xs rounded-xl transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit This Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full" id="maximum-stock-container">
      
      {/* PRIMARY HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6" id="maximum-stock-header">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
            Maximum Stock
          </h1>
        </div>
        
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
          id="upload-excel-btn"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Excel</span>
        </button>
      </div>

      {/* MAIN DATA CARD AND VIEWS */}
      <div className="bg-white rounded-2xl border border-slate-150/80 shadow-3xs overflow-hidden" id="max-stock-card-panel">
        
        {/* Panel Search and Toggle View controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 font-display">
              Maximum Stock Records
            </h2>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              Refined logistics database per state LGA levels
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
                placeholder="Search by EHF name..."
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

            {/* Layout switcher */}
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

        {/* View Presentations */}
        {viewMode === 'table' ? (
          /* Desktop Scrollable Spreadsheet View */
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[2200px] border-collapse text-left text-xs text-slate-600 bg-white">
              <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display border-b border-slate-150">
                <tr>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors w-16" onClick={() => handleSort('sn')}>
                    <div className="flex items-center gap-1.5">
                      S/N <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'sn' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      Unique ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors min-w-[180px]" onClick={() => handleSort('ehfName')}>
                    <div className="flex items-center gap-1.5">
                      EHF Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'ehfName' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('state')}>
                    <div className="flex items-center gap-1.5">
                      State <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'state' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('lga')}>
                    <div className="flex items-center gap-1.5">
                      LGA <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'lga' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('ward')}>
                    <div className="flex items-center gap-1.5">
                      Ward <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'ward' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4 select-none cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('phone')}>
                    <div className="flex items-center gap-1.5">
                      Phone <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortField === 'phone' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-teal-600" /> : <ArrowDown className="w-3 h-3 text-brand-teal-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">CCE Count</th>
                  <th className="py-3 px-3">CCE Model</th>
                  <th className="py-3 px-3">CCE Status</th>
                  
                  {/* Vaccine header columns */}
                  <th className="py-3 px-3 text-right">BCG</th>
                  <th className="py-3 px-3 text-right">HepB</th>
                  <th className="py-3 px-3 text-right">bOPV</th>
                  <th className="py-3 px-3 text-right">Penta</th>
                  <th className="py-3 px-3 text-right">PCV</th>
                  <th className="py-3 px-3 text-right">IPV</th>
                  <th className="py-3 px-3 text-right">Measles</th>
                  <th className="py-3 px-3 text-right">YF</th>
                  <th className="py-3 px-3 text-right">TD</th>
                  <th className="py-3 px-3 text-right">MenA</th>
                  <th className="py-3 px-3 text-right">Rota</th>
                  <th className="py-3 px-3 text-right">HPV</th>
                  <th className="py-3 px-3 text-right">MR</th>
                  <th className="py-3 px-3 text-right">Malaria</th>
                  
                  <th className="py-3 px-3 text-center">Storage Utilized</th>
                  <th className="py-3 px-3 text-center">Remaining Capacity</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={27} className="py-12 text-center text-slate-400 bg-slate-50/20">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building2 className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-xs font-bold text-slate-400">No matching facilities found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => (
                    <tr key={r.id} className="bg-white hover:bg-slate-50/40 transition-colors text-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-400 font-mono text-center">{r.sn}</td>
                      <td className="py-3 px-4 font-bold text-slate-500 font-mono">{r.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm">{r.ehfName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{r.state}</td>
                      <td className="py-3 px-4 font-medium text-slate-600">{r.lga}</td>
                      <td className="py-3 px-4 font-medium text-slate-500">{r.ward}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500 font-mono">{r.phone}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{r.cceCount}</td>
                      <td className="py-3 px-3 font-semibold text-slate-500">{r.cceModel}</td>
                      <td className="py-3 px-3 font-medium">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.cceStatus === 'Functional' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.cceStatus}
                        </span>
                      </td>

                      {/* Vaccines fields */}
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.bcg}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.hepb}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.bopv}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.penta}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.pcv}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.ipv}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.measles}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.yf}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.td}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.mena}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.rota}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.hpv}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.mr}</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono text-slate-600">{r.malaria}</td>
                      
                      <td className="py-3 px-3 text-center text-slate-400">{r.storageUtilized || '—'}</td>
                      <td className="py-3 px-3 text-center text-slate-400">{r.remainingCapacity || '—'}</td>

                      <td className="py-3 px-4 text-center">
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
                                  onClick={() => handleViewClick(r)}
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" /> View Stock Setup
                                </button>
                                <button 
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => handleEditClick(r)}
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Stock Setup
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button 
                                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  onClick={() => handleDelete(r.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Facility
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
          /* Responsive Mobile Compact Grid View with expander details */
          <div className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/30 text-xs font-bold">
                No matching health facilities found
              </div>
            ) : (
              paginatedRecords.map((r) => (
                <div key={r.id} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-teal-50 text-brand-teal-700 border border-brand-teal-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {r.ehfName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-snug">{r.ehfName}</span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">{r.id} • {r.state} • {r.lga}</span>
                      </div>
                    </div>
                    
                    {/* Compact actions dropdown */}
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
                              onClick={() => handleViewClick(r)}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" /> View Stock Setup
                            </button>
                            <button 
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => handleEditClick(r)}
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Stock Setup
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button 
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Facility
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <button 
                      onClick={() => setExpandedCardId(expandedCardId === r.id ? null : r.id)}
                      className="text-xs text-brand-teal-600 font-bold hover:text-brand-teal-700 cursor-pointer flex items-center gap-1 select-none"
                    >
                      {expandedCardId === r.id ? 'Hide Details' : 'View Details'} 
                      {expandedCardId === r.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.cceStatus === 'Functional' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                    }`}>{r.cceStatus}</span>
                  </div>

                  {/* Expanded detail box */}
                  <AnimatePresence>
                    {expandedCardId === r.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1 pt-2.5 border-t border-slate-100 flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] bg-slate-50/60 rounded-xl p-3 border border-slate-100 font-medium">
                          <div><span className="text-slate-400">Ward:</span> {r.ward}</div>
                          <div><span className="text-slate-400">Phone:</span> {r.phone}</div>
                          <div><span className="text-slate-400">CCE Model:</span> {r.cceModel}</div>
                          <div><span className="text-slate-400">CCE Count:</span> {r.cceCount}</div>
                        </div>

                        {/* Miniature Vaccine Doses Grid */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">VACCINES (DOSES AT HAND)</span>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-[10px] font-mono font-bold">
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">BCG</span>
                              <span className="text-slate-700 mt-0.5">{r.bcg}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">HepB</span>
                              <span className="text-slate-700 mt-0.5">{r.hepb}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">bOPV</span>
                              <span className="text-slate-700 mt-0.5">{r.bopv}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">Penta</span>
                              <span className="text-slate-700 mt-0.5">{r.penta}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">PCV</span>
                              <span className="text-slate-700 mt-0.5">{r.pcv}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">IPV</span>
                              <span className="text-slate-700 mt-0.5">{r.ipv}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">Measles</span>
                              <span className="text-slate-700 mt-0.5">{r.measles}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">YF</span>
                              <span className="text-slate-700 mt-0.5">{r.yf}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">MR</span>
                              <span className="text-slate-700 mt-0.5">{r.mr}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded py-1 flex flex-col">
                              <span className="text-[8px] text-slate-400 uppercase font-sans">Malaria</span>
                              <span className="text-slate-700 mt-0.5">{r.malaria}</span>
                            </div>
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
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white select-none">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} results
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



      {/* DETAILED FORM DIALOG MODAL FOR EDITING/CREATING */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-2xl shadow-xl border border-slate-150 max-w-4xl w-full overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 font-display">
                    {activeRecord ? `Edit Maximum Stock Setup: ${formEHFName}` : 'Add New Maximum Stock'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                    CONFIGURE STORES DATA
                  </span>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col">
                <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-6">
                  
                  {/* FORM SECTION 1: FACILITY INFORMATION */}
                  <div className="bg-white rounded-xl p-5 border border-slate-150/60 shadow-3xs flex flex-col gap-4">
                    <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                      FACILITY INFORMATION
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">State *</label>
                        <input 
                          type="text" 
                          required 
                          value={formState}
                          onChange={(e) => setFormState(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">LGA *</label>
                        <input 
                          type="text" 
                          required 
                          value={formLGA}
                          onChange={(e) => setFormLGA(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Ward *</label>
                        <input 
                          type="text" 
                          required 
                          value={formWard}
                          onChange={(e) => setFormWard(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">EHF Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Enter facility name"
                          value={formEHFName}
                          onChange={(e) => setFormEHFName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Unique ID *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. ABIA-0001"
                          value={formID}
                          onChange={(e) => setFormID(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">Phone</label>
                        <input 
                          type="text" 
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">CCE Count</label>
                        <input 
                          type="number" 
                          value={formCCECount}
                          onChange={(e) => setFormCCECount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">CCE Model</label>
                        <input 
                          type="text" 
                          value={formCCEModel}
                          onChange={(e) => setFormCCEModel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 text-xs outline-none transition-all"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-600">CCE Status</label>
                        <div className="relative">
                          <select
                            value={formCCEStatus}
                            onChange={(e) => setFormCCEStatus(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 rounded-lg p-2 pr-8 text-xs outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="Functional">Functional</option>
                            <option value="Non-functional (awaiting repairs)">Non-functional (awaiting repairs)</option>
                            <option value="Awaiting Installation">Awaiting Installation</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM SECTION 2: VACCINE DOSES & STORAGE */}
                  <div className="bg-white rounded-xl p-5 border border-slate-150/60 shadow-3xs flex flex-col gap-4">
                    <span className="text-[10px] font-extrabold text-brand-teal-700 tracking-wider font-display uppercase">
                      VACCINE DOSES & STORAGE
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {[
                        { label: 'BCG', val: bcg, setVal: setBcg },
                        { label: 'HepB', val: hepb, setVal: setHepb },
                        { label: 'bOPV', val: bopv, setVal: setBopv },
                        { label: 'Penta', val: penta, setVal: setPenta },
                        { label: 'PCV', val: pcv, setVal: setPcv },
                        { label: 'IPV', val: ipv, setVal: setIpv },
                        { label: 'Measles', val: measles, setVal: setMeasles },
                        { label: 'YF', val: yf, setVal: setYf },
                        { label: 'TD', val: td, setVal: setTd },
                        { label: 'MenA', val: mena, setVal: setMena },
                        { label: 'Rota', val: rota, setVal: setRota },
                        { label: 'HPV', val: hpv, setVal: setHpv },
                        { label: 'MR', val: mr, setVal: setMr },
                        { label: 'Malaria', val: malaria, setVal: setMalaria },
                      ].map((vItem) => (
                        <div key={vItem.label} className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{vItem.label}</label>
                          <input 
                            type="number"
                            value={vItem.val}
                            onChange={(e) => vItem.setVal(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-teal-500 text-slate-800 text-xs text-center rounded-lg p-1.5 outline-none font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-teal-700 hover:bg-brand-teal-800 rounded-lg shadow-2xs cursor-pointer"
                  >
                    {activeRecord ? 'Save Changes' : 'Create Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXCEL IMPORT DIALOG MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-400 font-bold tracking-wider font-mono uppercase">
                  IMPORT EXCEL DATA
                </span>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleExcelUpload} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-center py-6 border-2 border-dashed border-slate-200 hover:border-brand-teal-500 rounded-xl transition-colors cursor-pointer bg-slate-50/35">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
                  <span className="text-xs font-bold text-slate-700">Click to upload spreadsheet</span>
                  <span className="text-[10px] text-slate-400 font-medium">Supports CSV, XLS, XLSX formats</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-amber-800">Note:</span>
                    <span className="text-[10px] text-amber-700 leading-normal">
                      The columns in the uploaded Excel sheets must match the EHF facility name, state code, and vaccine quantities as represented in maximum stock configurations.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-brand-teal-700 hover:bg-brand-teal-800 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Upload Document
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
