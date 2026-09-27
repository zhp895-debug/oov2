import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { StockBalance, StockTransaction, KitchenRequisition, PurchaseOrder, InventoryItem } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  Trash2,
  ChevronRight,
  Sparkles,
  Plus,
  Compass,
  Package,
  Boxes,
  ChefHat,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { NavTab } from '../components/layout/Sidebar';
import OliveOrangeLogo from '../components/common/OliveOrangeLogo';

interface DashboardProps {
  balances: StockBalance[];
  transactions: StockTransaction[];
  requisitions: KitchenRequisition[];
  pos: PurchaseOrder[];
  items: InventoryItem[];
  onNavigate: (tab: NavTab) => void;
  onOpenNewPO: () => void;
  onOpenNewReq: () => void;
  onStartTour?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  balances,
  transactions,
  requisitions,
  pos,
  items,
  onNavigate,
  onOpenNewPO,
  onOpenNewReq,
  onStartTour
}) => {
  const [dbDashboard, setDbDashboard] = useState<any>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  useEffect(() => {
    apiFetch('/api/inventory/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setDbDashboard(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Calculated Metrics
  const totalValuation = dbDashboard ? dbDashboard.totalStockValue : balances.reduce((sum, b) => sum + b.totalValuation, 0);

  const lowStockBalances = dbDashboard && Array.isArray(dbDashboard.lowStockItems)
    ? dbDashboard.lowStockItems
    : balances.filter(b => {
        const itemDef = items.find(i => i.id === b.itemId);
        const reorder = itemDef ? itemDef.reorderLevel : 15;
        return b.currentStock <= reorder;
      });

  const criticalOutStockCount = dbDashboard ? dbDashboard.outOfStockItemsCount : balances.filter(b => b.currentStock === 0).length;

  const todayConsumption = transactions
    .filter(t => t.type === 'KITCHEN_CONSUMPTION')
    .reduce((sum, t) => sum + Math.abs(t.totalAmount), 0);

  const todayWastage = transactions
    .filter(t => t.type === 'WASTAGE_LOG')
    .reduce((sum, t) => sum + Math.abs(t.totalAmount), 0);

  const pendingApprovalsCount = pos.filter(p => p.status === 'PENDING_APPROVAL').length +
    requisitions.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Interactive Welcome & Tour Hero Banner */}
      {showWelcomeBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3D4A1E] via-[#2F3917] to-[#1E250E] text-white p-6 sm:p-7 shadow-lg border border-[#526328]/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/30 text-orange-200 border border-orange-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-300" />
                  OliveOrange Technologies ERP
                </span>
                <span className="text-xs text-amber-200/80 italic">
                  "Every Problem Has a Solution"
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Unified Stock & Kitchen Enterprise Management
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
                Seamless real-time traceability across multi-godown stock balances, supplier purchasing, chef batch recipes, physical cycle audits, and live cost analytics.
              </p>
            </div>

            {/* Quick Tour & Module Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              {onStartTour && (
                <button
                  onClick={onStartTour}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-orange-950/20 cursor-pointer active:scale-95 group"
                >
                  <Compass className="w-4 h-4 text-amber-100 group-hover:rotate-45 transition-transform" />
                  <span>Start 60s App Tour</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('kitchen')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-[#EA580C]" />
                <span>New Indent</span>
              </button>

              <button
                onClick={() => onNavigate('purchasing')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Create PO</span>
              </button>
            </div>
          </div>

          {/* Fast Navigation Quick Links */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mr-1">
              Quick Shortcuts:
            </span>
            <button
              onClick={() => onNavigate('item-master')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-orange-300" />
              <span>Item Master</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5 text-orange-300" />
              <span>FIFO Batches</span>
            </button>
            <button
              onClick={() => onNavigate('recipe-bom')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-300" />
              <span>Recipe BOM</span>
            </button>
            <button
              onClick={() => onNavigate('stock-audit')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-orange-300" />
              <span>Stock Audit</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-orange-300" />
              <span>Cost Reports</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Stock Value
            </p>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#3D4A1E] transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-[#3D4A1E] mt-1">
            ₹{totalValuation.toLocaleString()}
          </h3>
          <div className="mt-2 flex items-center text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>↑ 4.2%</span>
            <span className="ml-1 text-stone-400 font-normal">vs last month</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Low Stock Alerts
            </p>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#EA580C] transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-[#EA580C] mt-1">
            {lowStockBalances.length} Items
          </h3>
          <div className="mt-2 flex items-center text-xs text-rose-600 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            <span>{criticalOutStockCount} critical out-of-stock</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('recipe-bom')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Today's Consumption
            </p>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#3D4A1E] transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-[#3D4A1E] mt-1">
            ₹{todayConsumption.toLocaleString() || '42,800'}
          </h3>
          <div className="mt-2 flex items-center text-xs text-stone-500 font-medium">
            <Flame className="w-3.5 h-3.5 text-[#EA580C] mr-1" />
            <span>78 Thali & Banquet Batches</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('kitchen')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Today's Wastage
            </p>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-rose-600 mt-1">
            ₹{todayWastage ? todayWastage.toLocaleString() : '3,210'}
          </h3>
          <div className="mt-2 flex items-center text-xs text-stone-500 font-medium">
            <Trash2 className="w-3.5 h-3.5 text-rose-500 mr-1" />
            <span>1.4% of total prep value</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Low Stock Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Critical Low Stock Items</h4>
              <p className="text-xs text-stone-500">Items requiring immediate purchase order or store requisition</p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-[#3D4A1E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 text-[10px] uppercase text-stone-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Item / SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Current Stock</th>
                  <th className="px-6 py-3">Reorder Lvl</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-stone-700 divide-y divide-stone-100">
                {lowStockBalances.map((b, idx) => {
                  const itemDef = items.find(i => i.id === b.itemId);
                  const reorder = itemDef ? itemDef.reorderLevel : 15;
                  let status = 'LOW STOCK';
                  if (b.currentStock === 0) status = 'OUT OF STOCK';
                  else if (b.currentStock < reorder / 2) status = 'CRITICAL';

                  const rowKey = b.id || `${b.itemId || 'item'}-${b.storeId || 'store'}-${b.itemCode || ''}-${idx}`;

                  return (
                    <tr key={rowKey} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <div className="font-bold text-stone-900">{b.itemName}</div>
                        <span className="text-[10px] text-stone-400 font-mono">{b.itemCode}</span>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">{b.category}</td>
                      <td className="px-6 py-4 font-bold text-stone-900">
                        {b.currentStock} {b.unit}
                      </td>
                      <td className="px-6 py-4 text-stone-500 font-semibold">{reorder} {b.unit}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}

                {lowStockBalances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-stone-400 text-xs">
                      All inventory items are currently above healthy reorder thresholds!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Column (1 col) */}
        <div className="flex flex-col gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6">
            <h4 className="font-bold text-stone-900 text-sm mb-4">Recent Stock Activities</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 bg-[#3D4A1E] rounded-full" />
                <div>
                  <p className="text-xs text-stone-700">
                    <strong>Kitchen Manager</strong> requested 35 Ltr Milk
                  </p>
                  <p className="text-[10px] text-stone-400">12 mins ago • Main Kitchen Pantry</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1 bg-[#EA580C] rounded-full" />
                <div>
                  <p className="text-xs text-stone-700">
                    <strong>GRN Approved</strong> for Gujarat Agro Grain Traders
                  </p>
                  <p className="text-[10px] text-stone-400">45 mins ago • PO #1084</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1 bg-rose-500 rounded-full" />
                <div>
                  <p className="text-xs text-stone-700">
                    <strong>Wastage Logged:</strong> 3.5kg Tomato Spoilage
                  </p>
                  <p className="text-[10px] text-stone-400">2 hours ago • Vegetable Store</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals Card */}
          <div className="bg-[#3D4A1E] rounded-2xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="absolute right-[-10%] bottom-[-20%] w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <h4 className="text-sm font-bold mb-2 text-amber-100">Pending Control Approvals</h4>
            <p className="text-3xl font-light mb-4">{pendingApprovalsCount.toString().padStart(2, '0')}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-medium">
                {pos.filter(p => p.status === 'PENDING_APPROVAL').length} POs
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-medium">
                {requisitions.filter(r => r.status === 'PENDING').length} Transfers
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-medium">1 Stock Audit</span>
            </div>
            <button
              onClick={() => onNavigate('purchasing')}
              className="mt-6 w-full py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer text-white text-center block"
            >
              Review Pending Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

