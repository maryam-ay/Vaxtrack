export type KPIStatus = 'informational' | 'critical' | 'on_target' | 'attention';

export interface KPIIndicator {
  id: string;
  title: string;
  value: string;
  subtext: string;
  target?: string;
  status: KPIStatus;
  topColorClass: string;
  textColorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
}

export type StockStatus = 'out_of_stock' | 'below_min' | 'reorder' | 'adequate' | 'overstock';

export interface VaccineInfo {
  code: string;
  name: string;
  doses: number;
  status: StockStatus;
  percentage: number; // calculated stock level compared to target
}

export interface FacilityData {
  id: string;
  name: string;
  vaccines: Record<string, number>;
}

export interface WardData {
  id: string;
  name: string;
  vaccines: Record<string, number>;
  facilities?: FacilityData[];
}

export interface LGAData {
  id: string;
  name: string;
  vaccines: Record<string, number>;
  wards?: WardData[];
}

export interface StateData {
  id: string;
  name: string;
  vaccines: Record<string, number>;
  lgas?: LGAData[];
}

export interface PermissionItem {
  id: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  title: string;
  items: PermissionItem[];
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string;
  // Map of permissionId -> boolean
  permissions: Record<string, boolean>;
  // Set of permissionIds that are locked for this role
  lockedPermissions: string[];
}
