import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  ArrowUpDown, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Database,
  Filter,
  LayoutGrid,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { StateData, KPIIndicator, StockStatus, RoleRecord } from './types';
import { 
  INITIAL_KPI_INDICATORS, 
  INITIAL_STATES_DATA, 
  getStockStatus, 
  VACCINE_INFO_MAP 
} from './data';
import { KPIGrid } from './components/KPIGrid';
import { LegendFilter } from './components/LegendFilter';
import { StateCard } from './components/StateCard';
import { StockMatrixTable } from './components/StockMatrixTable';
import { NavigationDrawer, SidebarContent } from './components/NavigationDrawer';
import { AllocationsView } from './components/AllocationsView';
import { DeliveriesView } from './components/DeliveriesView';
import { ReportsView } from './components/ReportsView';
import { NotificationsView } from './components/NotificationsView';
import { UsersView } from './components/UsersView';
import { FacilitySetupView } from './components/FacilitySetupView';
import { ColdChainStoreSetupView } from './components/ColdChainStoreSetupView';
import { RolesAndPermissionsView, INITIAL_ROLES } from './components/RolesAndPermissionsView';
import { ThreePLSetupView } from './components/ThreePLSetupView';
import OrganisationUnitSetupView from './components/OrganisationUnitSetupView';
import NSCSSetupView from './components/NSCSSetupView';
import MaximumStockView from './components/MaximumStockView';

export default function App() {
  // Navigation & Drawer state
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [isNewAllocModalOpen, setIsNewAllocModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [roles, setRoles] = useState<RoleRecord[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('state_store_officer');
  
  // Dynamic App State (so user can edit/simulate live!)
  const [states, setStates] = useState<StateData[]>(INITIAL_STATES_DATA);
  const [lastUpdated, setLastUpdated] = useState<string>('Monday, 15 June 2026 · 01:39 AM');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'doses_desc' | 'doses_asc' | 'stockouts'>('name');
  const [selectedStatuses, setSelectedStatuses] = useState<StockStatus[]>([]);
  const [onlyShowStockouts, setOnlyShowStockouts] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Expanded cards state map (e.g. {'abia': true})
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({
    abia: true // Abia expanded by default to show rich drill-down capabilities
  });

  // Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Handle accordion toggle
  const handleToggleState = (stateId: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [stateId]: !prev[stateId]
    }));
  };

  // Toggle stock status filter
  const handleToggleStatusFilter = (status: StockStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Calculate dynamic KPI metrics based on live state values
  const liveKPIIndicators = useMemo(() => {
    // 1. Total Facilities (constant for prototype)
    const totalFacilitiesVal = 1759;

    // 2. In-Full Delivery Rate
    // Let's tie this dynamically to overall status. If there are stockouts, we reduce delivery rate.
    const totalStockoutEvents = states.reduce((acc, state) => {
      return acc + (Object.values(state.vaccines) as number[]).filter(val => val === 0).length;
    }, 0);
    
    const deliveryRate = Math.max(10, Math.min(99.2, 95.8 - totalStockoutEvents * 3));
    const inFullCount = Math.round(totalFacilitiesVal * (deliveryRate / 100));

    // 3. On-Time Delivery Rate
    const onTimeRate = Math.max(45, Math.min(98.5, 93.9 + (totalStockoutEvents === 0 ? 4 : -totalStockoutEvents * 0.5)));
    const onTimeCount = Math.round(totalFacilitiesVal * (onTimeRate / 100));

    // 4. Stockout Rate
    const affectedStatesCount = states.filter(state => 
      (Object.values(state.vaccines) as number[]).some(val => val === 0)
    ).length;
    const stockoutRatePercent = ((affectedStatesCount / states.length) * 100);
    const affectedFacilities = Math.round(totalFacilitiesVal * (stockoutRatePercent / 100));

    // 5. Reorder Level Status
    // How many vaccine codes are in 'reorder' or 'below_min' status
    let reorderCandidates = 0;
    states.forEach(st => {
      Object.entries(st.vaccines).forEach(([code, val]) => {
        const { status } = getStockStatus(code, val as number);
        if (status === 'reorder' || status === 'below_min') {
          reorderCandidates++;
        }
      });
    });
    const reorderPercent = Math.min(96, Math.max(20, 42.5 + (reorderCandidates / 10)));
    const reorderCount = Math.round(totalFacilitiesVal * (reorderPercent / 100));

    // 6. CCE Functionality Rate (simulated based on state data)
    const cceRate = Math.max(70, Math.min(98.9, 87.4 + (totalStockoutEvents === 0 ? 5 : -totalStockoutEvents * 0.2)));
    const cceCount = Math.round(totalFacilitiesVal * (cceRate / 100));

    // 7. Reverse Logistics Completion
    const reverseLogRate = Math.max(15, Math.min(92, 23.4 + (totalStockoutEvents === 0 ? 15 : -totalStockoutEvents * 0.4)));
    const reverseLogCount = Math.round(totalFacilitiesVal * (reverseLogRate / 100));

    // 8. Stock Adequacy
    const adequacyRate = Math.max(30, Math.min(99.8, 93.9 + (totalStockoutEvents === 0 ? 5 : -totalStockoutEvents * 1)));
    const adequacyCount = Math.round(totalFacilitiesVal * (adequacyRate / 100));

    return INITIAL_KPI_INDICATORS.map(kpi => {
      switch (kpi.id) {
        case 'in-full-delivery':
          return {
            ...kpi,
            value: `${deliveryRate.toFixed(1)}%`,
            subtext: `${inFullCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: deliveryRate >= 95 ? 'on_target' : deliveryRate >= 80 ? 'attention' : 'critical' as any
          };
        case 'on-time-delivery':
          return {
            ...kpi,
            value: `${onTimeRate.toFixed(1)}%`,
            subtext: `${onTimeCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: onTimeRate >= 90 ? 'on_target' : onTimeRate >= 80 ? 'attention' : 'critical' as any
          };
        case 'stockout-rate':
          return {
            ...kpi,
            value: `${stockoutRatePercent.toFixed(1)}%`,
            subtext: `${affectedFacilities.toLocaleString()} of ${totalFacilitiesVal}`,
            status: stockoutRatePercent < 5 ? 'on_target' : stockoutRatePercent < 20 ? 'attention' : 'critical' as any
          };
        case 'reorder-level-status':
          return {
            ...kpi,
            value: `${reorderPercent.toFixed(1)}%`,
            subtext: `${reorderCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: reorderPercent < 50 ? 'on_target' : reorderPercent < 75 ? 'attention' : 'critical' as any
          };
        case 'cce-functionality':
          return {
            ...kpi,
            value: `${cceRate.toFixed(1)}%`,
            subtext: `${cceCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: cceRate >= 95 ? 'on_target' : cceRate >= 85 ? 'attention' : 'critical' as any
          };
        case 'reverse-logistics':
          return {
            ...kpi,
            value: `${reverseLogRate.toFixed(1)}%`,
            subtext: `${reverseLogCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: reverseLogRate >= 90 ? 'on_target' : reverseLogRate >= 50 ? 'attention' : 'critical' as any
          };
        case 'stock-adequacy':
          return {
            ...kpi,
            value: `${adequacyRate.toFixed(1)}%`,
            subtext: `${adequacyCount.toLocaleString()} of ${totalFacilitiesVal}`,
            status: adequacyRate >= 90 ? 'on_target' : adequacyRate >= 80 ? 'attention' : 'critical' as any
          };
        default:
          return kpi;
      }
    });
  }, [states]);

  // Count total stockouts across all states
  const totalStockoutsCount = useMemo(() => {
    return states.reduce((sum, state) => {
      const stateStockouts = Object.values(state.vaccines).filter(val => val === 0).length;
      return sum + stateStockouts;
    }, 0);
  }, [states]);

  // Filter & Sort States List
  const filteredAndSortedStates = useMemo(() => {
    let result = [...states];

    // 1. Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(st => st.name.toLowerCase().includes(query));
    }

    // 2. Filter by stock status pills (active status filters)
    if (selectedStatuses.length > 0) {
      result = result.filter(st => {
        return Object.entries(st.vaccines).some(([code, val]) => {
          const { status } = getStockStatus(code, val as number);
          return selectedStatuses.includes(status);
        });
      });
    }

    // 3. Filter "Only Stockouts"
    if (onlyShowStockouts) {
      result = result.filter(st => {
        return (Object.values(st.vaccines) as number[]).some(val => val === 0);
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      const totalA = (Object.values(a.vaccines) as number[]).reduce((sum, val) => sum + val, 0);
      const totalB = (Object.values(b.vaccines) as number[]).reduce((sum, val) => sum + val, 0);
      const stockoutsA = (Object.values(a.vaccines) as number[]).filter(val => val === 0).length;
      const stockoutsB = (Object.values(b.vaccines) as number[]).filter(val => val === 0).length;

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'doses_desc':
          return totalB - totalA;
        case 'doses_asc':
          return totalA - totalB;
        case 'stockouts':
          return stockoutsB - stockoutsA;
        default:
          return 0;
      }
    });

    return result;
  }, [states, searchQuery, sortBy, selectedStatuses, onlyShowStockouts]);

  // Simulation handlers
  const handleReplenishAll = () => {
    // Set all 0 stock values to a healthy level
    const replenished = states.map(st => {
      const updatedVaccines = { ...st.vaccines };
      Object.keys(updatedVaccines).forEach(code => {
        if (updatedVaccines[code] === 0) {
          // Replenish with healthy dosage
          updatedVaccines[code] = Math.round(VACCINE_INFO_MAP[code].targetMin * 0.7);
        }
      });
      return { ...st, vaccines: updatedVaccines };
    });
    setStates(replenished);
    updateLastUpdatedTime();
    setIsSimulatorOpen(false);
  };

  const handleSimulateEmergency = () => {
    // Introduce random stockouts in Lagos, Kaduna, Rivers, and Borno
    const targetStates = ['lagos', 'kaduna', 'rivers', 'borno'];
    const modified = states.map(st => {
      if (targetStates.includes(st.id)) {
        const updatedVaccines = { ...st.vaccines };
        // Force HPV and MR to 0
        updatedVaccines['HPV'] = 0;
        updatedVaccines['MR'] = 0;
        return { ...st, vaccines: updatedVaccines };
      }
      return st;
    });
    setStates(modified);
    updateLastUpdatedTime();
    setIsSimulatorOpen(false);
  };

  const updateLastUpdatedTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    setLastUpdated(`${dateString} · ${timeString}`);
  };

  const handleResetData = () => {
    setStates(INITIAL_STATES_DATA);
    updateLastUpdatedTime();
    setIsSimulatorOpen(false);
  };

  const handleIncrementStock = (stateId: string, vaccineCode: string) => {
    setStates(prev => prev.map(st => {
      if (st.id === stateId) {
        return {
          ...st,
          vaccines: {
            ...st.vaccines,
            [vaccineCode]: st.vaccines[vaccineCode] + 5000
          }
        };
      }
      return st;
    }));
    updateLastUpdatedTime();
  };

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  return (
    <div className="min-h-[100dvh] flex bg-slate-50 font-sans text-slate-800" id="main-app-container">
      {/* PERSISTENT DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-[280px] shrink-0 bg-brand-teal-900 text-white flex-col h-screen sticky top-0 border-r border-brand-teal-800/40">
        <SidebarContent activeItem={activeNavItem} onSelectItem={setActiveNavItem} />
      </aside>

      {/* WORKSPACE WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* HEADER / NAVIGATION BAR: Responsive header with 44px minimum target triggers */}
        <header className="sticky top-0 bg-brand-teal-900 text-white z-30 shadow-md px-4 py-3 flex items-center justify-between min-h-[56px] md:hidden" id="app-header">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Trigger: 44px min target */}
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-brand-teal-800 text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus:ring-2 focus:ring-brand-teal-400"
            aria-label="Open sidebar drawer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold font-display text-2xl tracking-tight text-white leading-none">
                Vaxtrack
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono ml-1">
                ADMIN
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers / Interactive Simulator Button */}
        <div className="flex items-center gap-2">
          {/* User circle profile button */}
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold font-display text-white shrink-0 border border-emerald-500/10 shadow-xs text-xs">
            AO
          </div>
        </div>
      </header>

      {/* SUB HEADER: Title and real-time refresh controls */}
      {activeNavItem === 'allocations' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight" id="allocations-page-title">
              Allocations
            </h1>
            <button
              onClick={() => setIsNewAllocModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
              id="header-create-allocation-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Allocation</span>
            </button>
          </div>
        </section>
      ) : activeNavItem === 'deliveries' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                Deliveries
              </h1>

            </div>
            <button
              onClick={() => {
                updateLastUpdatedTime();
              }}
              className="p-2 text-slate-400 hover:text-brand-teal-600 rounded-full hover:bg-slate-50 transition-colors select-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh Deliveries"
              aria-label="Refresh deliveries"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : activeNavItem === 'reports' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                Reports
              </h1>

            </div>
            <button
              onClick={() => {
                updateLastUpdatedTime();
              }}
              className="p-2 text-slate-400 hover:text-brand-teal-600 rounded-full hover:bg-slate-50 transition-colors select-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh Reports"
              aria-label="Refresh reports"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : activeNavItem === 'notifications' ? (
        null
      ) : activeNavItem === 'users' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                User Management
              </h1>
              
            </div>
            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
              id="header-add-user-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </section>
      ) : activeNavItem === 'ehf-uhf' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                EHF & UHF Setup
              </h1>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs select-none cursor-pointer min-h-[36px]"
              id="header-add-facility-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Facility</span>
            </button>
          </div>
        </section>
      ) : activeNavItem === 'lcs-scs' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                Cold Chain Store Setup
              </h1>
              

            </div>
          </div>
        </section>
      ) : activeNavItem === 'roles' ? (
        <section className="bg-white border-b border-slate-100 px-4 py-3 flex flex-col gap-1" id="sub-header-section">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobileDetailOpen && (
                <button
                  onClick={() => setIsMobileDetailOpen(false)}
                  className="flex items-center gap-1.5 text-xs text-brand-teal-600 font-bold hover:text-brand-teal-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
              <div className="flex flex-col">
                <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                  Roles & Permissions
                </h1>
              </div>
            </div>
            
            <div className="flex items-center ml-auto">
            </div>
          </div>
        </section>
      ) : activeNavItem === '3pl' || activeNavItem === 'org-unit' || activeNavItem === 'nscs' || activeNavItem === 'max-stock' ? (
        null
      ) : (
        <section className="bg-white border-b border-slate-100 px-4 py-3.5 flex flex-col gap-1.5" id="sub-header-section">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
              National Dashboard
            </h1>
            <button
              onClick={() => {
                updateLastUpdatedTime();
                // Briefly shuffle states to show loading/refresh effect!
                setStates(prev => [...prev].sort(() => Math.random() - 0.5));
                setTimeout(() => {
                  setStates(INITIAL_STATES_DATA);
                }, 150);
              }}
              className="p-2 text-slate-400 hover:text-brand-teal-600 rounded-full hover:bg-slate-50 transition-colors select-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh Stock Data"
              aria-label="Refresh stock data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* CORE WORKSPACE / CONTENT SCROLL VIEW */}
      <main className={`flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 mx-auto w-full ${
        activeNavItem === 'notifications' || activeNavItem === 'users' || activeNavItem === 'ehf-uhf' || activeNavItem === 'lcs-scs' || activeNavItem === 'roles' || activeNavItem === '3pl' || activeNavItem === 'org-unit' || activeNavItem === 'nscs' || activeNavItem === 'max-stock' ? 'max-w-5xl' : 'max-w-lg'
      }`} id="scrollable-content">
        {activeNavItem === 'allocations' ? (
          <AllocationsView isNewAllocModalOpen={isNewAllocModalOpen} setIsNewAllocModalOpen={setIsNewAllocModalOpen} />
        ) : activeNavItem === 'deliveries' ? (
          <DeliveriesView />
        ) : activeNavItem === 'reports' ? (
          <ReportsView />
        ) : activeNavItem === 'notifications' ? (
          <NotificationsView />
        ) : activeNavItem === 'users' ? (
          <UsersView isNewUserModalOpen={isNewUserModalOpen} setIsNewUserModalOpen={setIsNewUserModalOpen} />
        ) : activeNavItem === 'ehf-uhf' ? (
          <FacilitySetupView />
        ) : activeNavItem === 'lcs-scs' ? (
          <ColdChainStoreSetupView />
        ) : activeNavItem === '3pl' ? (
          <ThreePLSetupView />
        ) : activeNavItem === 'org-unit' ? (
          <OrganisationUnitSetupView />
        ) : activeNavItem === 'nscs' ? (
          <NSCSSetupView />
        ) : activeNavItem === 'max-stock' ? (
          <MaximumStockView />
        ) : activeNavItem === 'roles' ? (
          <RolesAndPermissionsView 
            isMobileDetailOpen={isMobileDetailOpen} 
            setIsMobileDetailOpen={setIsMobileDetailOpen} 
            roles={roles}
            setRoles={setRoles}
            selectedRoleId={selectedRoleId}
            setSelectedRoleId={setSelectedRoleId}
          />
        ) : (
          <>
            {/* SECTION 1: KEY PERFORMANCE INDICATORS (2-column x 4-row Grid as Instructed) */}
            <section className="flex flex-col gap-2" id="kpi-section">
          <div className="flex items-center px-1">
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider font-display uppercase">
              KEY PERFORMANCE INDICATORS
            </span>
          </div>
          
          <KPIGrid 
            indicators={liveKPIIndicators} 
            onCardClick={(id) => {
              setActiveKpiFilter(activeKpiFilter === id ? null : id);
              // Filter logic mapping based on KPI clicks
              if (id === 'stockout-rate') {
                setOnlyShowStockouts(!onlyShowStockouts);
              } else {
                setOnlyShowStockouts(false);
              }
            }}
            activeCardId={activeKpiFilter}
          />
        </section>

        {/* SECTION 2: VACCINE STOCK STATUS LEGEND (Interactive Filter) */}
        <section id="legend-section">
          <LegendFilter 
            selectedStatuses={selectedStatuses}
            onToggleStatus={handleToggleStatusFilter}
            stockoutCount={totalStockoutsCount}
          />
        </section>

        {/* SECTION 3: REFLOWED LIST OF STATE CARDS */}
        <section className="flex flex-col gap-3" id="states-stock-section">
          
          {/* Header Controls */}
          <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between relative">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 font-display">
                  Regional Stock Levels
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {filteredAndSortedStates.length} states shown • {totalStockoutsCount} alerts
                </span>
              </div>

              {/* Filter & Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer min-h-[40px] min-w-[40px] ${
                    isSortDropdownOpen
                      ? 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  aria-label="Toggle Sort & Filter options"
                  aria-expanded={isSortDropdownOpen}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <>
                      {/* Invisible backdrop to dismiss dropdown on outer tap */}
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsSortDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-40"
                      >
                        <div className="px-3 py-1.5 border-b border-slate-50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display">
                            Sort & Filter States
                          </span>
                        </div>

                        {/* Dropdown Options */}
                        <div className="flex flex-col py-1">
                          {/* States / Reset Option */}
                          <button
                            onClick={() => {
                              setSortBy('name');
                              setOnlyShowStockouts(false);
                              setSelectedStatuses([]);
                              setSearchQuery('');
                              setIsSortDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer w-full text-slate-700"
                          >
                            <span>All States</span>
                            {sortBy === 'name' && !onlyShowStockouts && selectedStatuses.length === 0 && searchQuery === '' && (
                              <Check className="w-3.5 h-3.5 text-brand-teal-600 shrink-0" />
                            )}
                          </button>

                          {/* Alphabetical Sort */}
                          <button
                            onClick={() => {
                              setSortBy('name');
                              setIsSortDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer w-full text-slate-700"
                          >
                            <span>Alphabetical</span>
                            {sortBy === 'name' && (
                              <Check className="w-3.5 h-3.5 text-brand-teal-600 shrink-0" />
                            )}
                          </button>

                          {/* Max Stock Sort */}
                          <button
                            onClick={() => {
                              setSortBy('doses_desc');
                              setIsSortDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer w-full text-slate-700"
                          >
                            <span>Max Stock</span>
                            {sortBy === 'doses_desc' && (
                              <Check className="w-3.5 h-3.5 text-brand-teal-600 shrink-0" />
                            )}
                          </button>

                          {/* Stockouts Sort */}
                          <button
                            onClick={() => {
                              setSortBy('stockouts');
                              setIsSortDropdownOpen(false);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer w-full text-slate-700"
                          >
                            <span>Stockouts</span>
                            {sortBy === 'stockouts' && (
                              <Check className="w-3.5 h-3.5 text-brand-teal-600 shrink-0" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search states (e.g. Abia, Borno)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-brand-teal-500 focus:bg-white text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all min-h-[44px]"
                id="state-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 font-bold select-none cursor-pointer p-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Dedicated View Switcher Component Block */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-2xs select-none" id="view-mode-toggle-container">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40 w-full">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer min-h-[30px] flex items-center justify-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Show Summary Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer min-h-[30px] flex items-center justify-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Show Detailed Spreadsheet Matrix View"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Spreadsheet</span>
              </button>
            </div>
          </div>

          {/* Cards List or Spreadsheet matrix as selected by viewMode */}
          {viewMode === 'matrix' ? (
            <div id="state-matrix-view">
              {filteredAndSortedStates.length > 0 ? (
                <StockMatrixTable states={filteredAndSortedStates} searchQuery={searchQuery} />
              ) : (
                <div
                  className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3"
                  id="no-results-matrix"
                >
                  <AlertTriangle className="w-8 h-8 text-slate-300 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-slate-600 font-display">No matching states found</span>
                    <p className="text-xs text-slate-400">
                      Try adjusting search text or resetting the active status filters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatuses([]);
                      setOnlyShowStockouts(false);
                      setSortBy('name');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer min-h-[40px] mt-2"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5" id="state-cards-list">
              <AnimatePresence initial={false}>
                {filteredAndSortedStates.length > 0 ? (
                  filteredAndSortedStates.map((state) => (
                    <motion.div
                      key={state.id}
                      layoutId={`state-layout-${state.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 120 }}
                    >
                      <StateCard
                        state={state}
                        isExpanded={!!expandedStates[state.id]}
                        onToggle={() => handleToggleState(state.id)}
                        highlightedStatuses={selectedStatuses}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3"
                    id="no-results"
                  >
                    <AlertTriangle className="w-8 h-8 text-slate-300 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-600 font-display">No matching states found</span>
                      <p className="text-xs text-slate-400">
                        Try adjusting search text or resetting the active status filters.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedStatuses([]);
                        setOnlyShowStockouts(false);
                        setSortBy('name');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer min-h-[40px] mt-2"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
          </>
        )}
      </main>
    </div>



      {/* NAVIGATION DRAWER */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        activeItem={activeNavItem}
        onSelectItem={setActiveNavItem}
      />

      {/* INTERACTIVE SCENARIO SIMULATOR DRAWER (MODAL) */}
      <AnimatePresence>
        {isSimulatorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSimulatorOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 select-none cursor-pointer"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-2xl z-50 shadow-2xl p-4 flex flex-col gap-4 border-t border-slate-100"
              id="simulator-modal"
            >
              {/* Drag indicator bar */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="font-bold text-sm text-slate-800 font-display uppercase tracking-wide">
                    Scenario Simulator Control Panel
                  </span>
                </div>
                <button
                  onClick={() => setIsSimulatorOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                As a <strong>Senior Frontend Engineer</strong>, this interactive panel demonstrates dynamic React state management. Select a physical logistics scenario below to watch the 8 metrics in the KPI Grid and the state cards recalculate instantaneously.
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                
                {/* Scenario 1: Replenish All */}
                <button
                  onClick={handleReplenishAll}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-left cursor-pointer transition-all min-h-[52px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 font-bold">
                    🛩️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-800">
                      Scenario A: Deliver Stock Emergency Flight
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Replenish all zero stock levels to healthy levels immediately.
                    </span>
                  </div>
                </button>

                {/* Scenario 2: Simulate Emergency Stockouts */}
                <button
                  onClick={handleSimulateEmergency}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/70 text-left cursor-pointer transition-all min-h-[52px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shrink-0 font-bold">
                    ⚠️
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-red-800">
                      Scenario B: Trigger Systemic Stockout Alert
                    </span>
                    <span className="text-[10px] text-red-600 font-medium">
                      Simulate massive supply chain disruption (empties HPV & MR).
                    </span>
                  </div>
                </button>

                {/* Scenario 3: Reset Data */}
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition-all min-h-[52px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center text-white shrink-0 font-bold">
                    🔄
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Scenario C: Reset Original Dataset
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Restore default inventory levels as shown on National Dashboard.jpg.
                    </span>
                  </div>
                </button>

              </div>

              {/* Quick Individual State Bumpers */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider font-display uppercase">
                  Quick Injector (Abia State)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleIncrementStock('abia', 'BCG')}
                    className="bg-brand-teal-50 hover:bg-brand-teal-100 text-brand-teal-800 border border-brand-teal-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer min-h-[44px]"
                  >
                    +5,000 BCG (Abia)
                  </button>
                  <button
                    onClick={() => handleIncrementStock('abia', 'HPV')}
                    className="bg-brand-teal-50 hover:bg-brand-teal-100 text-brand-teal-800 border border-brand-teal-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer min-h-[44px]"
                  >
                    +5,000 HPV (Abia)
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
