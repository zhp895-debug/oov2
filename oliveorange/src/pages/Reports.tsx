import React, { useState } from 'react';
import { StockBalance, StockTransaction, WastageLog, InventoryItem, Store } from '../types';
import { ExportModal } from '../components/ui/ExportModal';
import { BarChart3, Download, PieChart, TrendingUp, AlertTriangle, Layers } from 'lucide-react';

interface ReportsProps {
  balances: StockBalance[];
  transactions: StockTransaction[];
  wastageLogs: WastageLog[];
  items: InventoryItem[];
  stores: Store[];
}

export const Reports: React.FC<ReportsProps> = ({
  balances,
  transactions,
  wastageLogs,
  items,
  stores
}) => {
  const [reportType, setReportType] = useState<'VALUATION' | 'CATEGORY' | 'WASTAGE' | 'SLOW_MOVING'>('VALUATION');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Category Breakdown Calculation
  const categoryMap: Record<string, { count: number; totalValuation: number }> = {};
  balances.forEach(b => {
    if (!categoryMap[b.category]) {
      categoryMap[b.category] = { count: 0, totalValuation: 0 };
    }
    categoryMap[b.category].count += 1;
    categoryMap[b.category].totalValuation += b.totalValuation;
  });

  const totalValuationAll = balances.reduce((sum, b) => sum + b.totalValuation, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3D4A1E]" />
            <span>Executive Inventory Reports & Intelligence</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Stock valuation, category breakdown, fast/slow moving items analysis & spoilage audit
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#EA580C]" />
          <span>Export Full Analytics</span>
        </button>
      </div>

      {/* Subtabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold gap-6">
        <button
          onClick={() => setReportType('VALUATION')}
          className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            reportType === 'VALUATION'
              ? 'border-[#EA580C] text-[#3D4A1E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Stock Valuation Report</span>
        </button>

        <button
          onClick={() => setReportType('CATEGORY')}
          className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            reportType === 'CATEGORY'
              ? 'border-[#EA580C] text-[#3D4A1E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category Breakdown</span>
        </button>

        <button
          onClick={() => setReportType('WASTAGE')}
          className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            reportType === 'WASTAGE'
              ? 'border-[#EA580C] text-[#3D4A1E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Wastage & Spoilage Audit</span>
        </button>
      </div>

      {/* Report Content */}
      {reportType === 'VALUATION' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/60 border-b border-amber-200/60 flex items-center justify-between">
            <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Item-wise Current Valuation Summary
            </span>
            <span className="text-xs font-bold text-[#3D4A1E]">
              Total Net Portfolio Value: ₹ {totalValuationAll.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Store Location</th>
                  <th className="px-4 py-3">Current Qty</th>
                  <th className="px-4 py-3">Avg Cost Rate</th>
                  <th className="px-4 py-3">Total Valuation (₹)</th>
                  <th className="px-4 py-3">% Portfolio Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {balances.map((b, idx) => {
                  const share = ((b.totalValuation / (totalValuationAll || 1)) * 100).toFixed(1);
                  return (
                    <tr key={b.id || `${b.itemId}-${b.storeId}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-[#3D4A1E]">{b.itemCode}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{b.itemName}</td>
                      <td className="px-4 py-3 text-gray-600">{b.category}</td>
                      <td className="px-4 py-3 text-gray-600">{b.storeName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{b.currentStock} {b.unit}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">₹ {b.avgRate}</td>
                      <td className="px-4 py-3 font-extrabold text-[#3D4A1E]">₹ {b.totalValuation.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#EA580C] h-full" style={{ width: `${Math.min(Number(share) * 2, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'CATEGORY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categoryMap).map(([cat, data]) => {
            const pct = ((data.totalValuation / (totalValuationAll || 1)) * 100).toFixed(1);
            return (
              <div key={cat} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{cat}</h3>
                <p className="text-xs text-gray-500 mb-4">{data.count} Unique SKUs</p>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category Valuation:</span>
                    <strong className="text-[#3D4A1E]">₹ {data.totalValuation.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Share of Inventory:</span>
                    <strong className="text-[#EA580C]">{pct}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reportType === 'WASTAGE' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50 border-b border-rose-200 font-bold text-rose-900 text-xs uppercase tracking-wider">
            Spoilage & Wastage Financial Loss Summary
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Store Location</th>
                  <th className="px-4 py-3">Item / SKU</th>
                  <th className="px-4 py-3">Quantity Wasted</th>
                  <th className="px-4 py-3">Financial Loss (₹)</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wastageLogs.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-600">{w.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{w.storeName}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{w.itemName} ({w.itemCode})</td>
                    <td className="px-4 py-3 font-bold text-rose-700">{w.quantity} {w.unit}</td>
                    <td className="px-4 py-3 font-extrabold text-rose-700">₹ {w.totalCost.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{w.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="OliveOrange Inventory Analytics Report"
        data={balances}
        filename="OliveOrange_Stock_Report"
      />
    </div>
  );
};
