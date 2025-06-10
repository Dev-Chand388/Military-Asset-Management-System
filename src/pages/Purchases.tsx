import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Wrench,
  Eye,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockPurchases, mockBases, mockEquipmentTypes, mockAssets } from '../data/mockData';
import { Purchase } from '../types';
import { format, getCurrentDate } from '../utils/dateUtils';
import Modal from '../components/Common/Modal';

const Purchases: React.FC = () => {
  const { hasRole, hasBaseAccess, user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    baseId: '',
    equipmentTypeId: '',
    dateFrom: '',
    dateTo: ''
  });

  const [newPurchase, setNewPurchase] = useState({
    assetId: '',
    quantity: '',
    unitCost: '',
    purchaseDate: getCurrentDate(),
    supplierInfo: '',
    receivingBaseId: user?.bases[0]?.base_id || '',
    purchaseOrderNumber: '',
    notes: ''
  });

  // Filter purchases based on user access and filters
  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter(purchase => {
      // Access control
      if (!hasBaseAccess(purchase.receiving_base.base_id)) return false;
      
      // Search filter
      if (searchTerm && !purchase.asset.model_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !purchase.supplier_info.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Base filter
      if (filters.baseId && purchase.receiving_base.base_id !== filters.baseId) return false;
      
      // Equipment type filter
      if (filters.equipmentTypeId && purchase.asset.equipment_type_id !== filters.equipmentTypeId) return false;
      
      // Date filters
      if (filters.dateFrom && purchase.purchase_date < filters.dateFrom) return false;
      if (filters.dateTo && purchase.purchase_date > filters.dateTo) return false;
      
      return true;
    });
  }, [searchTerm, filters, hasBaseAccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would make an API call
    console.log('Creating purchase:', newPurchase);
    setShowAddModal(false);
    setNewPurchase({
      assetId: '',
      quantity: '',
      unitCost: '',
      purchaseDate: getCurrentDate(),
      supplierInfo: '',
      receivingBaseId: user?.bases[0]?.base_id || '',
      purchaseOrderNumber: '',
      notes: ''
    });
  };

  const canCreatePurchase = hasRole('Admin') || hasRole('Logistics Officer');
  const userBases = user?.bases || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600 mt-1">Manage asset purchases and procurement</p>
        </div>
        
        {canCreatePurchase && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Purchase
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
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
                {mockEquipmentTypes.map(type => (
                  <option key={type.equipment_type_id} value={type.equipment_type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.asset.model_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {purchase.asset.equipment_type.type_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${purchase.total_cost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${purchase.unit_cost.toLocaleString()} each
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(purchase.purchase_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.receiving_base.base_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.supplier_info}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPurchase(purchase);
                        setShowViewModal(true);
                      }}
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No purchases found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record New Purchase"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <select
                value={newPurchase.assetId}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, assetId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select asset...</option>
                {mockAssets.map(asset => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.model_name} ({asset.equipment_type.type_name})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={newPurchase.quantity}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost ($)
              </label>
              <input
                type="number"
                value={newPurchase.unitCost}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, unitCost: e.target.value }))}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                value={newPurchase.purchaseDate}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, purchaseDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={newPurchase.supplierInfo}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, supplierInfo: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiving Base
              </label>
              <select
                value={newPurchase.receivingBaseId}
                onChange={(e) => setNewPurchase(prev => ({ ...prev, receivingBaseId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {userBases.map(base => (
                  <option key={base.base_id} value={base.base_id}>
                    {base.base_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Order Number (Optional)
            </label>
            <input
              type="text"
              value={newPurchase.purchaseOrderNumber}
              onChange={(e) => setNewPurchase(prev => ({ ...prev, purchaseOrderNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={newPurchase.notes}
              onChange={(e) => setNewPurchase(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {newPurchase.quantity && newPurchase.unitCost && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Total Cost: ${(parseFloat(newPurchase.quantity) * parseFloat(newPurchase.unitCost)).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Record Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Purchase Details"
          size="lg"
        >
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Asset</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPurchase.asset.model_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPurchase.asset.equipment_type.type_name}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPurchase.quantity.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Unit Cost</h4>
                <p className="text-lg font-semibold text-gray-900">
                  ${selectedPurchase.unit_cost.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Cost</h4>
                <p className="text-lg font-semibold text-green-600">
                  ${selectedPurchase.total_cost.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Purchase Date</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {format(selectedPurchase.purchase_date)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Receiving Base</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPurchase.receiving_base.base_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPurchase.receiving_base.location}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Supplier</h4>
              <p className="text-lg font-semibold text-gray-900">
                {selectedPurchase.supplier_info}
              </p>
            </div>
            
            {selectedPurchase.purchase_order_number && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Purchase Order</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPurchase.purchase_order_number}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Recorded By</h4>
              <p className="text-lg font-semibold text-gray-900">
                {selectedPurchase.recorded_by.full_name}
              </p>
              <p className="text-sm text-gray-500">
                {format(selectedPurchase.created_at)}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Purchases;