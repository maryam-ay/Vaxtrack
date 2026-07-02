import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Search, 
  ArrowLeft, 
  Lock, 
  Info, 
  Sparkles, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { PermissionGroup, RoleRecord } from '../types';

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    title: 'DASHBOARD AND OVERVIEW',
    items: [
      { id: 'view_state_dashboard', label: 'View state dashboard' },
      { id: 'view_kpi_metrics', label: 'View KPI metrics' },
      { id: 'view_national_alerts', label: 'View national alerts' },
      { id: 'view_other_states_data', label: 'View other states data' }
    ]
  },
  {
    id: 'stock',
    title: 'STOCK MANAGEMENT',
    items: [
      { id: 'view_stock_levels', label: 'View stock levels' },
      { id: 'log_stock_adjustments', label: 'Log stock adjustments' },
      { id: 'view_batch_expiry', label: 'View batch and expiry details' },
      { id: 'export_stock_reports', label: 'Export stock reports' }
    ]
  },
  {
    id: 'requests',
    title: 'REQUESTS',
    items: [
      { id: 'submit_requests_national', label: 'Submit requests to national' },
      { id: 'review_lga_requests', label: 'Review LGA requests' },
      { id: 'approve_reject_lga', label: 'Approve or reject LGA requests' },
      { id: 'pass_requests_national', label: 'Pass requests to national' }
    ]
  },
  {
    id: 'deliveries',
    title: 'DELIVERIES',
    items: [
      { id: 'view_delivery_schedule', label: 'View delivery schedule' },
      { id: 'arrange_deliveries', label: 'Arrange deliveries' },
      { id: 'assign_3pl_mcco', label: 'Assign 3PL and MCCO' },
      { id: 'view_proof_delivery', label: 'View proof of delivery' },
      { id: 'export_delivery_reports', label: 'Export delivery reports' }
    ]
  },
  {
    id: 'cold_chain',
    title: 'COLD CHAIN AND TEMPERATURE',
    items: [
      { id: 'view_fridge_status', label: 'View fridge status' },
      { id: 'log_temp_readings', label: 'Log temperature readings' },
      { id: 'ack_temp_alerts', label: 'Acknowledge temperature alerts' },
      { id: 'mark_alerts_resolved', label: 'Mark alerts as resolved' }
    ]
  },
  {
    id: 'returns',
    title: 'RETURNS',
    items: [
      { id: 'submit_return_requests', label: 'Submit return requests' },
      { id: 'review_return_requests', label: 'Review return requests' },
      { id: 'approve_collections', label: 'Approve collections' }
    ]
  },
  {
    id: 'system_admin',
    title: 'SYSTEM ADMINISTRATION',
    items: [
      { id: 'manage_users', label: 'Manage users' },
      { id: 'setup_facilities', label: 'Setup facilities' },
      { id: 'setup_stores', label: 'Setup stores' },
      { id: 'configure_max_stock', label: 'Configure maximum stock' },
      { id: 'manage_roles_permissions', label: 'Manage roles and permissions' },
      { id: 'manage_org_units', label: 'Manage organisation units' }
    ]
  }
];

export const INITIAL_ROLES: RoleRecord[] = [
  {
    id: 'national_officer',
    name: 'National Officer',
    description: 'Full system access and administration',
    permissions: {
      view_state_dashboard: true,
      view_kpi_metrics: true,
      view_national_alerts: true,
      view_other_states_data: true,
      view_stock_levels: true,
      log_stock_adjustments: true,
      view_batch_expiry: true,
      export_stock_reports: true,
      submit_requests_national: true,
      review_lga_requests: true,
      approve_reject_lga: true,
      pass_requests_national: true,
      view_delivery_schedule: true,
      arrange_deliveries: true,
      assign_3pl_mcco: true,
      view_proof_delivery: true,
      export_delivery_reports: true,
      view_fridge_status: true,
      log_temp_readings: true,
      ack_temp_alerts: true,
      mark_alerts_resolved: true,
      submit_return_requests: true,
      review_return_requests: true,
      approve_collections: true,
      manage_users: true,
      setup_facilities: true,
      setup_stores: true,
      configure_max_stock: true,
      manage_roles_permissions: true,
      manage_org_units: true
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units'
    ]
  },
  {
    id: 'slwg_member',
    name: 'SLWG Member',
    description: 'National data review, no approvals',
    permissions: {
      view_state_dashboard: true,
      view_kpi_metrics: true,
      view_national_alerts: true,
      view_other_states_data: true,
      view_stock_levels: true,
      log_stock_adjustments: false,
      view_batch_expiry: true,
      export_stock_reports: true,
      submit_requests_national: false,
      review_lga_requests: true,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: true,
      view_fridge_status: true,
      log_temp_readings: false,
      ack_temp_alerts: false,
      mark_alerts_resolved: false,
      submit_return_requests: false,
      review_return_requests: true,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'approve_reject_lga',
      'arrange_deliveries'
    ]
  },
  {
    id: 'state_store_officer',
    name: 'State Store Officer',
    description: 'State-level stock and delivery management',
    permissions: {
      view_state_dashboard: true,
      view_kpi_metrics: true,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: true,
      log_stock_adjustments: true,
      view_batch_expiry: true,
      export_stock_reports: true,
      submit_requests_national: true,
      review_lga_requests: true,
      approve_reject_lga: true,
      pass_requests_national: true,
      view_delivery_schedule: true,
      arrange_deliveries: true,
      assign_3pl_mcco: true,
      view_proof_delivery: true,
      export_delivery_reports: true,
      view_fridge_status: true,
      log_temp_readings: true,
      ack_temp_alerts: true,
      mark_alerts_resolved: true,
      submit_return_requests: true,
      review_return_requests: true,
      approve_collections: true,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'configure_max_stock',
      'manage_roles_permissions',
      'manage_org_units'
    ]
  },
  {
    id: 'lga_store_officer',
    name: 'LGA Store Officer',
    description: 'LGA-level stock and request management',
    permissions: {
      view_state_dashboard: true,
      view_kpi_metrics: true,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: true,
      log_stock_adjustments: true,
      view_batch_expiry: true,
      export_stock_reports: true,
      submit_requests_national: true,
      review_lga_requests: false,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: false,
      view_fridge_status: true,
      log_temp_readings: true,
      ack_temp_alerts: true,
      mark_alerts_resolved: true,
      submit_return_requests: true,
      review_return_requests: false,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'approve_reject_lga',
      'assign_3pl_mcco'
    ]
  },
  {
    id: 'mcco',
    name: 'MCCO',
    description: 'Delivery verification and temperature logging',
    permissions: {
      view_state_dashboard: false,
      view_kpi_metrics: false,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: true,
      log_stock_adjustments: false,
      view_batch_expiry: true,
      export_stock_reports: false,
      submit_requests_national: false,
      review_lga_requests: false,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: false,
      view_fridge_status: true,
      log_temp_readings: true,
      ack_temp_alerts: true,
      mark_alerts_resolved: false,
      submit_return_requests: false,
      review_return_requests: false,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'approve_reject_lga',
      'log_stock_adjustments'
    ]
  },
  {
    id: '3pl_officer',
    name: '3PL Officer',
    description: 'Delivery execution and trip management',
    permissions: {
      view_state_dashboard: false,
      view_kpi_metrics: false,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: false,
      log_stock_adjustments: false,
      view_batch_expiry: false,
      export_stock_reports: false,
      submit_requests_national: false,
      review_lga_requests: false,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: true,
      view_fridge_status: false,
      log_temp_readings: false,
      ack_temp_alerts: false,
      mark_alerts_resolved: false,
      submit_return_requests: false,
      review_return_requests: false,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'view_stock_levels',
      'log_stock_adjustments'
    ]
  },
  {
    id: 'ehf_in_charge',
    name: 'EHF In-Charge',
    description: 'Facility stock and delivery confirmation',
    permissions: {
      view_state_dashboard: false,
      view_kpi_metrics: false,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: true,
      log_stock_adjustments: true,
      view_batch_expiry: false,
      export_stock_reports: false,
      submit_requests_national: true,
      review_lga_requests: false,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: false,
      view_fridge_status: true,
      log_temp_readings: true,
      ack_temp_alerts: true,
      mark_alerts_resolved: false,
      submit_return_requests: true,
      review_return_requests: false,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'review_lga_requests',
      'approve_reject_lga'
    ]
  },
  {
    id: 'uhf_in_charge',
    name: 'UHF In-Charge',
    description: 'Session-based vaccine requests and returns',
    permissions: {
      view_state_dashboard: false,
      view_kpi_metrics: false,
      view_national_alerts: false,
      view_other_states_data: false,
      view_stock_levels: true,
      log_stock_adjustments: true,
      view_batch_expiry: false,
      export_stock_reports: false,
      submit_requests_national: true,
      review_lga_requests: false,
      approve_reject_lga: false,
      pass_requests_national: false,
      view_delivery_schedule: true,
      arrange_deliveries: false,
      assign_3pl_mcco: false,
      view_proof_delivery: true,
      export_delivery_reports: false,
      view_fridge_status: false,
      log_temp_readings: false,
      ack_temp_alerts: false,
      mark_alerts_resolved: false,
      submit_return_requests: true,
      review_return_requests: false,
      approve_collections: false,
      manage_users: false,
      setup_facilities: false,
      setup_stores: false,
      configure_max_stock: false,
      manage_roles_permissions: false,
      manage_org_units: false
    },
    lockedPermissions: [
      'manage_users',
      'setup_facilities',
      'setup_stores',
      'manage_roles_permissions',
      'manage_org_units',
      'view_fridge_status',
      'log_temp_readings'
    ]
  }
];

export function RolesAndPermissionsView({ 
  isMobileDetailOpen, 
  setIsMobileDetailOpen,
  roles,
  setRoles,
  selectedRoleId,
  setSelectedRoleId
}: { 
  isMobileDetailOpen: boolean; 
  setIsMobileDetailOpen: (open: boolean) => void;
  roles: RoleRecord[];
  setRoles: Dispatch<SetStateAction<RoleRecord[]>>;
  selectedRoleId: string;
  setSelectedRoleId: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    stock: true,
    requests: true,
    deliveries: true,
    cold_chain: true,
    returns: true,
    system_admin: true
  });

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permissionId: string) => {
    if (activeRole.lockedPermissions.includes(permissionId)) return;

    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id === selectedRoleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permissionId]: !role.permissions[permissionId]
          }
        };
      }
      return role;
    }));
  };

  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-4" id="roles-permissions-view-container">
      

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Role Selector list (Hides on mobile drill-down detail view) */}
        <div className={`md:col-span-4 flex flex-col gap-3 ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Role Search Card */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-display uppercase block mb-2.5">
              USER ROLES
            </span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-teal-500 focus:bg-white text-slate-800 text-xs rounded-lg pl-8.5 pr-3 py-2 outline-none transition-all min-h-[38px]"
              />
            </div>
          </div>

          {/* Roles Selector List Container */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-2xs divide-y divide-slate-50 overflow-hidden">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setIsMobileDetailOpen(true);
                    }}
                    className={`w-full text-left p-3.5 transition-all flex flex-col gap-0.5 relative select-none cursor-pointer group min-h-[64px] ${
                      isSelected 
                        ? 'bg-brand-teal-50/50 border-l-4 border-brand-teal-600' 
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={`font-bold text-xs tracking-tight ${isSelected ? 'text-brand-teal-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {role.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-full">
                      {role.description}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-slate-300" />
                <span className="text-xs font-bold text-slate-500">No roles match search</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Permissions Detail (Shows on mobile drill-down, collapses roles list) */}
        <div className={`md:col-span-8 flex flex-col gap-3.5 ${!isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Collapsible Accordion Permission Groups */}
          <div className="flex flex-col gap-3">
            {PERMISSION_GROUPS.map((group) => {
              const isGroupExpanded = !!expandedGroups[group.id];
              return (
                <div key={group.id} className="bg-white border border-slate-100 rounded-xl shadow-2xs overflow-hidden">
                  {/* Group Header Button */}
                  <button
                    onClick={() => handleToggleGroup(group.id)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/40 hover:bg-slate-50 transition-colors select-none cursor-pointer border-b border-slate-50"
                  >
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-display">
                      {group.title}
                    </span>
                    {isGroupExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Group items */}
                  <AnimatePresence initial={false}>
                    {isGroupExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                        className="overflow-hidden bg-white"
                      >
                        <div className="divide-y divide-slate-100/70">
                          {group.items.map((permission) => {
                            const isChecked = !!activeRole.permissions[permission.id];
                            const isLocked = activeRole.lockedPermissions.includes(permission.id);
                            return (
                              <div 
                                key={permission.id} 
                                className={`flex items-center justify-between p-3.5 transition-colors ${
                                  isLocked ? 'bg-slate-50/50' : 'hover:bg-slate-50/20'
                                }`}
                              >
                                <div className="flex items-center gap-2 max-w-[70%]">
                                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                                  <span className={`text-xs font-semibold ${isLocked ? 'text-slate-400/80 font-normal' : 'text-slate-700'}`}>
                                    {permission.label}
                                  </span>
                                </div>

                                {/* Custom Toggle Button: 44px touch area constraint */}
                                <button
                                  disabled={isLocked}
                                  onClick={() => handleTogglePermission(permission.id)}
                                  className="h-11 w-16 flex items-center justify-center cursor-pointer focus:outline-none"
                                  aria-label={`Toggle permission for ${permission.label}`}
                                >
                                  <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out select-none items-center ${
                                    isLocked 
                                      ? isChecked ? 'bg-emerald-600/30 cursor-not-allowed' : 'bg-slate-200/50 cursor-not-allowed' 
                                      : isChecked ? 'bg-brand-teal-600 hover:bg-brand-teal-700' : 'bg-slate-200 hover:bg-slate-300'
                                  }`}>
                                    {/* Translating Knob */}
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isChecked ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footnote information panel matching the mockups */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-slate-400 stroke-[2.5] shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Some permissions are locked for this role and cannot be changed. Locked permissions are shown in grey and cannot be toggled.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
