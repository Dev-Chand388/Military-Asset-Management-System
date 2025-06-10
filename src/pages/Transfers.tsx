import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ArrowRight,
  Calendar,
  MapPin,
  Wrench,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockTransfers, mockBases, mockEquipmentTypes, mockAssets } from '../data/mockData';
import { Transfer } from '../types';
import { format, getCurrentDate, formatDateTime } from '../utils/dateUtils';
import Modal from '../components/Common/Modal';

const Transfers: React.FC = () => {
  const { hasRole, hasBaseAccess, user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    baseId: '',
    equipmentTypeId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const [newTransfer, setNewTransfer] = useState({
    assetId: '',
    quantity: '',
    sourceBaseId: user?.bases[0]?.base_id || '',
    destinationBaseId: '',
    reason: '',
    notes: ''
  });

  // Filter transfers based on user access and filters
  const filteredTransfers = useMemo(() => {
    return mockTransfers.filter(transfer => {
      // Access control - user must have access to source or destination base
      const hasAccess = hasBaseAccess(transfer.source_base.base_id) || 
                       hasBaseAccess(transfer.destination_base.base_id);
      if (!hasAccess) return false;
      
      // Search filter
      if (searchTerm && !transfer.asset.model_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Base filter (either source or destination)
      if (filters.baseId && 
          transfer.source_base.base_id !== filters.baseId && 
          transfer.destination_base.base_id !== filters.baseId) {
        return false;
      }
      
      // Equipment type filter
      if (filters.equipmentTypeId && transfer.asset.equipment_type_id !== filters.equipmentTypeId) return false;
      
      // Status filter
      if (filters.status && transfer.status !== filters.status) return false;
      
      // Date filters
      if (filters.dateFrom && transfer.transfer_date < filters.dateFrom) return false;
      if (filters.dateTo && transfer.transfer_date > filters.dateTo) return false;
      
      return true;
    });
  }, [searchTerm, filters, hasBaseAccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would make an API call
    console.log('Creating transfer:', newTransfer);
    setShowAddModal(false);
    setNewTransfer({
      assetId: '',
      quantity: '',
      sourceBaseId: user?.bases[0]?.base_id || '',
      destinationBaseId: '',
      reason: '',
      notes: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Transit':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const canCreateTransfer = hasRole('Admin') || hasRole('Base Commander') || hasRole('Logistics Officer');
  const userBases = user?.bases || [];
  const availableBases = mockBases.filter(base => 
    hasRole('Admin') || userBases.some(userBase => userBase.base_id === base.base_id)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Manage asset transfers between bases</p>
        </div>
        
        {canCreateTransfer && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Initiate Transfer
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
              placeholder="Search transfers..."
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

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="Initiated">Initiated</option>
              <option value="In Transit">In Transit</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
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

      {/* Transfers Table */}
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
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Initiated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.transfer_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.asset.model_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.asset.equipment_type.type_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{transfer.source_base.base_name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{transfer.destination_base.base_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(transfer.transfer_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transfer.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transfer.initiated_by.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedTransfer(transfer);
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
        
        {filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transfers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Transfer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Initiate Asset Transfer"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <select
                value={newTransfer.assetId}
                onChange={(e) => setNewTransfer(prev => ({ ...prev, assetId: e.target.value }))}
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
                value={newTransfer.quantity}
                onChange={(e) => setNewTransfer(prev => ({ ...prev, quantity: e.target.value }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Base
              </label>
              <select
                value={newTransfer.sourceBaseId}
                onChange={(e) => setNewTransfer(prev => ({ ...prev, sourceBaseId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {availableBases.map(base => (
                  <option key={base.base_id} value={base.base_id}>
                    {base.base_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Base
              </label>
              <select
                value={newTransfer.destinationBaseId}
                onChange={(e) => setNewTransfer(prev => ({ ...prev, destinationBaseId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select destination...</option>
                {mockBases.filter(base => base.base_id !== newTransfer.sourceBaseId).map(base => (
                  <option key={base.base_id} value={base.base_id}>
                    {base.base_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Transfer
            </label>
            <input
              type="text"
              value={newTransfer.reason}
              onChange={(e) => setNewTransfer(prev => ({ ...prev, reason: e.target.value }))}
              required
              placeholder="e.g., Equipment redistribution, Training support"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={newTransfer.notes}
              onChange={(e) => setNewTransfer(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
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
              Initiate Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* View Transfer Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Transfer Details"
          size="lg"
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Transfer #{selectedTransfer.transfer_id.slice(-8)}
              </h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedTransfer.status)}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                  {selectedTransfer.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Asset</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.asset.model_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTransfer.asset.equipment_type.type_name}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.quantity.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Source Base</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.source_base.base_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTransfer.source_base.location}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Destination Base</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.destination_base.base_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTransfer.destination_base.location}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Transfer Date</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateTime(selectedTransfer.transfer_date)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Initiated By</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.initiated_by.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(selectedTransfer.created_at)}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Reason</h4>
              <p className="text-gray-900">
                {selectedTransfer.reason}
              </p>
            </div>
            
            {selectedTransfer.received_by && selectedTransfer.completed_at && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Received By</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedTransfer.received_by.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(selectedTransfer.completed_at)}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Transfers;