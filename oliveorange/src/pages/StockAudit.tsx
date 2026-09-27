import React, { useState } from 'react';
import { StockAuditSession, Store, StockBalance, InventoryItem } from '../types';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface StockAuditProps {
  audits: StockAuditSession[];
  stores: Store[];
  balances: StockBalance[];
  items: InventoryItem[];
  onCreateAuditSession: (audit: Partial<StockAuditSession>) => void;
  onPostAuditAdjustment: (auditId: string) => void;
}

export const StockAudit: React.FC<StockAuditProps> = ({
  audits,
  stores,
  balances,
  items,
  onCreateAuditSession,
  onPostAuditAdjustment
}) => {
  const [selectedAudit, setSelectedAudit] = useState<StockAuditSession | null>(audits[0] || null);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);

  // New Audit Session
  const [auditStoreId, setAuditStoreId] = useState(stores[0]?.id || 'store-1');
  const [auditorName, setAuditorName] = useState('Senior Auditor');

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === auditStoreId);
    const storeBalances = balances.filter(b => b.storeId === auditStoreId);

    const auditItems = storeBalances.map(b => ({
      itemId: b.itemId,
      itemCode: b.itemCode,
      itemName: b.itemName,
      unit: b.unit,
      systemQty: b.currentStock,
      physicalQty: b.currentStock, // Initialized to system count for auditing
      differenceQty: 0,
      unitRate: b.avgRate,
      varianceValue: 0
    }));

    onCreateAuditSession({
      auditNumber: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      storeId: auditStoreId,
      storeName: st ? st.name : 'Central Godown',
      auditorName,
      status: 'IN_PROGRESS',
      items: auditItems,
      totalPositiveVariance: 0,
      totalNegativeVariance: 0,
      netVarianceValue: 0
    });

    setIsNewAuditOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#3D4A1E]" />
            <span>Physical Stock Audit & Reconciliation</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Periodic physical stock counts, variance analysis & auditor write-off posting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewAuditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#EA580C]" />
            <span>Start New Audit Session</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Sessions List, Right Session Audit Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Column */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase text-gray-500 tracking-wider px-1">
            Audit Sessions History ({audits.length})
          </div>

          {audits.map((a) => {
            const isSelected = selectedAudit?.id === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setSelectedAudit(a)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3D4A1E] text-white border-[#3D4A1E] shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#3D4A1E]'
                  }`}>
                    {a.auditNumber}
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <h3 className="font-bold text-sm mb-1">{a.storeName}</h3>
                <p className="text-xs opacity-80 mb-2">Auditor: {a.auditorName} • {a.date}</p>

                <div className="flex items-center justify-between text-xs border-t pt-2 opacity-90 border-current/20">
                  <div>Net Variance:</div>
                  <strong className={a.netVarianceValue < 0 ? 'text-rose-300 font-bold' : 'font-bold'}>
                    ₹ {a.netVarianceValue.toLocaleString()}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Verification Table Column */}
        {selectedAudit ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#3D4A1E]">{selectedAudit.auditNumber}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedAudit.storeName} Audit</h3>
                <p className="text-xs text-gray-500">
                  Auditor: {selectedAudit.auditorName} • Date: {selectedAudit.date}
                </p>
              </div>

              {selectedAudit.status === 'COMPLETED' && (
                <button
                  onClick={() => onPostAuditAdjustment(selectedAudit.id)}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Post Variance Adjustment
                </button>
              )}
            </div>

            {/* Audit Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Audited SKUs</span>
                <span className="text-base font-bold text-gray-900">{selectedAudit.items.length} Items</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block">Shortage Variance</span>
                <span className="text-base font-bold text-rose-700">₹ {selectedAudit.totalNegativeVariance.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">Net Variance Impact</span>
                <span className="text-base font-extrabold text-[#3D4A1E]">₹ {selectedAudit.netVarianceValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Audit Items List */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D4A1E] text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">System Qty</th>
                    <th className="p-3">Physical Count</th>
                    <th className="p-3">Variance Qty</th>
                    <th className="p-3 text-right">Impact Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {selectedAudit.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-[#3D4A1E]">{item.itemCode}</td>
                      <td className="p-3 font-bold text-gray-900">{item.itemName}</td>
                      <td className="p-3 font-semibold text-gray-800">{item.systemQty} {item.unit}</td>
                      <td className="p-3 font-bold text-gray-900">{item.physicalQty} {item.unit}</td>
                      <td className={`p-3 font-bold ${item.differenceQty < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {item.differenceQty > 0 ? `+${item.differenceQty}` : item.differenceQty} {item.unit}
                      </td>
                      <td className="p-3 text-right font-extrabold text-[#3D4A1E]">
                        ₹ {item.varianceValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
            Select an audit session to view audit reconciliation
          </div>
        )}
      </div>

      {/* New Audit Modal */}
      <Modal
        isOpen={isNewAuditOpen}
        onClose={() => setIsNewAuditOpen(false)}
        title="Start Physical Stock Audit Session"
        subtitle="Snapshot system stock for physical store verification"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Store to Audit</label>
            <select
              value={auditStoreId}
              onChange={(e) => setAuditStoreId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-bold text-gray-900"
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Lead Auditor Name</label>
            <input
              type="text"
              required
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsNewAuditOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Initialize Audit Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
