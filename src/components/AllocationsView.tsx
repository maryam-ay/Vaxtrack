import { useState, useMemo, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowUpDown, LayoutGrid, Database, MoreHorizontal, Sparkles, Plus, Calendar, MapPin, Building, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

interface AllocationRecord {
  allocationId: string;
  state: string;
  tpl: string;
  dispatchDate: string;
  facilitiesCount: number;
  status: 'Received' | 'Pending' | 'Approved' | 'Dispatched';
  bcg: number;
  bopv: number;
  hpv: number;
  hepb: number;
  ipv: number;
  measles: number;
  mena: number;
  mr: number;
}

const SAMPLE_ALLOCATIONS: AllocationRecord[] = [
  {
    allocationId: 'ALO-0041',
    state: 'Kaduna',
    tpl: 'FedEx Health',
    dispatchDate: 'Jun 10, 2026',
    facilitiesCount: 847,
    status: 'Received',
    bcg: 298990,
    bopv: 380450,
    hpv: 134200,
    hepb: 145600,
    ipv: 198340,
    measles: 210500,
    mena: 192800,
    mr: 214280
  },
  {
    allocationId: 'ALO-0040',
    state: 'Adamawa',
    tpl: 'DHL Supply Chain',
    dispatchDate: 'Jun 12, 2026',
    facilitiesCount: 423,
    status: 'Pending',
    bcg: 158180,
    bopv: 206190,
    hpv: 40216,
    hepb: 84520,
    ipv: 98360,
    measles: 122050,
    mena: 113410,
    mr: 0
  },
  {
    allocationId: 'ALO-0039',
    state: 'Abia',
    tpl: 'GIG Logistics',
    dispatchDate: 'Jun 14, 2026',
    facilitiesCount: 312,
    status: 'Approved',
    bcg: 32850,
    bopv: 92670,
    hpv: 9660,
    hepb: 29670,
    ipv: 45170,
    measles: 46475,
    mena: 36560,
    mr: 46475
  },
  {
    allocationId: 'ALO-0038',
    state: 'Plateau',
    tpl: 'MDS Logistics',
    dispatchDate: 'Jun 15, 2026',
    facilitiesCount: 289,
    status: 'Dispatched',
    bcg: 181180,
    bopv: 225260,
    hpv: 42772,
    hepb: 84500,
    ipv: 110908,
    measles: 127340,
    mena: 110998,
    mr: 127340
  },
  {
    allocationId: 'ALO-0037',
    state: 'Bayelsa',
    tpl: 'FedEx Health',
    dispatchDate: 'Jun 16, 2026',
    facilitiesCount: 198,
    status: 'Pending',
    bcg: 45390,
    bopv: 52995,
    hpv: 8382,
    hepb: 17895,
    ipv: 33538,
    measles: 33820,
    mena: 30314,
    mr: 36135
  }
];

interface AllocationsViewProps {
  isNewAllocModalOpen?: boolean;
  setIsNewAllocModalOpen?: (open: boolean) => void;
}

export function AllocationsView({
  isNewAllocModalOpen: propIsNewAllocModalOpen,
  setIsNewAllocModalOpen: propSetIsNewAllocModalOpen
}: AllocationsViewProps = {}) {
  const [localIsNewAllocModalOpen, localSetIsNewAllocModalOpen] = useState(false);
  const isNewAllocModalOpen = propIsNewAllocModalOpen !== undefined ? propIsNewAllocModalOpen : localIsNewAllocModalOpen;
  const setIsNewAllocModalOpen = propSetIsNewAllocModalOpen !== undefined ? propSetIsNewAllocModalOpen : localSetIsNewAllocModalOpen;

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table');
  const [expandedMobileAllocId, setExpandedMobileAllocId] = useState<string | null>(null);
  const isSkeletonMode = false; // Permanently live pipeline view as requested
  const [allocations, setAllocations] = useState<AllocationRecord[]>(SAMPLE_ALLOCATIONS);
  const [sortBy, setSortBy] = useState<'id' | 'state' | 'tpl' | 'facilities'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getInitials = (name: string) => {
    if (!name) return 'AL';
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
    const cleanName = name || 'AL';
    for (let i = 0; i < cleanName.length; i++) sum += cleanName.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

  const deleteAllocation = (id: string) => {
    setAllocations(prev => prev.filter(a => a.allocationId !== id));
    setOpenMenuId(null);
  };

  const updateAllocationStatus = (id: string, status: 'Received' | 'Pending' | 'Approved' | 'Dispatched') => {
    setAllocations(prev => prev.map(a => a.allocationId === id ? { ...a, status } : a));
    setOpenMenuId(null);
  };

  const ActionMenu = ({ allocation }: { allocation: AllocationRecord }) => (
    <div className="relative inline-block text-left" ref={openMenuId === allocation.allocationId ? menuRef : null}>
      <button 
        onClick={() => setOpenMenuId(openMenuId === allocation.allocationId ? null : allocation.allocationId)} 
        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {openMenuId === allocation.allocationId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -5 }} 
            className="absolute right-0 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-lg z-50 py-1"
          >
            <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Status</div>
            <button 
              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => updateAllocationStatus(allocation.allocationId, 'Approved')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Set Approved
            </button>
            <button 
              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => updateAllocationStatus(allocation.allocationId, 'Dispatched')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Set Dispatched
            </button>
            <button 
              className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              onClick={() => updateAllocationStatus(allocation.allocationId, 'Received')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Set Received
            </button>
            <div className="border-t border-slate-100 my-1"></div>
            <button 
              className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={() => deleteAllocation(allocation.allocationId)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Allocation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  // Pagination reference states
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  // New Allocation Modal state variables
  const [newAlloc, setNewAlloc] = useState({
    state: 'Lagos',
    tpl: 'FedEx Health',
    dispatchDate: 'Jun 28, 2026',
    facilitiesCount: 150,
    status: 'Pending' as 'Received' | 'Pending' | 'Approved' | 'Dispatched',
    bcg: 12000,
    bopv: 15000,
    hpv: 4500,
    hepb: 8000,
    ipv: 11000,
    measles: 12500,
    mena: 9500,
    mr: 10500,
  });

  // Calculate stats based on skeleton vs live mode
  const totalAllocationsCount = isSkeletonMode ? 0 : allocations.length;
  const pendingConfirmationCount = isSkeletonMode 
    ? 0 
    : allocations.filter(a => a.status === 'Pending').length;

  const handleToggleSort = (field: 'id' | 'state' | 'tpl' | 'facilities') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddAllocation = (e: FormEvent) => {
    e.preventDefault();
    const nextIdNum = 42 + (allocations.length - 5);
    const idString = `ALO-00${nextIdNum}`;

    const newRecord: AllocationRecord = {
      allocationId: idString,
      state: newAlloc.state,
      tpl: newAlloc.tpl,
      dispatchDate: newAlloc.dispatchDate,
      facilitiesCount: Number(newAlloc.facilitiesCount),
      status: newAlloc.status,
      bcg: Number(newAlloc.bcg) || 0,
      bopv: Number(newAlloc.bopv) || 0,
      hpv: Number(newAlloc.hpv) || 0,
      hepb: Number(newAlloc.hepb) || 0,
      ipv: Number(newAlloc.ipv) || 0,
      measles: Number(newAlloc.measles) || 0,
      mena: Number(newAlloc.mena) || 0,
      mr: Number(newAlloc.mr) || 0
    };
    setAllocations(prev => [newRecord, ...prev]);
    setIsNewAllocModalOpen(false);
  };

  const filteredAndSortedAllocations = useMemo(() => {
    let result = [...allocations];
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.allocationId.toLowerCase().includes(q) || 
        a.state.toLowerCase().includes(q) ||
        a.tpl.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.allocationId.localeCompare(b.allocationId);
      } else if (sortBy === 'state') {
        comparison = a.state.localeCompare(b.state);
      } else if (sortBy === 'tpl') {
        comparison = a.tpl.localeCompare(b.tpl);
      } else if (sortBy === 'facilities') {
        comparison = a.facilitiesCount - b.facilitiesCount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allocations, searchQuery, sortBy, sortOrder]);

  // Aggregate totals of vaccines dynamically
  const totals = useMemo(() => {
    if (isSkeletonMode) {
      return { bcg: 0, bopv: 0, hpv: 0, hepb: 0, ipv: 0, measles: 0, mena: 0, mr: 0 };
    }
    return filteredAndSortedAllocations.reduce((acc, curr) => {
      acc.bcg += curr.bcg;
      acc.bopv += curr.bopv;
      acc.hpv += curr.hpv;
      acc.hepb += curr.hepb;
      acc.ipv += curr.ipv;
      acc.measles += curr.measles;
      acc.mena += curr.mena;
      acc.mr += curr.mr;
      return acc;
    }, { bcg: 0, bopv: 0, hpv: 0, hepb: 0, ipv: 0, measles: 0, mena: 0, mr: 0 });
  }, [filteredAndSortedAllocations, isSkeletonMode]);

  return (
    <div className="flex flex-col gap-4" id="allocations-view-container">

      {/* METRIC KPI CARDS - Matches Reference Spacing and Colors */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="allocation-kpi-grid">
        
        {/* CARD 1: TOTAL ALLOCATIONS */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#3b82f6' }} id="kpi-total-allocations">
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">
            TOTAL ALLOCATIONS
          </span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">
            {totalAllocationsCount}
          </span>
        </div>

        {/* CARD 2: PENDING CONFIRMATION */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#f59e0b' }} id="kpi-pending-confirmation">
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">
            PENDING CONFIRMATION
          </span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">
            {pendingConfirmationCount}
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER FOR TABLE */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="vaccine-allocated-card">
        
        {/* CARD HEADER */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col gap-0.5" id="allocated-card-header">
          <h3 className="text-xs font-bold text-slate-700 font-display">
            Vaccine Allocated
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            All vaccine allocation records and pipeline status
          </p>
        </div>

        {/* CONTROLS BAR: SEARCH & GRID PREFERENCES */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-3" id="allocated-controls-bar">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by state or allocation id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSkeletonMode}
              className={`w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white text-slate-800 text-[11px] rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all min-h-[32px] ${
                isSkeletonMode ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              id="allocation-search-input"
            />
          </div>

          {/* Clean outline view icons matching reference */}
          <div className="flex items-center gap-2 shrink-0 select-none">
            <button onClick={() => setViewMode('table')} className={`p-1 rounded ${viewMode === 'table' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}>
              <Database className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('compact')} className={`p-1 rounded ${viewMode === 'compact' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RESPONSIVE TABLE CONTAINER */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto" id="allocation-table-horizontal-wrapper">
            <table className="w-full min-w-[950px] border-collapse text-left" id="allocation-table">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th 
                    onClick={() => !isSkeletonMode && handleToggleSort('id')}
                    className={`py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[105px] ${!isSkeletonMode ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span style={{ width: '80px' }}>ALLOCATION ID</span>
                      {!isSkeletonMode && <ArrowUpDown className="w-2.5 h-2.5" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => !isSkeletonMode && handleToggleSort('state')}
                    className={`py-3 px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[100px] ${!isSkeletonMode ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>STATE</span>
                      {!isSkeletonMode && <ArrowUpDown className="w-2.5 h-2.5" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => !isSkeletonMode && handleToggleSort('tpl')}
                    className={`py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[110px] ${!isSkeletonMode ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>3PL</span>
                      {!isSkeletonMode && <ArrowUpDown className="w-2.5 h-2.5" />}
                    </div>
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[100px]">
                    DISPATCH DATE
                  </th>
                  <th 
                    onClick={() => !isSkeletonMode && handleToggleSort('facilities')}
                    className={`py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[85px] ${!isSkeletonMode ? 'cursor-pointer hover:text-slate-600 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>FACILITIES</span>
                      {!isSkeletonMode && <ArrowUpDown className="w-2.5 h-2.5" />}
                    </div>
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display min-w-[90px]">
                    STATUS
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center min-w-[60px]">
                    ACTIONS
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    BCG
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    BOPV
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    HPV
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    HEPB
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    IPV
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[70px]">
                    MEASLES
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    MENA
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-right min-w-[65px]">
                    MR
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                
                {/* SKELETON PLACEHOLDER ROWS - Perfectly matches reference style */}
                {isSkeletonMode ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="bg-white hover:bg-slate-50/20 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="w-16 h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2.5">
                        <div className="w-16 h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-20 h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-16 h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-16 h-5 rounded-full bg-slate-100 animate-pulse" />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <div className="w-6 h-4 rounded bg-slate-100 animate-pulse mx-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="w-12 h-4 rounded bg-slate-100 animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  /* LIVE DATATABLE ROWS */
                  filteredAndSortedAllocations.map((alloc) => (
                    <tr key={alloc.allocationId} className="bg-white hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                      
                      {/* ALLOCATION ID */}
                      <td className="py-3 px-3 font-semibold text-teal-600 hover:underline cursor-pointer">
                        {alloc.allocationId}
                      </td>
                      
                      {/* STATE */}
                      <td className="py-3 px-2.5 font-bold text-slate-800">
                        {alloc.state}
                      </td>

                      {/* 3PL */}
                      <td className="py-3 px-2 font-semibold text-slate-600">
                        {alloc.tpl}
                      </td>

                      {/* DISPATCH DATE */}
                      <td className="py-3 px-2 text-slate-500 font-medium">
                        {alloc.dispatchDate}
                      </td>

                      {/* FACILITIES */}
                      <td className="py-3 px-2 text-slate-600 font-semibold">
                        {alloc.facilitiesCount}
                      </td>

                      {/* STATUS BADGE - Exactly Styled After Reference */}
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          alloc.status === 'Received'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : alloc.status === 'Approved'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : alloc.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {alloc.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-2 text-center text-slate-400">
                        <ActionMenu allocation={alloc} />
                      </td>

                      {/* BCG */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.bcg.toLocaleString()}
                      </td>

                      {/* BOPV */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.bopv.toLocaleString()}
                      </td>

                      {/* HPV */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.hpv.toLocaleString()}
                      </td>

                      {/* HEPB */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.hepb.toLocaleString()}
                      </td>

                      {/* IPV */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.ipv.toLocaleString()}
                      </td>

                      {/* MEASLES */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.measles.toLocaleString()}
                      </td>

                      {/* MENA */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-700 font-medium">
                        {alloc.mena.toLocaleString()}
                      </td>

                      {/* MR (Styled with light red bg when 0, matching reference image) */}
                      <td className={`py-3 px-2 text-right font-mono text-[11px] ${
                        alloc.mr === 0 
                          ? 'bg-red-50 text-red-600 font-bold' 
                          : 'text-slate-700 font-medium'
                      }`}>
                        {alloc.mr.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}

                {/* TOTAL ROW - Fully Matches the reference table footer */}
                <tr className="bg-slate-50/70 border-t border-slate-200/80 font-bold text-xs text-slate-800">
                  <td colSpan={7} className="py-3.5 px-3 font-bold text-slate-800 text-left">
                    Total
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.bcg.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.bopv.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.hpv.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.hepb.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.ipv.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.measles.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.mena.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-xs">
                    {totals.mr.toLocaleString()}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
             {filteredAndSortedAllocations.map((alloc) => (
                <div key={alloc.allocationId} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(alloc.state)}`}>
                        {getInitials(alloc.state)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{alloc.allocationId}</span>
                        <button 
                          onClick={() => setExpandedMobileAllocId(expandedMobileAllocId === alloc.allocationId ? null : alloc.allocationId)} 
                          className="flex items-center text-[10px] text-slate-400 font-bold uppercase cursor-pointer"
                        >
                          {expandedMobileAllocId === alloc.allocationId ? 'Hide Details' : 'View Details'} 
                          {expandedMobileAllocId === alloc.allocationId ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                        </button>
                      </div>
                    </div>
                    <ActionMenu allocation={alloc} />
                  </div>
                  <AnimatePresence>
                    {expandedMobileAllocId === alloc.allocationId && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden"
                      >
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between items-center mb-2 text-xs">
                             <div className="text-slate-500"><strong>State:</strong> {alloc.state} · <strong>3PL:</strong> {alloc.tpl}</div>
                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                 alloc.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                 alloc.status === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                 alloc.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                             }`}>{alloc.status}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 rounded-xl p-2.5">
                            <div><strong>BCG:</strong> {alloc.bcg}</div>
                            <div><strong>BOPV:</strong> {alloc.bopv}</div>
                            <div><strong>HPV:</strong> {alloc.hpv}</div>
                            <div><strong>HEPB:</strong> {alloc.hepb}</div>
                            <div><strong>IPV:</strong> {alloc.ipv}</div>
                            <div><strong>Measles:</strong> {alloc.measles}</div>
                            <div><strong>Mena:</strong> {alloc.mena}</div>
                            <div><strong>MR:</strong> {alloc.mr}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </div>
        )}

        {/* EMPTY STATE FOR SEARCH */}
        {!isSkeletonMode && filteredAndSortedAllocations.length === 0 && (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white">
            <span className="text-sm font-bold text-slate-500 font-display">No records found</span>
            <span className="text-[10px] text-slate-400">No transactions match your current search queries.</span>
          </div>
        )}

        {/* PAGINATION PANEL - Matches Reference Design exactly */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-400" id="allocation-pagination-bar">
          <span className="text-[11px] font-medium text-slate-400 font-sans">
            Showing 1 to {filteredAndSortedAllocations.length} of {isSkeletonMode ? 0 : 248} results
          </span>

          <div className="flex items-center gap-2">
            <button 
              disabled={isSkeletonMode}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all select-none cursor-pointer min-h-[34px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button 
              disabled={isSkeletonMode}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-all select-none cursor-pointer min-h-[34px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* NEW ALLOCATION RECORD FORM MODAL */}
      {isNewAllocModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 font-display uppercase tracking-wide">
                Allocate New Vaccine Batch
              </span>
              <button 
                onClick={() => setIsNewAllocModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAddAllocation} className="p-4 flex flex-col gap-3.5 overflow-y-auto">
              
              {/* STATE */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Destination State</span>
                </label>
                <div className="relative">
                  <select
                    value={newAlloc.state}
                    onChange={(e) => setNewAlloc(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Kano">Kano</option>
                    <option value="FCT Abuja">FCT Abuja</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Delta">Delta</option>
                    <option value="Rivers">Rivers</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 3PL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>3PL Provider</span>
                </label>
                <div className="relative">
                  <select
                    value={newAlloc.tpl}
                    onChange={(e) => setNewAlloc(prev => ({ ...prev, tpl: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
                  >
                    <option value="FedEx Health">FedEx Health</option>
                    <option value="DHL Supply Chain">DHL Supply Chain</option>
                    <option value="GIG Logistics">GIG Logistics</option>
                    <option value="MDS Logistics">MDS Logistics</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* DISPATCH DATE */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Dispatch Date</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jun 28, 2026"
                  value={newAlloc.dispatchDate}
                  onChange={(e) => setNewAlloc(prev => ({ ...prev, dispatchDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* FACILITIES COUNT */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>Number of Target Facilities</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newAlloc.facilitiesCount}
                  onChange={(e) => setNewAlloc(prev => ({ ...prev, facilitiesCount: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* STATUS */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Status</label>
                <div className="relative">
                  <select
                    value={newAlloc.status}
                    onChange={(e) => setNewAlloc(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Received">Received</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* QUANTITIES GRID */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase font-display">
                  Vaccine Quantities (Doses)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">BCG</span>
                    <input
                      type="number"
                      value={newAlloc.bcg}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, bcg: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">BOPV</span>
                    <input
                      type="number"
                      value={newAlloc.bopv}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, bopv: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">HPV</span>
                    <input
                      type="number"
                      value={newAlloc.hpv}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, hpv: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">HEPB</span>
                    <input
                      type="number"
                      value={newAlloc.hepb}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, hepb: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">IPV</span>
                    <input
                      type="number"
                      value={newAlloc.ipv}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, ipv: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">MEASLES</span>
                    <input
                      type="number"
                      value={newAlloc.measles}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, measles: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">MENA</span>
                    <input
                      type="number"
                      value={newAlloc.mena}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, mena: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold text-slate-500 text-center">MR</span>
                    <input
                      type="number"
                      value={newAlloc.mr}
                      onChange={(e) => setNewAlloc(prev => ({ ...prev, mr: Number(e.target.value) }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs outline-none text-right font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer min-h-[40px] mt-2 shadow-xs"
              >
                Submit Allocation Order
              </button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
