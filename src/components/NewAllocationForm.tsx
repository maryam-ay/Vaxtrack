import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, MapPin, Building, AlertCircle, Info, ChevronDown } from 'lucide-react';
import { INITIAL_STATES_DATA } from '../data';

interface NewAllocationFormProps {
  onClose: () => void;
  onSave: (newAlloc: {
    uhfName: string;
    state: string;
    lga: string;
    carrier: string;
    dispatchDate: string;
    status: 'Pending' | 'Approved' | 'Dispatched' | 'In Transit' | 'Received';
  }) => void;
}

const VACCINES_LIST = [
  'BCG',
  'Measles & Rubella',
  'Yellow Fever',
  'Malaria',
  'MenA',
  'Rota',
  'HPV',
  'HepB',
  'bOPV',
  'Penta',
  'IPV',
  'PCV',
  'TD'
];

interface VaccineQuantities {
  vaccineQty: string;
  diluentQty: string;
  syringe005Qty: string;
  syringe2Qty: string;
  reverseVaccineQty: string;
  reverseDiluentQty: string;
  reverseSyringeQty: string;
  isSaved: boolean;
}

export function NewAllocationForm({ onClose, onSave }: NewAllocationFormProps) {
  // Step 1 states
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [selectedEhf, setSelectedEhf] = useState('');
  const [selectedUhf, setSelectedUhf] = useState('');

  // Step 2 states
  const [activeVaccineIdx, setActiveVaccineIdx] = useState(0);
  
  // Storage for all 13 vaccines
  const [vaccineData, setVaccineData] = useState<Record<string, VaccineQuantities>>(
    VACCINES_LIST.reduce((acc, vaccine) => {
      acc[vaccine] = {
        vaccineQty: '',
        diluentQty: '',
        syringe005Qty: '',
        syringe2Qty: '',
        reverseVaccineQty: '',
        reverseDiluentQty: '',
        reverseSyringeQty: '',
        isSaved: false
      };
      return acc;
    }, {} as Record<string, VaccineQuantities>)
  );

  const activeVaccine = VACCINES_LIST[activeVaccineIdx];
  const activeVaccineData = vaccineData[activeVaccine];

  // Helper lists from static data
  const statesList = useMemo(() => {
    return INITIAL_STATES_DATA.map(st => st.name).sort();
  }, []);

  const lgasList = useMemo(() => {
    if (!selectedState) return [];
    const stateObj = INITIAL_STATES_DATA.find(st => st.name.toLowerCase() === selectedState.toLowerCase());
    if (!stateObj || !stateObj.lgas) return [];
    return stateObj.lgas.map(lga => lga.name).sort();
  }, [selectedState]);

  const ehfsList = useMemo(() => {
    if (!selectedLga) return [];
    return [
      `General Hospital ${selectedLga}`,
      `Equipped Facility ${selectedLga} Alpha`,
      `Comprehensive Health Centre ${selectedLga}`
    ];
  }, [selectedLga]);

  const uhfsList = useMemo(() => {
    if (!selectedLga) return [];
    return [
      `PHC ${selectedLga} Town`,
      `PHC ${selectedLga} North`,
      `PHC ${selectedLga} Rural`,
      `Model Clinic ${selectedLga}`
    ];
  }, [selectedLga]);

  // Handle Vaccine Qty Change & Auto-Calculate Diluents/Syringes
  const handleVaccineQtyChange = (val: string) => {
    const num = parseInt(val) || 0;
    let diluent = '';
    let s005 = '';
    let s2 = '';

    if (num > 0) {
      // Auto calculation rules matching medical inventory guidelines
      if (activeVaccine === 'BCG') {
        diluent = String(Math.ceil(num / 20));
        s005 = String(num);
        s2 = String(Math.ceil(num / 20));
      } else if (activeVaccine === 'Measles & Rubella' || activeVaccine === 'Yellow Fever') {
        diluent = String(Math.ceil(num / 10));
        s005 = String(num);
        s2 = String(Math.ceil(num / 10));
      } else if (activeVaccine === 'Rota') {
        diluent = '0'; // oral vaccine
        s005 = '0';
        s2 = '0';
      } else {
        diluent = '0';
        s005 = String(num);
        s2 = String(Math.ceil(num / 10));
      }
    }

    setVaccineData(prev => ({
      ...prev,
      [activeVaccine]: {
        ...prev[activeVaccine],
        vaccineQty: val,
        diluentQty: val ? diluent : '',
        syringe005Qty: val ? s005 : '',
        syringe2Qty: val ? s2 : '',
        isSaved: num > 0
      }
    }));
  };

  const handleFieldChange = (field: keyof VaccineQuantities, value: string) => {
    setVaccineData(prev => ({
      ...prev,
      [activeVaccine]: {
        ...prev[activeVaccine],
        [field]: value
      }
    }));
  };

  // Navigate between 13 vaccines
  const handlePrevVaccine = () => {
    if (activeVaccineIdx > 0) {
      setActiveVaccineIdx(prev => prev - 1);
    }
  };

  const handleNextVaccine = () => {
    if (activeVaccineIdx < VACCINES_LIST.length - 1) {
      setActiveVaccineIdx(prev => prev + 1);
    }
  };

  // Submit allocation
  const handleSubmit = () => {
    if (!selectedState || !selectedEhf) {
      alert('Please fill out all required fields in Step 1 (State & Equipped Health Facility)');
      return;
    }

    // Save/Save trigger simulation
    onSave({
      uhfName: selectedUhf || selectedEhf || 'Unnamed Health Facility',
      state: selectedState,
      lga: selectedLga || 'General LGA',
      carrier: 'DHL Supply Chain',
      dispatchDate: 'Jul 01, 2026',
      status: 'Pending'
    });
  };

  const hasForwardEntry = activeVaccineData.vaccineQty && parseInt(activeVaccineData.vaccineQty) > 0;

  return (
    <div className="flex flex-col gap-5" id="new-allocation-form-container">
      
      {/* BREADCRUMBS & HEADER BLOCK */}
      <div className="flex flex-col gap-1 select-none">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-sans">
          <span className="hover:text-slate-600 cursor-pointer" onClick={onClose}>Forward & Reverse Logistics</span>
          <span>&gt;</span>
          <span className="text-brand-teal-600">New Allocation</span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
            New Allocation
          </h1>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onClose}
              className="p-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: HEALTH FACILITY */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-3xs flex flex-col gap-3" id="step-1-card">
        <span className="text-[10px] font-extrabold text-brand-teal-600 tracking-wider font-display uppercase">
          STEP 1 · HEALTH FACILITY
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1" id="step-1-inputs-grid">
          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              <span>State</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLga('');
                  setSelectedEhf('');
                  setSelectedUhf('');
                }}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
              >
                <option value="">— Select State —</option>
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* LGA */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LGA</label>
            <div className="relative">
              <select
                value={selectedLga}
                disabled={!selectedState}
                onChange={(e) => {
                  setSelectedLga(e.target.value);
                  setSelectedEhf('');
                  setSelectedUhf('');
                }}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                <option value="">— Select LGA first —</option>
                {lgasList.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Equipped Health Facility */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              <span>Equipped Health Facility (EHF)</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedEhf}
                disabled={!selectedLga}
                onChange={(e) => setSelectedEhf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                <option value="">— Select EHF —</option>
                {ehfsList.map(ehf => (
                  <option key={ehf} value={ehf}>{ehf}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* UHF */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">UHF</label>
            <div className="relative">
              <select
                value={selectedUhf}
                disabled={!selectedLga}
                onChange={(e) => setSelectedUhf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                <option value="">— Select UHF —</option>
                {uhfsList.map(uhf => (
                  <option key={uhf} value={uhf}>{uhf}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: ENTER VACCINE QUANTITIES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col overflow-hidden" id="step-2-card">
        
        {/* Step Header */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <span className="text-[10px] font-extrabold text-brand-teal-600 tracking-wider font-display uppercase">
            STEP 2 · ENTER VACCINE QUANTITIES
          </span>
        </div>

        {/* Outer Split Layout */}
        <div className="flex flex-col md:flex-row min-h-[380px]" id="step-2-body-layout">
          
          {/* Side Menu (Mobile Swipe-Bar, Desktop Vertical List) */}
          <div className="w-full md:w-48 bg-slate-50 border-r border-slate-100 flex flex-col select-none shrink-0" id="vaccines-side-list">
            
            {/* Header label */}
            <div className="bg-teal-700 text-white text-[9px] uppercase tracking-wider font-extrabold px-3.5 py-2.5 hidden md:block">
              VACCINES
            </div>

            {/* List scroll wrapper */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto divide-x md:divide-x-0 md:divide-y divide-slate-200/60 scrollbar-none scroll-smooth">
              {VACCINES_LIST.map((vaccine, idx) => {
                const isActive = activeVaccineIdx === idx;
                const hasInput = vaccineData[vaccine].vaccineQty && parseInt(vaccineData[vaccine].vaccineQty) > 0;
                
                return (
                  <button
                    key={vaccine}
                    type="button"
                    onClick={() => setActiveVaccineIdx(idx)}
                    className={`px-3.5 py-2.5 text-[11px] font-bold text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 shrink-0 min-w-[110px] md:min-w-0 ${
                      isActive 
                        ? 'bg-white text-brand-teal-700 md:border-l-4 md:border-l-brand-teal-600 shadow-3xs md:shadow-none font-extrabold' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <span>{vaccine}</span>
                    {hasInput && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 border border-emerald-600" title="Values filled">
                        <Check className="w-1.5 h-1.5 stroke-[4]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content Panel */}
          <div className="flex-1 p-4 flex flex-col gap-4 bg-white" id="vaccine-form-panel">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                {activeVaccine}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                {activeVaccineIdx + 1} of {VACCINES_LIST.length}
              </span>
            </div>

            {/* FORWARD LOGISTICS CARD */}
            <div className="border border-teal-200/80 rounded-xl overflow-hidden shadow-3xs flex flex-col" id="forward-logistics-card">
              <div className="bg-teal-700 text-white px-3 py-2 text-[10px] font-bold rounded-t-xl flex justify-between items-center select-none">
                <span className="uppercase tracking-wider">Forward Logistics</span>
                <span className="text-[9px] opacity-90 font-medium">Allocated by EHF — filled by Conveyor</span>
              </div>

              <div className="p-3.5 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Main Vaccine Qty */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{activeVaccine} Vaccine</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Divisible by 20"
                    value={activeVaccineData.vaccineQty}
                    onChange={(e) => handleVaccineQtyChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Diluent (auto) */}
                <div className="flex flex-col gap-1 opacity-90">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Diluent <span className="text-[8px] text-brand-teal-600 font-semibold">(auto)</span></label>
                  <input
                    type="text"
                    disabled
                    placeholder="Auto-calculated"
                    value={activeVaccineData.diluentQty ? `${activeVaccineData.diluentQty} vials` : ''}
                    className="w-full bg-slate-100/80 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* 0.05ml Syringe (auto) */}
                <div className="flex flex-col gap-1 opacity-90">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">0.05ml Syringe <span className="text-[8px] text-brand-teal-600 font-semibold">(auto)</span></label>
                  <input
                    type="text"
                    disabled
                    placeholder="Auto-calculated"
                    value={activeVaccineData.syringe005Qty ? `${activeVaccineData.syringe005Qty} pcs` : ''}
                    className="w-full bg-slate-100/80 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* 2ml Syringe (auto) */}
                <div className="flex flex-col gap-1 opacity-90">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">2ml Syringe <span className="text-[8px] text-brand-teal-600 font-semibold">(auto)</span></label>
                  <input
                    type="text"
                    disabled
                    placeholder="Auto-calculated"
                    value={activeVaccineData.syringe2Qty ? `${activeVaccineData.syringe2Qty} pcs` : ''}
                    className="w-full bg-slate-100/80 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* REVERSE LOGISTICS CARD */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col" id="reverse-logistics-card">
              <div className="bg-slate-100 text-slate-600 px-3 py-1.5 text-[10px] font-bold flex justify-between items-center border-b border-slate-200 select-none">
                <span className="uppercase tracking-wider">Reverse Logistics</span>
                {!hasForwardEntry && (
                  <span className="text-[9px] text-slate-400 font-medium">Unlocks after forward logistics is submitted</span>
                )}
              </div>

              {hasForwardEntry ? (
                <div className="p-3.5 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Returned Vaccine Qty</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={activeVaccineData.reverseVaccineQty}
                      onChange={(e) => handleFieldChange('reverseVaccineQty', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Returned Diluent</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={activeVaccineData.reverseDiluentQty}
                      onChange={(e) => handleFieldChange('reverseDiluentQty', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Returned Syringes</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={activeVaccineData.reverseSyringeQty}
                      onChange={(e) => handleFieldChange('reverseSyringeQty', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1 bg-slate-50/30 border-dashed border-2 border-slate-100 rounded-b-xl select-none">
                  <AlertCircle className="w-5 h-5 text-slate-300" />
                  <span className="text-[11px] font-bold text-slate-400 mt-1">Submit forward logistics first to enable reverse entry.</span>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevVaccine}
                disabled={activeVaccineIdx === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextVaccine}
                disabled={activeVaccineIdx === VACCINES_LIST.length - 1}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FINAL FORM SUMBIT BLOCK */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs" id="new-allocation-submit-card">
        <div className="flex items-start gap-2 max-w-md">
          <Info className="w-4 h-4 text-brand-teal-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-500 font-medium">
            Review your allocation quantities for each of the vaccines before finalizing. Submitting will register this logistics batch as a new <b>Pending</b> request.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer select-none text-center"
        >
          Submit Allocation
        </button>
      </div>

    </div>
  );
}
