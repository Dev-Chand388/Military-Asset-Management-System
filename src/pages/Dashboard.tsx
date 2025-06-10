import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  ArrowUpDown, 
  Users, 
  Zap,
  Calendar,
  MapPin,
  Wrench
} from 'lucide-react';
import MetricCard from '../components/Dashboard/MetricCard';
import NetMovementModal from '../components/Dashboard/NetMovementModal';
import { useAuth } from '../context/AuthContext';
import { 
  mockPurchases, 
  mockTransfers, 
  mockAssignments, 
  mockExpenditures,
  mockBases,
  mockEquipmentTypes
} from '../data/mockData';
import { DashboardMetrics, FilterOptions } from '../types';
import { getDateDaysAgo, getCurrentDate } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user, hasBaseAccess } = useAuth();
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: getDateDaysAgo(30),
      end: getCurrentDate()
    },
    baseId: '',
    equipmentTypeId: ''
  });

  const metrics = useMemo((): DashboardMetrics => {
    // Filter data based on user permissions and filters
    const filteredPurchases = mockPurchases.filter(purchase => {
      const dateMatch = purchase.purchase_date >= filters.dateRange.start && 
                      purchase.purchase_date <= filters.dateRange.end;
      const baseMatch = !filters.baseId || purchase.receiving_base.base_id === filters.baseId;
      const equipmentMatch = !filters.equipmentTypeId || 
                           purchase.asset.equipment_type_id === filters.equipmentTypeId;
      const accessMatch = hasBaseAccess(purchase.receiving_base.base_id);
      
      return dateMatch && baseMatch && equipmentMatch && accessMatch;
    });

    const filteredTransfersIn = mockTransfers.filter(transfer => {
      const dateMatch = transfer.transfer_date >= filters.dateRange.start && 
                       transfer.transfer_date <= filters.dateRange.end;
      const baseMatch = !filters.baseId || transfer.destination_base.base_id === filters.baseId;
      const equipmentMatch = !filters.equipmentTypeId || 
                           transfer.asset.equipment_type_id === filters.equipmentTypeId;
      const accessMatch = hasBaseAccess(transfer.destination_base.base_id);
      
      return dateMatch && baseMatch && equipmentMatch && accessMatch;
    });

    const filteredTransfersOut = mockTransfers.filter(transfer => {
      const dateMatch = transfer.transfer_date >= filters.dateRange.start && 
                       transfer.transfer_date <= filters.dateRange.end;
      const baseMatch = !filters.baseId || transfer.source_base.base_id === filters.baseId;
      const equipmentMatch = !filters.equipmentTypeId || 
                           transfer.asset.equipment_type_id === filters.equipmentTypeId;
      const accessMatch = hasBaseAccess(transfer.source_base.base_id);
      
      return dateMatch && baseMatch && equipmentMatch && accessMatch;
    });

    // Calculate metrics
    const purchaseQuantity = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const transfersInQuantity = filteredTransfersIn.reduce((sum, t) => sum + t.quantity, 0);
    const transfersOutQuantity = filteredTransfersOut.reduce((sum, t) => sum + t.quantity, 0);
    
    const openingBalance = 45000; // Mock opening balance
    const netMovement = purchaseQuantity + transfersInQuantity - transfersOutQuantity;
    const closingBalance = openingBalance + netMovement;
    
    const assignedAssets = mockAssignments.filter(a => 
      a.is_active && hasBaseAccess(a.base_of_assignment.base_id)
    ).length;
    
    const expendedAssets = mockExpenditures.filter(e => 
      hasBaseAccess(e.base.base_id)
    ).reduce((sum, e) => sum + e.quantity_expended, 0);

    return {
      openingBalance,
      closingBalance,
      netMovement,
      assignedAssets,
      expendedAssets,
      netMovementDetails: {
        purchases: filteredPurchases,
        transfersIn: filteredTransfersIn,
        transfersOut: filteredTransfersOut
      }
    };
  }, [filters, hasBaseAccess]);

  const userBases = user?.bases || [];
  const availableEquipmentTypes = mockEquipmentTypes;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Asset management overview and key metrics</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <select
              value={filters.baseId}
              onChange={(e) => setFilters(prev => ({ ...prev, baseId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Bases</option>
              {userBases.map(base => (
                <option key={base.base_id} value={base.base_id}>
                  {base.base_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-gray-500" />
            <select
              value={filters.equipmentTypeId}
              onChange={(e) => setFilters(prev => ({ ...prev, equipmentTypeId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Equipment</option>
              {availableEquipmentTypes.map(type => (
                <option key={type.equipment_type_id} value={type.equipment_type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <MetricCard
          title="Opening Balance"
          value={metrics.openingBalance.toLocaleString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Closing Balance"
          value={metrics.closingBalance.toLocaleString()}
          icon={Package}
          color="green"
        />
        <MetricCard
          title="Net Movement"
          value={metrics.netMovement >= 0 ? `+${metrics.netMovement.toLocaleString()}` : metrics.netMovement.toLocaleString()}
          icon={ArrowUpDown}
          color={metrics.netMovement >= 0 ? 'green' : 'red'}
          onClick={() => setShowNetMovementModal(true)}
          clickable={true}
        />
        <MetricCard
          title="Assigned Assets"
          value={metrics.assignedAssets.toLocaleString()}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Expended Assets"
          value={metrics.expendedAssets.toLocaleString()}
          icon={Zap}
          color="yellow"
        />
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Purchases</span>
              <span className="font-semibold text-green-600">
                {metrics.netMovementDetails.purchases.length} transactions
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Active Transfers</span>
              <span className="font-semibold text-blue-600">
                {metrics.netMovementDetails.transfersIn.length + metrics.netMovementDetails.transfersOut.length} transfers
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Base Coverage</span>
              <span className="font-semibold text-purple-600">
                {userBases.length} {userBases.length === 1 ? 'base' : 'bases'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Access Level</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {user?.roles[0]?.role_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.roles[0]?.role_name}</p>
                <p className="text-sm text-gray-500">{user?.roles[0]?.description}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Assigned Bases:</p>
              <div className="flex flex-wrap gap-2">
                {userBases.map(base => (
                  <span 
                    key={base.base_id}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {base.base_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Movement Modal */}
      <NetMovementModal
        isOpen={showNetMovementModal}
        onClose={() => setShowNetMovementModal(false)}
        metrics={metrics}
      />
    </div>
  );
};

export default Dashboard;