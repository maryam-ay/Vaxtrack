import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LayoutGrid, 
  GitFork, 
  Truck, 
  BarChart2, 
  Bell, 
  Users, 
  Building2, 
  Home, 
  ShieldCheck, 
  Archive, 
  Network, 
  Settings, 
  Inbox,
  ChevronRight
} from 'lucide-react';

interface SidebarContentProps {
  activeItem: string;
  onSelectItem: (id: string) => void;
  onClose?: () => void;
}

export function SidebarContent({ activeItem, onSelectItem, onClose }: SidebarContentProps) {
  const menuItems = [
    { section: 'MONITORING', items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'allocations', label: 'Allocations', icon: <GitFork className="w-5 h-5 stroke-[1.8] rotate-90" />, count: null },
      { id: 'deliveries', label: 'Deliveries', icon: <Truck className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'reports', label: 'Reports', icon: <BarChart2 className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5 stroke-[1.8]" />, count: 12 },
    ]},
    { section: 'SYSTEM ADMINISTRATION', items: [
      { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'ehf-uhf', label: 'EHF & UHF Setup', icon: <Building2 className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'lcs-scs', label: 'LCS & SCS Setup', icon: <Home className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'roles', label: 'Roles & Permissions', icon: <ShieldCheck className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: '3pl', label: '3PL Setup', icon: <Archive className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'org-unit', label: 'Organisation Unit', icon: <Network className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'nscs', label: 'NSCS Setup', icon: <Settings className="w-5 h-5 stroke-[1.8]" />, count: null },
      { id: 'max-stock', label: 'Maximum Stock', icon: <Inbox className="w-5 h-5 stroke-[1.8]" />, count: null },
    ]}
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between bg-brand-teal-900 text-white select-none">
      <div>
        {/* Brand Header */}
        <div className="flex flex-col p-5 border-b border-brand-teal-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold font-display text-2xl tracking-tight text-white leading-none">
                Vaxtrack
              </span>
            </div>

            {/* Mobile Close Button (only shows when onClose is provided) */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-2.5 rounded-lg text-brand-teal-400 hover:text-white hover:bg-brand-teal-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="text-xs font-bold text-brand-teal-400/80 font-display tracking-[0.2em] uppercase mt-1">
            ADMIN
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
          {menuItems.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <span className="text-[10px] font-extrabold text-brand-teal-400/70 tracking-widest uppercase font-display px-3">
                {section.section}
              </span>
              
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = item.id === activeItem;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item.id);
                        if (onClose) {
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all select-none cursor-pointer text-left min-h-[44px] ${
                        isActive
                          ? 'bg-brand-teal-800 text-white shadow-sm'
                          : 'text-slate-300/90 hover:text-white hover:bg-brand-teal-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-slate-300/80 group-hover:text-white'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.count !== null && (
                        <span className="bg-[#f04438] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Footer */}
      <div className="p-4 border-t border-brand-teal-800/40 bg-brand-teal-950/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-full bg-[#1c5d5e] flex items-center justify-center font-extrabold font-display text-white shrink-0 text-sm">
            AO
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[13px] font-bold text-white truncate leading-tight">Adaeze Okonkwo</span>
            <span className="text-[10px] text-brand-teal-400/80 truncate mt-0.5">National Officer · FMOH</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-brand-teal-500/70 shrink-0" />
      </div>
    </div>
  );
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelectItem?: (id: string) => void;
}

export function NavigationDrawer({ isOpen, onClose, activeItem, onSelectItem }: NavigationDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 select-none cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 bottom-0 left-0 w-[280px] bg-brand-teal-900 text-white z-50 shadow-2xl flex flex-col justify-between"
          >
            <SidebarContent 
              activeItem={activeItem} 
              onSelectItem={(id) => {
                if (onSelectItem) {
                  onSelectItem(id);
                }
              }} 
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
