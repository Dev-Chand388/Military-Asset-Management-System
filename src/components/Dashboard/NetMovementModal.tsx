import React from 'react';
import Modal from '../Common/Modal';
import { DashboardMetrics } from '../../types';
import { format } from '../../utils/dateUtils';

interface NetMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DashboardMetrics | null;
}

const NetMovementModal: React.FC<NetMovementModalProps> = ({ isOpen, onClose, metrics }) => {
  if (!metrics) return null;

  const { netMovementDetails } = metrics;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Net Movement Breakdown" 
      size="xl"
    >
      <div className="p-6 space-y-8">
        {/* Purchases Section */}
        <div>
          <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
            <span className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
              +
            </span>
            Purchases ({netMovementDetails.purchases.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {netMovementDetails.purchases.map((purchase) => (
                  <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{purchase.asset.model_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{purchase.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{format(purchase.purchase_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{purchase.receiving_base.base_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{purchase.supplier_info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfers In Section */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <span className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
              ↓
            </span>
            Transfers In ({netMovementDetails.transfersIn.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {netMovementDetails.transfersIn.map((transfer) => (
                  <tr key={transfer.transfer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{transfer.asset.model_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transfer.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{transfer.source_base.base_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{transfer.destination_base.base_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{format(transfer.transfer_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transfer.status === 'Received' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfers Out Section */}
        <div>
          <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <span className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
              ↑
            </span>
            Transfers Out ({netMovementDetails.transfersOut.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {netMovementDetails.transfersOut.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No outbound transfers in selected period
                    </td>
                  </tr>
                ) : (
                  netMovementDetails.transfersOut.map((transfer) => (
                    <tr key={transfer.transfer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.asset.model_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{transfer.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transfer.source_base.base_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transfer.destination_base.base_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{format(transfer.transfer_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transfer.status === 'Received' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NetMovementModal;