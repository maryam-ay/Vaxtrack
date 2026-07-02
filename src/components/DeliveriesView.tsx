import { useState, useMemo, FormEvent } from 'react';
import { Search, Plus, MapPin, Calendar, Building, ChevronLeft, ChevronRight, MoreHorizontal, Database, LayoutGrid, ArrowUpDown, Truck, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { NewAllocationForm } from './NewAllocationForm';

interface DeliveryRecord {
  sn: number;
  requestId: string;
  uhfName: string;
  state: string;
  lga: string;
  status: 'Received' | 'Pending' | 'Approved' | 'Dispatched' | 'In Transit';
  dispatchDate: string;
  carrier: string;
}

const INITIAL_DELIVERIES: DeliveryRecord[] = [
  { sn: 1, requestId: 'REQ-2026-9041', uhfName: 'Primary Health Centre Mando', state: 'Kaduna', lga: 'Igabi', status: 'Received', dispatchDate: 'Jun 10, 2026', carrier: 'FedEx Health' },
  { sn: 2, requestId: 'REQ-2026-9040', uhfName: 'Comprehensive Health Centre Gachiri', state: 'Adamawa', lga: 'Kajuru', status: 'Pending', dispatchDate: 'Jun 12, 2026', carrier: 'DHL Supply Chain' },
  { sn: 3, requestId: 'REQ-2026-9039', uhfName: 'General Hospital Kafanchan', state: 'Kaduna', lga: 'Jema\'a', status: 'Approved', dispatchDate: 'Jun 14, 2026', carrier: 'GIG Logistics' },
  { sn: 4, requestId: 'REQ-2026-9038', uhfName: 'Model Health Clinic Barkin Ladi', state: 'Plateau', lga: 'Barkin Ladi', status: 'Dispatched', dispatchDate: 'Jun 15, 2026', carrier: 'MDS Logistics' },
  { sn: 5, requestId: 'REQ-2026-9037', uhfName: 'State Specialist Hospital Yenagoa', state: 'Bayelsa', lga: 'Yenagoa', status: 'Pending', dispatchDate: 'Jun 16, 2026', carrier: 'FedEx Health' },
  { sn: 6, requestId: 'REQ-2026-9036', uhfName: 'PHC Owerri Urban', state: 'Imo', lga: 'Owerri Municipal', status: 'Received', dispatchDate: 'Jun 18, 2026', carrier: 'DHL Supply Chain' },
  { sn: 7, requestId: 'REQ-2026-9035', uhfName: 'Township Health Centre Akure', state: 'Ondo', lga: 'Akure South', status: 'In Transit', dispatchDate: 'Jun 20, 2026', carrier: 'GIG Logistics' }
];

export function DeliveriesView() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(INITIAL_DELIVERIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingAllocation, setIsCreatingAllocation] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); // Table view by default, option to switch to compact list
  const [expandedSns, setExpandedSns] = useState<Record<number, boolean>>({});

  const handleSaveNewAllocation = (newAlloc: {
    uhfName: string;
    state: string;
    lga: string;
    carrier: string;
    dispatchDate: string;
    status: 'Pending' | 'Approved' | 'Dispatched' | 'In Transit' | 'Received';
  }) => {
    const nextSn = deliveries.length + 1;
    const randId = Math.floor(1000 + Math.random() * 9000);
    const requestId = `REQ-2026-${randId}`;

    const newRecord: DeliveryRecord = {
      sn: nextSn,
      requestId,
      uhfName: newAlloc.uhfName,
      state: newAlloc.state,
      lga: newAlloc.lga,
      status: newAlloc.status,
      dispatchDate: newAlloc.dispatchDate,
      carrier: newAlloc.carrier
    };

    setDeliveries(prev => [newRecord, ...prev]);
    setIsCreatingAllocation(false);
  };

  const toggleExpand = (sn: number) => {
    setExpandedSns(prev => ({
      ...prev,
      [sn]: !prev[sn]
    }));
  };

  // Sorting
  const [sortBy, setSortBy] = useState<'sn' | 'requestId' | 'uhfName' | 'state' | 'status'>('sn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // New Record Form Fields
  const [newDelivery, setNewDelivery] = useState({
    uhfName: '',
    state: 'Kaduna',
    lga: '',
    status: 'Pending' as 'Received' | 'Pending' | 'Approved' | 'Dispatched' | 'In Transit',
    carrier: 'FedEx Health',
    dispatchDate: 'Jun 28, 2026'
  });

  const handleToggleSort = (field: 'sn' | 'requestId' | 'uhfName' | 'state' | 'status') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddDelivery = (e: FormEvent) => {
    e.preventDefault();
    const nextSn = deliveries.length + 1;
    const randId = Math.floor(1000 + Math.random() * 9000);
    const requestId = `REQ-2026-${randId}`;

    const newRecord: DeliveryRecord = {
      sn: nextSn,
      requestId,
      uhfName: newDelivery.uhfName || 'Unnamed Health Facility',
      state: newDelivery.state,
      lga: newDelivery.lga || 'Local Govt Area',
      status: newDelivery.status,
      dispatchDate: newDelivery.dispatchDate,
      carrier: newDelivery.carrier
    };

    setDeliveries(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setNewDelivery({
      uhfName: '',
      state: 'Kaduna',
      lga: '',
      status: 'Pending',
      carrier: 'FedEx Health',
      dispatchDate: 'Jun 28, 2026'
    });
  };

  const handleStatusChange = (sn: number, nextStatus: any) => {
    setDeliveries(prev => prev.map(d => d.sn === sn ? { ...d, status: nextStatus } : d));
  };

  const filteredAndSortedDeliveries = useMemo(() => {
    let result = [...deliveries];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.requestId.toLowerCase().includes(q) || 
        d.uhfName.toLowerCase().includes(q) || 
        d.state.toLowerCase().includes(q) || 
        d.lga.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'sn') comp = a.sn - b.sn;
      else if (sortBy === 'requestId') comp = a.requestId.localeCompare(b.requestId);
      else if (sortBy === 'uhfName') comp = a.uhfName.localeCompare(b.uhfName);
      else if (sortBy === 'state') comp = a.state.localeCompare(b.state);
      else if (sortBy === 'status') comp = a.status.localeCompare(b.status);

      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [deliveries, searchQuery, sortBy, sortOrder]);

  // Count metrics dynamically based on active status values
  const logisticsCount = useMemo(() => {
    return deliveries.filter(d => d.status === 'Received' || d.status === 'Dispatched').length;
  }, [deliveries]);

  const pipelineCount = useMemo(() => {
    return deliveries.filter(d => d.status === 'Pending' || d.status === 'Approved' || d.status === 'In Transit').length;
  }, [deliveries]);

  if (isCreatingAllocation) {
    return (
      <div className="flex flex-col gap-4" id="deliveries-view-container">
        <NewAllocationForm 
          onClose={() => setIsCreatingAllocation(false)} 
          onSave={handleSaveNewAllocation} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" id="deliveries-view-container">



      {/* TWO LARGE KPI CARDS - MATCHING USER SCREENSHOT */}
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="deliveries-kpi-grid">
        {/* LOGISTICS CARD */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#3b82f6' }} id="kpi-logistics">
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">
            LOGISTICS
          </span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">
            {logisticsCount}
          </span>
        </div>

        {/* PIPELINE CARD */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: '#f59e0b' }} id="kpi-pipeline">
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">
            PIPELINE
          </span>
          <span className="text-2xl font-bold text-slate-800 font-display mt-1">
            {pipelineCount}
          </span>
        </div>
      </div>

      {/* MAIN DATA SECTION CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" id="deliveries-table-card">
        
        {/* CARD HEADER SECTION WITH BUTTON */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white" id="deliveries-table-header">
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-slate-700 font-display">
              Forward & Reverse Logistics
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Vaccine dispatch and receipt records
            </p>
          </div>
          <button
            onClick={() => setIsCreatingAllocation(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-3xs cursor-pointer min-h-[32px] select-none"
            id="new-delivery-table-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Allocation</span>
          </button>
        </div>

        {/* CONTROLS BAR: SEARCH & VIEW SWITCHER */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-3" id="deliveries-controls-bar">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by request ID, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white text-slate-800 text-[11px] rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all min-h-[32px]"
              id="delivery-search-input"
            />
          </div>

          {/* Toggle Card View vs Table View */}
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
              title="Compact Mobile List"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE COMPACT LIST / CARDS VIEW */}
        {viewMode === 'card' ? (
          <div className="flex flex-col divide-y divide-slate-100" id="deliveries-mobile-list">
            {filteredAndSortedDeliveries.map((delivery) => {
              const isExpanded = !!expandedSns[delivery.sn];
              return (
                <div key={delivery.sn} className="bg-white hover:bg-slate-50/40 transition-all">
                  {/* Collapsed view / Card Header Trigger */}
                  <div 
                    onClick={() => toggleExpand(delivery.sn)}
                    className="p-4 flex flex-col gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{delivery.sn}
                        </span>
                        <span className="text-xs font-bold text-teal-600">
                          {delivery.requestId}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status Badges */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          delivery.status === 'Received'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : delivery.status === 'Approved'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : delivery.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : delivery.status === 'In Transit'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {delivery.status}
                        </span>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-800 font-sans line-clamp-1 flex-1">
                        {delivery.uhfName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {delivery.state} State
                      </span>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 bg-slate-50/40 border-t border-slate-50 transition-all">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{delivery.state} State · {delivery.lga} LGA</span>
                      </div>

                      {/* Logistics Carrier & Dispatch Date */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 bg-white rounded-lg p-2.5 border border-slate-200/50">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider">3PL Carrier</span>
                          <span className="font-semibold text-slate-600">{delivery.carrier}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider">Dispatch Date</span>
                          <span className="font-medium text-slate-600">{delivery.dispatchDate}</span>
                        </div>
                      </div>

                      {/* Inline Quick Action Status Changer */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-100">
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Update Status</span>
                        <div className="relative min-w-[120px]">
                          <select
                            value={delivery.status}
                            onChange={(e) => handleStatusChange(delivery.sn, e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 pr-8 text-[10px] font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[34px]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Received">Received</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* FULL TABLE VIEW (RESPONSIVE IF SWAPPED TO) */
          <div className="overflow-x-auto" id="deliveries-table-wrapper">
            <table className="w-full min-w-[700px] border-collapse text-left" id="deliveries-full-table">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th onClick={() => handleToggleSort('sn')} className="py-3 px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none">
                    <div className="flex items-center gap-1">
                      <span>S/N</span>
                      <ArrowUpDown className="w-2.5 h-2.5" />
                    </div>
                  </th>
                  <th onClick={() => handleToggleSort('requestId')} className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none">
                    <div className="flex items-center gap-1">
                      <span>REQUEST ID</span>
                      <ArrowUpDown className="w-2.5 h-2.5" />
                    </div>
                  </th>
                  <th onClick={() => handleToggleSort('uhfName')} className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none">
                    <div className="flex items-center gap-1">
                      <span>UHF NAME</span>
                      <ArrowUpDown className="w-2.5 h-2.5" />
                    </div>
                  </th>
                  <th onClick={() => handleToggleSort('state')} className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none">
                    <div className="flex items-center gap-1">
                      <span>STATE</span>
                      <ArrowUpDown className="w-2.5 h-2.5" />
                    </div>
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                    LGA
                  </th>
                  <th onClick={() => handleToggleSort('status')} className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display cursor-pointer hover:text-slate-600 select-none">
                    <div className="flex items-center gap-1">
                      <span>STATUS</span>
                      <ArrowUpDown className="w-2.5 h-2.5" />
                    </div>
                  </th>
                  <th className="py-3 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedDeliveries.map((delivery) => (
                  <tr key={delivery.sn} className="bg-white hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                    <td className="py-3.5 px-3 font-semibold text-slate-400">
                      {delivery.sn}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-teal-600" style={{ width: '120px' }}>
                      {delivery.requestId}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-slate-800">
                      {delivery.uhfName}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-700">
                      {delivery.state}
                    </td>
                    <td className="py-3.5 px-2 text-slate-500">
                      {delivery.lga}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        delivery.status === 'Received'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : delivery.status === 'Approved'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : delivery.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : delivery.status === 'In Transit'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-400">
                      <button className="p-1 hover:text-slate-600 rounded transition-all cursor-pointer">
                        <MoreHorizontal className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY STATE FOR SEARCH */}
        {filteredAndSortedDeliveries.length === 0 && (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white">
            <span className="text-sm font-bold text-slate-500 font-display">No deliveries found</span>
            <span className="text-[10px] text-slate-400">Try adjusting your keyword query search filter.</span>
          </div>
        )}

        {/* PAGINATION PANEL */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-400" id="deliveries-pagination-bar">
          <span className="text-[11px] font-medium text-slate-400 font-sans">
            Showing 1 to {filteredAndSortedDeliveries.length} of {deliveries.length} results
          </span>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all select-none cursor-pointer min-h-[34px] disabled:opacity-50">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-all select-none cursor-pointer min-h-[34px]">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* NEW ALLOCATION MODAL SHEET FOR FORWARD & REVERSE LOGISTICS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 font-display uppercase tracking-wide">
                Create New Logistics Request
              </span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAddDelivery} className="p-4 flex flex-col gap-3.5 overflow-y-auto">
              
              {/* UHF Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>UHF/Facility Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Health Centre Mando"
                  value={newDelivery.uhfName}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, uhfName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>State</span>
                </label>
                <div className="relative">
                  <select
                    value={newDelivery.state}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
                  >
                    <option value="Kaduna">Kaduna</option>
                    <option value="Adamawa">Adamawa</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Bayelsa">Bayelsa</option>
                    <option value="Imo">Imo</option>
                    <option value="Ondo">Ondo</option>
                    <option value="Lagos">Lagos</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* LGA */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Local Government Area (LGA)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Igabi"
                  value={newDelivery.lga}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, lga: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* Carrier */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3PL Carrier</label>
                <div className="relative">
                  <select
                    value={newDelivery.carrier}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, carrier: e.target.value }))}
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

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Status</label>
                <div className="relative">
                  <select
                    value={newDelivery.status}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer min-h-[40px] mt-2 shadow-xs"
              >
                Submit Logistics Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
