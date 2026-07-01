import { useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  MapPin, 
  X, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Thermometer, 
  PackageX, 
  ShieldAlert, 
  CornerDownRight, 
  ChevronRight, 
  ChevronDown,
  Info,
  Calendar
} from 'lucide-react';

interface AlertDetail {
  fridgeName?: string;
  safeRange?: string;
  exceededBy?: string;
  duration?: string;
  triggeredAt: string;
  currentReading?: string;
}

interface DoseRisk {
  vaccine: string;
  quantity: number;
  batch: string;
  expiry: string;
}

interface LogEntry {
  id: string;
  status: string;
  time: string;
  isAutomated?: boolean;
}

interface NotificationItem {
  id: string;
  type: 'temperature' | 'stockout';
  severity: 'critical' | 'warning' | 'resolved';
  state: string;
  lga?: string;
  facility?: string;
  timeAgo: string;
  title: string;
  description: string;
  isAcknowledged: boolean;
  isResolved: boolean;
  alertDetails: AlertDetail;
  dosesAtRisk: DoseRisk[];
  activityLog: LogEntry[];
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ALERT-001',
    type: 'temperature',
    severity: 'critical',
    state: 'Borno',
    lga: 'Maiduguri',
    timeAgo: '14 minutes ago',
    title: 'Fridge #3 temperature excursion — Borno State',
    description: 'Fridge reached 12°C. 1,240 doses of OPV and PCV at risk. Maiduguri Cold Store.',
    isAcknowledged: false,
    isResolved: false,
    alertDetails: {
      fridgeName: 'ILR #3 — Maiduguri Cold Store',
      safeRange: '2–8°C',
      exceededBy: '+4°C',
      duration: '3 hours 22 minutes',
      triggeredAt: 'Today at 11:43 AM',
      currentReading: '12°C'
    },
    dosesAtRisk: [
      { vaccine: 'OPV', quantity: 840, batch: 'BCH-2024-441', expiry: 'Aug 2026' },
      { vaccine: 'PCV', quantity: 400, batch: 'PCH-2025-112', expiry: 'Nov 2026' }
    ],
    activityLog: [
      { id: 'l1', status: 'Alert triggered', time: '11:43 AM', isAutomated: true },
      { id: 'l2', status: 'Notification sent to Emeka Nwosu (SCS)', time: '11:43 AM' },
      { id: 'l3', status: 'Notification sent to National Officer', time: '11:43 AM' },
      { id: 'l4', status: 'Awaiting acknowledgement...', time: '11:43 AM' }
    ]
  },
  {
    id: 'ALERT-002',
    type: 'stockout',
    severity: 'critical',
    state: 'Rivers',
    lga: 'Port Harcourt',
    timeAgo: '1 hour ago',
    title: 'Complete OPV stockout — Port Harcourt LGA, Rivers',
    description: '4 health facilities report zero OPV stock. Last resupply 18 days ago.',
    isAcknowledged: false,
    isResolved: false,
    alertDetails: {
      safeRange: 'Min stock level: 500 doses',
      exceededBy: '0 doses in stock',
      duration: '18 days since last supply',
      triggeredAt: 'Today at 10:30 AM',
      currentReading: '0 doses'
    },
    dosesAtRisk: [],
    activityLog: [
      { id: 'l1', status: 'Alert triggered', time: '10:30 AM', isAutomated: true },
      { id: 'l2', status: 'Notification sent to LGA Cold Chain Officer', time: '10:30 AM' },
      { id: 'l3', status: 'Awaiting acknowledgement...', time: '10:30 AM' }
    ]
  },
  {
    id: 'ALERT-003',
    type: 'stockout',
    severity: 'critical',
    state: 'Yobe',
    lga: 'Damaturu',
    timeAgo: '2 hours ago',
    title: 'BCG & MR stockout at Yobe state store',
    description: 'State store completely empty for 2 vaccines. 63 downstream facilities affected.',
    isAcknowledged: false,
    isResolved: false,
    alertDetails: {
      safeRange: 'Min stock: 15,000 doses',
      exceededBy: '0 doses',
      duration: '2 days since depletion',
      triggeredAt: 'Today at 09:15 AM',
      currentReading: '0 BCG, 0 MR'
    },
    dosesAtRisk: [],
    activityLog: [
      { id: 'l1', status: 'Alert triggered', time: '09:15 AM', isAutomated: true },
      { id: 'l2', status: 'Sent notification to State Logistics Officer', time: '09:16 AM' },
      { id: 'l3', status: 'Awaiting acknowledgement...', time: '09:16 AM' }
    ]
  },
  {
    id: 'ALERT-004',
    type: 'stockout',
    severity: 'warning',
    state: 'Kaduna',
    lga: 'Chikun',
    timeAgo: '3 hours ago',
    title: 'Low stock alert — Rota vaccine in Kaduna',
    description: 'Kaduna State Store vaccine levels are at 12% of minimum safety stock.',
    isAcknowledged: false,
    isResolved: false,
    alertDetails: {
      safeRange: 'Min stock: 10,000 doses',
      exceededBy: 'Approaching critical threshold',
      duration: 'N/A',
      triggeredAt: 'Today at 08:30 AM',
      currentReading: '1,200 doses'
    },
    dosesAtRisk: [],
    activityLog: [
      { id: 'l1', status: 'Warning threshold reached', time: '08:30 AM', isAutomated: true },
      { id: 'l2', status: 'Auto-reorder suggestion generated', time: '08:31 AM' }
    ]
  },
  {
    id: 'ALERT-005',
    type: 'temperature',
    severity: 'warning',
    state: 'Kano',
    lga: 'Nassarawa',
    timeAgo: '5 hours ago',
    title: 'Minor temperature rise — Kano Cold Room',
    description: 'Kano State Store Fridge #1 reached 8.5°C briefly (standard threshold exceeded by 0.5°C).',
    isAcknowledged: false,
    isResolved: false,
    alertDetails: {
      fridgeName: 'Walk-in Cold Room #1 — Kano',
      safeRange: '2–8°C',
      exceededBy: '+0.5°C',
      duration: '45 minutes',
      triggeredAt: 'Today at 06:15 AM',
      currentReading: '8.5°C'
    },
    dosesAtRisk: [
      { vaccine: 'Measles & Rubella', quantity: 5000, batch: 'MRH-2025-001', expiry: 'Jan 2027' }
    ],
    activityLog: [
      { id: 'l1', status: 'Alert triggered', time: '06:15 AM', isAutomated: true },
      { id: 'l2', status: 'Local alert acknowledged by operator', time: '06:30 AM' }
    ]
  },
  {
    id: 'ALERT-006',
    type: 'temperature',
    severity: 'resolved',
    state: 'Enugu',
    lga: 'Enugu North',
    timeAgo: 'Yesterday',
    title: 'Resolved: Power failure resolved — Enugu Cold Store',
    description: 'Generator kicked in. Temperatures restored to safe 4.2°C.',
    isAcknowledged: true,
    isResolved: true,
    alertDetails: {
      fridgeName: 'Main Chest Freezer — Enugu',
      safeRange: '2–8°C',
      exceededBy: 'Restored',
      duration: '1 hour 15 minutes',
      triggeredAt: 'Yesterday at 04:00 PM',
      currentReading: '4.2°C'
    },
    dosesAtRisk: [],
    activityLog: [
      { id: 'l1', status: 'Power failure alert triggered', time: 'Yesterday at 04:00 PM', isAutomated: true },
      { id: 'l2', status: 'Generator activated', time: '04:10 PM' },
      { id: 'l3', status: 'Temperature restored to 4.2°C', time: '05:15 PM', isAutomated: true },
      { id: 'l4', status: 'Resolved by automated system telemetry', time: '05:15 PM' }
    ]
  },
  {
    id: 'ALERT-007',
    type: 'stockout',
    severity: 'resolved',
    state: 'Lagos',
    lga: 'Ikeja',
    timeAgo: 'Yesterday',
    title: 'Resolved: Emergency resupply arrived — Ikeja PHC',
    description: 'Stock of Penta vaccine replenished with 2,500 doses. Emergency dispatch complete.',
    isAcknowledged: true,
    isResolved: true,
    alertDetails: {
      safeRange: 'Min stock: 1,000 doses',
      exceededBy: 'Replenished',
      duration: '5 days depleted',
      triggeredAt: 'Yesterday at 02:00 PM',
      currentReading: '2,500 doses'
    },
    dosesAtRisk: [],
    activityLog: [
      { id: 'l1', status: 'Stockout alert triggered', time: '5 days ago', isAutomated: true },
      { id: 'l2', status: 'Emergency dispatch scheduled via DHL', time: '4 days ago' },
      { id: 'l3', status: 'Supply arrived & verified at clinic', time: 'Yesterday at 02:00 PM' },
      { id: 'l4', status: 'Resolved by receipt verification', time: 'Yesterday at 02:00 PM' }
    ]
  }
];

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Currently selected notification item for detailing
  const [selectedId, setSelectedId] = useState<string>('ALERT-001');

  // Mobile detail panel drawer visibility
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Success toast simulator
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Mark all notifications as read / acknowledged
  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(item => ({
        ...item,
        isAcknowledged: true,
        activityLog: item.isAcknowledged 
          ? item.activityLog 
          : [
              ...item.activityLog,
              { id: `ack-${Date.now()}`, status: 'Acknowledged by National Officer', time: 'Just now' }
            ]
      }))
    );
    triggerToast('All notifications marked as acknowledged');
  };

  // Perform response action: Acknowledge alert
  const handleAcknowledgeAlert = (id: string) => {
    setNotifications(prev => 
      prev.map(item => {
        if (item.id === id && !item.isAcknowledged) {
          return {
            ...item,
            isAcknowledged: true,
            activityLog: [
              ...item.activityLog,
              { id: `ack-${Date.now()}`, status: 'Acknowledged by National Officer', time: 'Just now' }
            ]
          };
        }
        return item;
      })
    );
    triggerToast('Alert successfully acknowledged');
  };

  // Perform response action: Mark as resolved
  const handleResolveAlert = (id: string) => {
    setNotifications(prev => 
      prev.map(item => {
        if (item.id === id) {
          const alreadyAck = item.isAcknowledged;
          const updatedLog = [...item.activityLog];
          if (!alreadyAck) {
            updatedLog.push({ id: `ack-${Date.now()}`, status: 'Acknowledged by National Officer', time: 'Just now' });
          }
          updatedLog.push({ id: `res-${Date.now()}`, status: 'Resolved by National Officer', time: 'Just now' });
          
          return {
            ...item,
            isAcknowledged: true,
            isResolved: true,
            severity: 'resolved',
            activityLog: updatedLog
          };
        }
        return item;
      })
    );
    triggerToast('Alert marked as resolved');
  };

  // Perform response action: Escalate to Programme Team
  const handleEscalateAlert = (id: string) => {
    setNotifications(prev => 
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            activityLog: [
              ...item.activityLog,
              { id: `esc-${Date.now()}`, status: 'Escalated to Programme Team', time: 'Just now' }
            ]
          };
        }
        return item;
      })
    );
    triggerToast('Alert escalated to Programme Team successfully');
  };

  // List of unique states for dropdown list
  const stateOptions = useMemo(() => {
    const list = new Set(notifications.map(n => n.state));
    return ['all', ...Array.from(list).sort()];
  }, [notifications]);

  // Tab calculations
  const tabCounts = useMemo(() => {
    return {
      all: notifications.length,
      critical: notifications.filter(n => n.severity === 'critical' && !n.isResolved).length,
      warning: notifications.filter(n => n.severity === 'warning' && !n.isResolved).length,
      resolved: notifications.filter(n => n.isResolved).length
    };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // 1. Tab severity filter
      if (activeTab === 'critical' && (n.severity !== 'critical' || n.isResolved)) return false;
      if (activeTab === 'warning' && (n.severity !== 'warning' || n.isResolved)) return false;
      if (activeTab === 'resolved' && !n.isResolved) return false;

      // 2. Type filter
      if (selectedType !== 'all' && n.type !== selectedType) return false;

      // 3. State filter
      if (selectedState !== 'all' && n.state.toLowerCase() !== selectedState.toLowerCase()) return false;

      // 4. Search query matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesDesc = n.description.toLowerCase().includes(query);
        const matchesState = n.state.toLowerCase().includes(query);
        const matchesLga = n.lga?.toLowerCase().includes(query) || false;
        return matchesTitle || matchesDesc || matchesState || matchesLga;
      }

      return true;
    });
  }, [notifications, activeTab, selectedType, selectedState, searchQuery]);

  // Active detailed object lookup
  const activeAlert = useMemo(() => {
    return notifications.find(n => n.id === selectedId) || notifications[0];
  }, [notifications, selectedId]);

  return (
    <div className="flex flex-col gap-4 select-none" id="notifications-view-root">
      
      {/* Dynamic Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border border-slate-700 animate-slide-in">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between" id="notifications-header">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
            <span>Notifications</span>
            {tabCounts.critical > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
                {tabCounts.critical}
              </span>
            )}
          </h1>
          <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
            All system alerts across all states
          </span>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-brand-teal-600 hover:text-brand-teal-700 hover:underline text-left md:text-right mt-1 md:mt-0 cursor-pointer self-start md:self-auto min-h-[32px] flex items-center"
        >
          Mark all as read
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-slate-200" id="notifications-tabs-wrapper">
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none">
          {(['all', 'critical', 'warning', 'resolved'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const count = tabCounts[tab];

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Auto-select first in filtered list if available
                  const firstOfTab = notifications.find(n => {
                    if (tab === 'all') return true;
                    if (tab === 'critical') return n.severity === 'critical' && !n.isResolved;
                    if (tab === 'warning') return n.severity === 'warning' && !n.isResolved;
                    if (tab === 'resolved') return n.isResolved;
                    return true;
                  });
                  if (firstOfTab) {
                    setSelectedId(firstOfTab.id);
                  }
                }}
                className={`py-2 px-1 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive 
                    ? 'border-brand-teal-600 text-brand-teal-700 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-brand-teal-100 text-brand-teal-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2" id="notifications-filters-row">
        {/* Type selector */}
        <div className="col-span-1 md:col-span-3 relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
          >
            <option value="all">All Types</option>
            <option value="temperature">Temperature Excursions</option>
            <option value="stockout">Stockouts</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* State Selector */}
        <div className="col-span-1 md:col-span-3 relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer min-h-[40px]"
          >
            <option value="all">All States</option>
            {stateOptions.filter(st => st !== 'all').map(st => (
              <option key={st} value={st}>{st} State</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Search input */}
        <div className="col-span-2 md:col-span-6 relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search alerts by state, LGA, facility or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 transition-all min-h-[38px]"
          />
        </div>
      </div>

      {/* Main Core Layout: Mobile-responsive (List on Mobile, Split dual pane on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[400px]" id="notifications-split-workspace">
        
        {/* LEFT COLUMN: Notification Card List (Full width on mobile, Col-span-7 on desktop) */}
        <div className="md:col-span-7 flex flex-col gap-2.5 overflow-y-auto max-h-[600px] scrollbar-none" id="notifications-list-pane">
          {filteredNotifications.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                {activeTab === 'resolved' ? 'RESOLVED ALERTS' : 'ACTIVE ALERTS'}
              </span>

              {filteredNotifications.map((item) => {
                const isSelected = item.id === selectedId;
                const isCritical = item.severity === 'critical';
                const isWarning = item.severity === 'warning';
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      // On mobile/tablet smaller widths, we open a fullscreen overlay details drawer
                      if (window.innerWidth < 768) {
                        setIsMobileDetailOpen(true);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 text-left relative overflow-hidden ${
                      isSelected 
                        ? 'bg-slate-50 border-brand-teal-500 ring-1 ring-brand-teal-500' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs'
                    }`}
                  >
                    {/* Unacknowledged Alert Dot Indicator */}
                    {!item.isAcknowledged && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" title="Unacknowledged Alert" />
                    )}

                    {/* Indicator Icon */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                      item.type === 'temperature'
                        ? 'bg-rose-50 text-rose-500' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.type === 'temperature' ? (
                        <Thermometer className="w-4 h-4" />
                      ) : (
                        <PackageX className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {/* Meta info header */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                            isCritical 
                              ? 'bg-red-50 text-red-600 border border-red-100' 
                              : isWarning 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {item.severity}
                          </span>
                          
                          <span className="text-[10px] text-slate-400 font-bold capitalize">
                            · {item.type}
                          </span>
                        </div>

                        <span className="text-[9px] text-slate-400 font-bold shrink-0">
                          {item.timeAgo}
                        </span>
                      </div>

                      {/* Main Title & Description */}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-normal font-display">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed truncate-2-lines">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer specs */}
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/60 text-[10px] font-semibold text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-300" />
                          <span className="text-slate-500 font-bold">{item.state}</span>
                          {item.lga && <span className="text-slate-400">· {item.lga} LGA</span>}
                        </div>

                        <div className="flex items-center gap-2 text-brand-teal-600 font-bold">
                          <span>View details</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 select-none">
              <Bell className="w-8 h-8 text-slate-300" />
              <span className="text-xs font-bold text-slate-500">No matching notifications found</span>
              <p className="text-[10px] text-slate-400 max-w-xs">
                Try clearing search terms or selecting different filters to see system alerts.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Desktop detail screen layout (Hidden on mobile, col-span-5 on desktop) */}
        <div className="hidden md:block md:col-span-5" id="notifications-detail-desktop-pane">
          <DetailPaneContent 
            item={activeAlert} 
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onEscalate={handleEscalateAlert}
            onClose={() => {}} 
            showCloseButton={false}
          />
        </div>

      </div>

      {/* MOBILE FULLSCREEN DETAIL SLIDE-OVER (Rendered when isMobileDetailOpen is true) */}
      <AnimatePresence>
        {isMobileDetailOpen && (
          <>
            {/* Dark Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 z-40 select-none cursor-pointer" 
              onClick={() => setIsMobileDetailOpen(false)}
            />
            
            {/* Dynamic Drawer Container */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-50 z-50 shadow-2xl flex flex-col animate-slide-in-right">
              {/* Drawer Header Toolbar */}
              <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-brand-teal-600 uppercase tracking-wider font-display">
                  ALERT DETAILS & WORKFLOWS
                </span>
                
                <button
                  onClick={() => setIsMobileDetailOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors select-none cursor-pointer"
                  aria-label="Close detail pane"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto">
                <DetailPaneContent 
                  item={activeAlert} 
                  onAcknowledge={handleAcknowledgeAlert}
                  onResolve={handleResolveAlert}
                  onEscalate={handleEscalateAlert}
                  onClose={() => setIsMobileDetailOpen(false)} 
                  showCloseButton={true}
                />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

/* SUBCOMPONENT: DETAIL PANE CONTENT */
interface DetailPaneContentProps {
  item: NotificationItem;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
  onClose: () => void;
  showCloseButton: boolean;
}

function DetailPaneContent({ 
  item, 
  onAcknowledge, 
  onResolve, 
  onEscalate, 
  onClose,
  showCloseButton 
}: DetailPaneContentProps) {
  const isCritical = item.severity === 'critical';
  const isWarning = item.severity === 'warning';
  
  // Compute total doses at risk
  const totalDosesRisk = useMemo(() => {
    return item.dosesAtRisk.reduce((sum, d) => sum + d.quantity, 0);
  }, [item.dosesAtRisk]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs overflow-hidden flex flex-col h-full" id="detail-pane-wrapper">
      
      {/* Alert Header Block */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
        <div className="flex flex-col gap-1 pr-4">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono ${
              isCritical 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : isWarning 
                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {item.severity}
            </span>

            {!item.isAcknowledged && (
              <span className="bg-peach-50 text-amber-800 border border-peach-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                UNACKNOWLEDGED
              </span>
            )}
            {item.isAcknowledged && !item.isResolved && (
              <span className="bg-teal-50 text-teal-800 border border-teal-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                ACKNOWLEDGED
              </span>
            )}
            {item.isResolved && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                RESOLVED
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-800 leading-snug font-display mt-1.5">
            {item.title}
          </h2>
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Stats and Details */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 text-left">
        
        {/* Alert Details Section */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-display">
            ALERT DETAILS
          </span>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-semibold text-slate-600 flex flex-col gap-2">
            
            {item.alertDetails.fridgeName && (
              <div className="flex justify-between items-center gap-4 py-1 border-b border-slate-200/50">
                <span className="text-slate-400 font-medium">Fridge</span>
                <span className="text-slate-700 text-right font-bold truncate max-w-[200px]" title={item.alertDetails.fridgeName}>
                  {item.alertDetails.fridgeName}
                </span>
              </div>
            )}

            {item.alertDetails.safeRange && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-400 font-medium">Safe Range</span>
                <span className="text-slate-700 font-bold">{item.alertDetails.safeRange}</span>
              </div>
            )}

            {item.alertDetails.exceededBy && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-400 font-medium">Exceeded by</span>
                <span className="text-rose-600 font-bold">{item.alertDetails.exceededBy}</span>
              </div>
            )}

            {item.alertDetails.duration && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-400 font-medium">Duration</span>
                <span className="text-slate-700 font-bold">{item.alertDetails.duration}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
              <span className="text-slate-400 font-medium">Triggered</span>
              <span className="text-slate-700 font-bold">{item.alertDetails.triggeredAt}</span>
            </div>

            {item.alertDetails.currentReading && (
              <div className="flex justify-between items-end pt-1.5">
                <span className="text-slate-400 font-medium">Current Reading</span>
                <span className="text-2xl font-extrabold text-rose-600 font-display">
                  {item.alertDetails.currentReading}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Doses At Risk Section (Only visible if quantities are > 0) */}
        {item.dosesAtRisk.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-display">
              DOSES AT RISK
            </span>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
              <table className="w-full text-left text-[11px] border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                    <th className="px-3 py-2 text-[9px] uppercase font-bold">Vaccine</th>
                    <th className="px-3 py-2 text-[9px] uppercase font-bold text-right">Quantity</th>
                    <th className="px-3 py-2 text-[9px] uppercase font-bold">Batch</th>
                    <th className="px-3 py-2 text-[9px] uppercase font-bold">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {item.dosesAtRisk.map((dose, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-slate-800 font-bold">{dose.vaccine}</td>
                      <td className="px-3 py-2 text-rose-600 font-bold text-right font-mono">{dose.quantity.toLocaleString()} doses</td>
                      <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">{dose.batch}</td>
                      <td className="px-3 py-2 text-slate-500 font-medium">{dose.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Doses Footer */}
              <div className="bg-rose-50/60 text-rose-800 text-[11px] font-bold px-3 py-2 flex items-center justify-between border-t border-slate-200">
                <span>Total at risk:</span>
                <span className="font-extrabold text-xs">{totalDosesRisk.toLocaleString()} doses</span>
              </div>
            </div>
          </div>
        )}

        {/* Workflow response actions */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-display">
            RESPONSE ACTIONS
          </span>

          <div className="flex flex-col gap-2" id="detail-actions">
            {/* Action 1: Acknowledge */}
            <button
              onClick={() => onAcknowledge(item.id)}
              disabled={item.isAcknowledged}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer text-center flex items-center justify-center gap-1.5 select-none ${
                item.isAcknowledged 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                  : 'bg-brand-teal-600 hover:bg-brand-teal-700 text-white'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{item.isAcknowledged ? 'Alert Acknowledged' : 'Acknowledge Alert'}</span>
            </button>

            {/* Action 2: Mark as Resolved */}
            <button
              onClick={() => onResolve(item.id)}
              disabled={item.isResolved}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center flex items-center justify-center gap-1.5 select-none ${
                item.isResolved 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white border-brand-teal-600 text-brand-teal-700 hover:bg-brand-teal-50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{item.isResolved ? 'Resolved' : 'Mark as Resolved'}</span>
            </button>

            {/* Action 3: Escalate Alert */}
            <button
              onClick={() => onEscalate(item.id)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 cursor-pointer text-center flex items-center justify-center gap-1.5 select-none"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Escalate to Programme Team</span>
            </button>
          </div>
        </div>

        {/* Activity Log (Timeline list) */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-display">
            ACTIVITY LOG
          </span>

          <div className="relative flex flex-col pl-4 gap-4 before:absolute before:left-[4px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-slate-200">
            {item.activityLog.map((log, idx) => {
              const isFirst = idx === 0;
              const isAwaiting = log.status.includes('Awaiting');

              return (
                <div key={log.id} className="relative text-left flex flex-col gap-0.5 text-xs">
                  {/* Circle dot on line */}
                  <span className={`absolute -left-[16px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isFirst 
                      ? 'bg-red-500 ring-2 ring-red-100' 
                      : isAwaiting 
                      ? 'bg-slate-300' 
                      : 'bg-slate-400'
                  }`} />

                  <span className="font-bold text-slate-700 leading-tight">
                    {log.status}
                  </span>
                  
                  <span className="text-[9px] text-slate-400 font-semibold font-mono flex items-center gap-1 mt-0.2">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{log.time}</span>
                    {log.isAutomated && (
                      <span className="text-slate-300 font-bold uppercase tracking-wider text-[8px] ml-1">· Automated</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
