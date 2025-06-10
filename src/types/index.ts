export interface User {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  roles: Role[];
  bases: Base[];
  created_at: string;
}

export interface Role {
  role_id: number;
  role_name: 'Admin' | 'Base Commander' | 'Logistics Officer';
  description: string;
}

export interface Base {
  base_id: string;
  base_name: string;
  location: string;
  description: string;
}

export interface EquipmentType {
  equipment_type_id: string;
  type_name: string;
  category: string;
  description: string;
}

export interface Asset {
  asset_id: string;
  equipment_type_id: string;
  equipment_type: EquipmentType;
  model_name: string;
  serial_number?: string;
  current_base_id: string;
  current_base: Base;
  quantity: number;
  status: 'Operational' | 'Maintenance' | 'Damaged';
  is_fungible: boolean;
  current_balance: number;
  last_updated_at: string;
}

export interface Purchase {
  purchase_id: string;
  asset: Asset;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  supplier_info: string;
  receiving_base: Base;
  purchase_order_number?: string;
  recorded_by: User;
  created_at: string;
}

export interface Transfer {
  transfer_id: string;
  asset: Asset;
  asset_serial_number?: string;
  quantity: number;
  source_base: Base;
  destination_base: Base;
  transfer_date: string;
  reason: string;
  status: 'Initiated' | 'In Transit' | 'Received' | 'Cancelled';
  initiated_by: User;
  received_by?: User;
  created_at: string;
  completed_at?: string;
}

export interface Assignment {
  assignment_id: string;
  asset: Asset;
  assigned_to: User;
  assignment_date: string;
  base_of_assignment: Base;
  purpose: string;
  expected_return_date?: string;
  returned_date?: string;
  is_active: boolean;
  recorded_by: User;
  created_at: string;
}

export interface Expenditure {
  expenditure_id: string;
  asset: Asset;
  quantity_expended: number;
  expenditure_date: string;
  base: Base;
  reason: string;
  reported_by: User;
  created_at: string;
}

export interface DashboardMetrics {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  assignedAssets: number;
  expendedAssets: number;
  netMovementDetails: {
    purchases: Purchase[];
    transfersIn: Transfer[];
    transfersOut: Transfer[];
  };
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  baseId?: string;
  equipmentTypeId?: string;
}