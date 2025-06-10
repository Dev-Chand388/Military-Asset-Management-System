import { User, Role, Base, EquipmentType, Asset, Purchase, Transfer, Assignment, Expenditure } from '../types';

export const mockRoles: Role[] = [
  { role_id: 1, role_name: 'Admin', description: 'Full system access' },
  { role_id: 2, role_name: 'Base Commander', description: 'Base-specific management access' },
  { role_id: 3, role_name: 'Logistics Officer', description: 'Limited operational access' }
];

export const mockBases: Base[] = [
  { base_id: 'base-001', base_name: 'Fort Knox', location: 'Kentucky, USA', description: 'Primary armor training facility' },
  { base_id: 'base-002', base_name: 'Camp Pendleton', location: 'California, USA', description: 'Marine Corps amphibious training' },
  { base_id: 'base-003', base_name: 'Ramstein Air Base', location: 'Germany', description: 'European logistics hub' },
  { base_id: 'base-004', base_name: 'Naval Station Norfolk', location: 'Virginia, USA', description: 'Naval operations center' }
];

export const mockEquipmentTypes: EquipmentType[] = [
  { equipment_type_id: 'eq-001', type_name: 'Vehicles', category: 'Ground', description: 'Military vehicles and transport' },
  { equipment_type_id: 'eq-002', type_name: 'Small Arms', category: 'Weapons', description: 'Personal firearms and rifles' },
  { equipment_type_id: 'eq-003', type_name: 'Ammunition', category: 'Consumable', description: 'Various ammunition types' },
  { equipment_type_id: 'eq-004', type_name: 'Heavy Weaponry', category: 'Weapons', description: 'Artillery and heavy weapons' },
  { equipment_type_id: 'eq-005', type_name: 'Communication Equipment', category: 'Electronics', description: 'Radio and communication systems' }
];

export const mockUsers: User[] = [
  {
    user_id: 'user-001',
    username: 'admin',
    email: 'admin@military.gov',
    full_name: 'System Administrator',
    roles: [mockRoles[0]],
    bases: mockBases,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    user_id: 'user-002',
    username: 'commander.knox',
    email: 'commander@fortknox.mil',
    full_name: 'Colonel John Smith',
    roles: [mockRoles[1]],
    bases: [mockBases[0]],
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    user_id: 'user-003',
    username: 'logistics.officer',
    email: 'logistics@pendleton.mil',
    full_name: 'Captain Jane Doe',
    roles: [mockRoles[2]],
    bases: [mockBases[1]],
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAssets: Asset[] = [
  {
    asset_id: 'asset-001',
    equipment_type_id: 'eq-001',
    equipment_type: mockEquipmentTypes[0],
    model_name: 'M1A2 Abrams Tank',
    serial_number: 'ABR-2024-001',
    current_base_id: 'base-001',
    current_base: mockBases[0],
    quantity: 1,
    status: 'Operational',
    is_fungible: false,
    current_balance: 1,
    last_updated_at: '2024-01-15T10:00:00Z'
  },
  {
    asset_id: 'asset-002',
    equipment_type_id: 'eq-002',
    equipment_type: mockEquipmentTypes[1],
    model_name: 'M4A1 Carbine',
    serial_number: 'M4-2024-001',
    current_base_id: 'base-001',
    current_base: mockBases[0],
    quantity: 1,
    status: 'Operational',
    is_fungible: false,
    current_balance: 1,
    last_updated_at: '2024-01-15T10:00:00Z'
  },
  {
    asset_id: 'asset-003',
    equipment_type_id: 'eq-003',
    equipment_type: mockEquipmentTypes[2],
    model_name: '5.56mm NATO',
    current_base_id: 'base-001',
    current_base: mockBases[0],
    quantity: 10000,
    status: 'Operational',
    is_fungible: true,
    current_balance: 10000,
    last_updated_at: '2024-01-15T10:00:00Z'
  }
];

export const mockPurchases: Purchase[] = [
  {
    purchase_id: 'pur-001',
    asset: mockAssets[0],
    quantity: 2,
    unit_cost: 8500000,
    total_cost: 17000000,
    purchase_date: '2024-01-10',
    supplier_info: 'General Dynamics Land Systems',
    receiving_base: mockBases[0],
    purchase_order_number: 'PO-2024-001',
    recorded_by: mockUsers[0],
    created_at: '2024-01-10T09:00:00Z'
  },
  {
    purchase_id: 'pur-002',
    asset: mockAssets[2],
    quantity: 50000,
    unit_cost: 0.75,
    total_cost: 37500,
    purchase_date: '2024-01-12',
    supplier_info: 'Federal Premium Ammunition',
    receiving_base: mockBases[0],
    purchase_order_number: 'PO-2024-002',
    recorded_by: mockUsers[2],
    created_at: '2024-01-12T14:00:00Z'
  }
];

export const mockTransfers: Transfer[] = [
  {
    transfer_id: 'trans-001',
    asset: mockAssets[2],
    quantity: 5000,
    source_base: mockBases[0],
    destination_base: mockBases[1],
    transfer_date: '2024-01-14T08:00:00Z',
    reason: 'Training exercise preparation',
    status: 'Received',
    initiated_by: mockUsers[2],
    received_by: mockUsers[2],
    created_at: '2024-01-13T10:00:00Z',
    completed_at: '2024-01-14T16:00:00Z'
  }
];

export const mockAssignments: Assignment[] = [
  {
    assignment_id: 'assign-001',
    asset: mockAssets[1],
    assigned_to: mockUsers[2],
    assignment_date: '2024-01-15',
    base_of_assignment: mockBases[1],
    purpose: 'Training operations',
    expected_return_date: '2024-02-15',
    is_active: true,
    recorded_by: mockUsers[1],
    created_at: '2024-01-15T09:00:00Z'
  }
];

export const mockExpenditures: Expenditure[] = [
  {
    expenditure_id: 'exp-001',
    asset: mockAssets[2],
    quantity_expended: 2500,
    expenditure_date: '2024-01-16',
    base: mockBases[1],
    reason: 'Live fire training exercise',
    reported_by: mockUsers[2],
    created_at: '2024-01-16T18:00:00Z'
  }
];