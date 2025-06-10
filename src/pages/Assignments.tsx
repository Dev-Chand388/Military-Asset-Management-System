import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  User,
  Calendar,
  MapPin,
  Wrench,
  Eye,
  Users,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  mockAssignments, 
  mockExpenditures, 
  mockBases, 
  mockEquipmentTypes, 
  mockAssets, 
  mockUsers 
} from '../data/mockData';
import { Assignment, Expenditure } from '../types';
import { format, getCurrentDate, formatDateTime } from '../utils/dateUtils';
import Modal from '../components/Common/Modal';

const Assignments: React.FC = () => {
  const { hasRole, hasBaseAccess, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddExpenditureModal, setShowAddExpenditureModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Assignment | Expenditure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    baseId: '',
    equipmentTypeId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const [newAssignment, setNewAssignment] = useState({
    assetId: '',
    assignedToUserId: '',
    baseId: user?.bases[0]?.base_id || '',
    purpose: '',
    expectedReturnDate: '',
    notes: ''
  });

  const [newExpenditure, setNewExpenditure] = useState({
    assetId: '',
    quantityExpended: '',
    baseId: user?.bases[0]?.base_id || '',
    reason: '',
    notes: ''
  });

  // Filter assignments based on user access and filters
  const filteredAssignments = useMemo(() => {
    return mockAssignments.filter(assignment => {
      // Access control
      if (!hasBaseAccess(assignment.base_of_assignment.base_id)) return false;
      
      // Search filter
      if (searchTerm && 
          !assignment.asset.model_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !assignment.assigned_to.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !assignment.purpose.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Base filter
      if (filters.baseId && assignment.base_of_assignment.base_id !== filters.baseId) return false;
      
      // Equipment type filter
      if (filters.equipmentTypeId && assignment.asset.equipment_type_id !== filters.equipmentTypeId) return false;
      
      // Status filter
      if (filters.status === 'active' && !assignment.is_active) return false;
      if (filters.status === 'returned' && assignment.is_active) return false;
      
      // Date filters
      if (filters.dateFrom && assignment.assignment_date < filters.dateFrom) return false;
      if (filters.dateTo && assignment.assignment_date > filters.dateTo) return false;
      
      return true;
    });
  }, [searchTerm, filters, hasBaseAccess]);

  // Filter expenditures based on user access and filters
  const filteredExpenditures = useMemo(() => {
    return mockExpenditures.filter(expenditure => {
      // Access control
      if (!hasBaseAccess(expenditure.base.base_id)) return false;
      
      // Search filter
      if (searchTerm && 
          !expenditure.asset.model_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !expenditure.reason.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !expenditure.reported_by.full_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Base filter
      if (filters.baseId && expenditure.base.base_id !== filters.baseId) return false;
      
      // Equipment type filter
      if (filters.equipmentTypeId && expenditure.asset.equipment_type_id !== filters.equipmentTypeId) return false;
      
      // Date filters
      if (filters.dateFrom && expenditure.expenditure_date < filters.dateFrom) return false;
      if (filters.dateTo && expenditure.expenditure_date > filters.dateTo) return false;
      
      return true;
    });
  }, [searchTerm, filters, hasBaseAccess]);

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating assignment:', newAssignment);
    setShowAddAssignmentModal(false);
    setNewAssignment({
      assetId: '',
      assignedToUserId: '',
      baseId: user?.bases[0]?.base_id || '',
      purpose: '',
      expectedReturnDate: '',
      notes: ''
    });
  };

  const handleExpenditureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating expenditure:', newExpenditure);
    setShowAddExpenditureModal(false);
    setNewExpenditure({
      assetId: '',
      quantityExpended: '',
      baseId: user?.bases[0]?.base_id || '',
      reason: '',
      notes: ''
    });
  };

  const canManageAssignments = hasRole('Admin') || hasRole('Base Commander') || hasRole('Logistics Officer');
  const userBases = user?.bases || [];
  const availablePersonnel = mockUsers.filter(u => u.user_id !== user?.user_id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
          <p className="text-gray-600 mt-1">Manage asset assignments to personnel and track expenditures</p>
        </div>
        
        {canManageAssignments && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddAssignmentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Assign Asset
            </button>
            <button
              onClick={() => setShowAddExpenditureModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Zap className="h-5 w-5 mr-2" />
              Record Expenditure
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline-block mr-2" />
            Assignments ({filteredAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenditures')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenditures'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="h-4 w-4 inline-block mr-2" />
            Expenditures ({filteredExpenditures.length})
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
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

            {activeTab === 'assignments' && (
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
              </select>
            )}
            
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

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.assignment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.asset.model_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.asset.serial_number || assignment.asset.equipment_type.type_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.assigned_to.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.assigned_to.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(assignment.assignment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.base_of_assignment.base_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {assignment.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {assignment.is_active ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-gray-500" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Returned
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedItem(assignment);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
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
          
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No assignments found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Expenditures Table */}
      {activeTab === 'expenditures' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Expended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenditures.map((expenditure) => (
                  <tr key={expenditure.expenditure_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {expenditure.asset.model_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expenditure.asset.equipment_type.type_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {expenditure.quantity_expended.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(expenditure.expenditure_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expenditure.base.base_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {expenditure.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expenditure.reported_by.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedItem(expenditure);
                          setShowViewModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
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
          
          {filteredExpenditures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No expenditures found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Assignment Modal */}
      <Modal
        isOpen={showAddAssignmentModal}
        onClose={() => setShowAddAssignmentModal(false)}
        title="Assign Asset to Personnel"
        size="lg"
      >
        <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset
              </label>
              <select
                value={newAssignment.assetId}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, assetId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select asset...</option>
                {mockAssets.filter(asset => !asset.is_fungible).map(asset => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.model_name} {asset.serial_number ? `(${asset.serial_number})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                value={newAssignment.assignedToUserId}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, assignedToUserId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select personnel...</option>
                {availablePersonnel.map(person => (
                  <option key={person.user_id} value={person.user_id}>
                    {person.full_name} ({person.username})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base of Assignment
              </label>
              <select
                value={newAssignment.baseId}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, baseId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {userBases.map(base => (
                  <option key={base.base_id} value={base.base_id}>
                    {base.base_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return Date (Optional)
              </label>
              <input
                type="date"
                value={newAssignment.expectedReturnDate}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Assignment
            </label>
            <input
              type="text"
              value={newAssignment.purpose}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, purpose: e.target.value }))}
              required
              placeholder="e.g., Training operations, Field deployment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={newAssignment.notes}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddAssignmentModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Assign Asset
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expenditure Modal */}
      <Modal
        isOpen={showAddExpenditureModal}
        onClose={() => setShowAddExpenditureModal(false)}
        title="Record Asset Expenditure"
        size="lg"
      >
        <form onSubmit={handleExpenditureSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <select
                value={newExpenditure.assetId}
                onChange={(e) => setNewExpenditure(prev => ({ ...prev, assetId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select asset...</option>
                {mockAssets.filter(asset => asset.is_fungible).map(asset => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.model_name} ({asset.equipment_type.type_name})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Expended
              </label>
              <input
                type="number"
                value={newExpenditure.quantityExpended}
                onChange={(e) => setNewExpenditure(prev => ({ ...prev, quantityExpended: e.target.value }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base
              </label>
              <select
                value={newExpenditure.baseId}
                onChange={(e) => setNewExpenditure(prev => ({ ...prev, baseId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {userBases.map(base => (
                  <option key={base.base_id} value={base.base_id}>
                    {base.base_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Expenditure
              </label>
              <select
                value={newExpenditure.reason}
                onChange={(e) => setNewExpenditure(prev => ({ ...prev, reason: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select reason...</option>
                <option value="Training">Training</option>
                <option value="Combat Operation">Combat Operation</option>
                <option value="Damage">Damage</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={newExpenditure.notes}
              onChange={(e) => setNewExpenditure(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Provide additional details about the expenditure..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddExpenditureModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Record Expenditure
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`${'assignment_id' in selectedItem ? 'Assignment' : 'Expenditure'} Details`}
          size="lg"
        >
          <div className="p-6 space-y-6">
            {'assignment_id' in selectedItem ? (
              // Assignment details
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Asset</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.asset.model_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedItem.asset.serial_number || selectedItem.asset.equipment_type.type_name}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.assigned_to.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedItem.assigned_to.email}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Assignment Date</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(selectedItem.assignment_date)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Base</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.base_of_assignment.base_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedItem.base_of_assignment.location}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <div className="flex items-center space-x-2">
                      {selectedItem.is_active ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-semibold text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-gray-500" />
                          <span className="text-lg font-semibold text-gray-600">Returned</span>
                          {selectedItem.returned_date && (
                            <span className="text-sm text-gray-500">
                              on {format(selectedItem.returned_date)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedItem.expected_return_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Expected Return</h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(selectedItem.expected_return_date)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Purpose</h4>
                  <p className="text-gray-900">{selectedItem.purpose}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Recorded By</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedItem.recorded_by.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(selectedItem.created_at)}
                  </p>
                </div>
              </>
            ) : (
              // Expenditure details
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Asset</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.asset.model_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedItem.asset.equipment_type.type_name}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity Expended</h4>
                    <p className="text-lg font-semibold text-red-600">
                      {selectedItem.quantity_expended.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Expenditure Date</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(selectedItem.expenditure_date)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Base</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedItem.base.base_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedItem.base.location}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Reason</h4>
                  <p className="text-gray-900">{selectedItem.reason}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Reported By</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedItem.reported_by.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(selectedItem.created_at)}
                  </p>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Assignments;