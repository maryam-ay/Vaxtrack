import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, Truck, FileText, Bell, Users, Settings, ClipboardList, ShieldAlert, Layers, Building2, Sliders, LogOut } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelectItem?: (id: string) => void;
}

export function NavigationDrawer({ isOpen, onClose, activeItem, onSelectItem }: NavigationDrawerProps) {
  const menuItems = [
    { section: 'MONITORING', items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, count: null },
      { id: 'allocations', label: 'Allocations', icon: <Layers className="w-4 h-4" />, count: null },
      { id: 'deliveries', label: 'Deliveries', icon: <Truck className="w-4 h-4" />, count: null },
      { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" />, count: null },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, count: 12 },
    ]},
    { section: 'SYSTEM ADMINISTRATION', items: [
      { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, count: null },
      { id: 'ehf-uhf', label: 'EHF & UHF Setup', icon: <ClipboardList className="w-4 h-4" />, count: null },
      { id: 'lcs-scs', label: 'LCS & SCS Setup', icon: <Settings className="w-4 h-4" />, count: null },
      { id: 'roles', label: 'Roles & Permissions', icon: <ShieldAlert className="w-4 h-4" />, count: null },
      { id: '3pl', label: '3PL Setup', icon: <Sliders className="w-4 h-4" />, count: null },
      { id: 'org-unit', label: 'Organisation Unit', icon: <Building2 className="w-4 h-4" />, count: null },
    ]}
  ];

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
            {/* Header */}
            <div>
              <div className="flex items-center justify-between p-4 border-b border-brand-teal-800">
                <div className="flex flex-col">
                  <span className="font-extrabold font-display text-lg tracking-wider text-white">
                    VaxTrack
                  </span>
                  <span className="text-[9px] font-bold text-brand-teal-400 font-mono tracking-widest uppercase">
                    ADMIN PANEL
                  </span>
                </div>
                
                {/* Close Button: 44px min touch target */}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-lg text-brand-teal-400 hover:text-white hover:bg-brand-teal-800 transition-colors select-none cursor-pointer min-h-[44px] min-w-[44px]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="p-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-180px)]">
                {menuItems.map((section, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-brand-teal-500 tracking-widest uppercase font-display px-3">
                      {section.section}
                    </span>
                    
                    <div className="flex flex-col gap-1">
                      {section.items.map((item) => {
                        const isActive = item.id === activeItem;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (onSelectItem) {
                                onSelectItem(item.id);
                              }
                              onClose();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all select-none cursor-pointer text-left min-h-[44px] ${
                              isActive
                                ? 'bg-brand-teal-800 text-white shadow-xs'
                                : 'text-brand-teal-400 hover:text-white hover:bg-brand-teal-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {item.count !== null && (
                              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
            <div className="p-4 border-t border-brand-teal-800 bg-brand-teal-950 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold font-display text-white shrink-0 text-sm border-2 border-emerald-500/20">
                AO
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="text-xs font-bold text-white truncate">Adaeze Okonkwo</span>
                <span className="text-[10px] text-brand-teal-400 truncate">National Officer · FMOH</span>
              </div>
              <button
                className="p-1.5 rounded-lg text-brand-teal-500 hover:text-white hover:bg-brand-teal-800 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
