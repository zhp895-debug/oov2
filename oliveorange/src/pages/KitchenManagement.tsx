import React, { useState } from 'react';
import { KitchenRequisition, WastageLog, InventoryItem, Store, RequisitionStatus, WastageReason } from '../types';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChefHat, Plus, Trash2, CheckCircle2, ArrowRightLeft, AlertTriangle } from 'lucide-react';

interface KitchenManagementProps {
  requisitions: KitchenRequisition[];
  wastageLogs: WastageLog[];
  items: InventoryItem[];
  stores: Store[];
  onCreateRequisition: (req: Partial<KitchenRequisition>) => void;
  onUpdateReqStatus: (id: string, status: RequisitionStatus) => void;
  onCreateWastage: (wst: Partial<WastageLog>) => void;
}

export const KitchenManagement: React.FC<KitchenManagementProps> = ({
  requisitions,
  wastageLogs,
  items,
  stores,
  onCreateRequisition,
  onUpdateReqStatus,
  onCreateWastage
}) => {
  const [activeTab, setActiveTab] = useState<'REQUISITIONS' | 'WASTAGE'>('REQUISITIONS');
  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  const [isNewWastageOpen, setIsNewWastageOpen] = useState(false);

  // New Req State
  const [targetKitchenId, setTargetKitchenId] = useState(stores.find(s => s.type === 'KITCHEN')?.id || 'store-2');
  const [mealType, setMealType] = useState<'Lunch' | 'Dinner' | 'Breakfast' | 'Snacks'>('Lunch');
  const [reqItems, setReqItems] = useState<Array<{ itemId: string; requestedQty: number }>>([
    { itemId: items[0]?.id || 'item-1', requestedQty: 10 }
  ]);
  const [reqRemarks, setReqRemarks] = useState('');

  // New Wastage State
  const [wastageStoreId, setWastageStoreId] = useState(stores[1]?.id || 'store-2');
  const [wastageItemId, setWastageItemId] = useState(items[0]?.id || 'item-1');
  const [wastageQty, setWastageQty] = useState(1);
  const [wastageReason, setWastageReason] = useState<WastageReason>('Spoilage');
  const [wastageNotes, setWastageNotes] = useState('');

  const handleAddItemToReq = () => {
    setReqItems([...reqItems, { itemId: items[0]?.id || 'item-1', requestedQty: 5 }]);
  };

  const handleSaveReq = (e: React.FormEvent) => {
    e.preventDefault();
    const kitchenStore = stores.find(s => s.id === targetKitchenId);

    const formattedItems = reqItems.map(ri => {
      const itemDef = items.find(i => i.id === ri.itemId);
      return {
        itemId: ri.itemId,
        itemCode: itemDef ? itemDef.code : 'SKU-00',
        itemName: itemDef ? itemDef.name : 'Unknown',
        unit: itemDef ? itemDef.unit : 'Kg',
        requestedQty: Number(ri.requestedQty),
        issuedQty: Number(ri.requestedQty)
      };
    });

    onCreateRequisition({
      reqNumber: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fromStoreId: 'store-1',
      fromStoreName: 'Central Godown (Main Store)',
      toStoreId: targetKitchenId,
      toStoreName: kitchenStore ? kitchenStore.name : 'Main Prasad Kitchen',
      requestedBy: 'Chef Suresh Kumar',
      mealType,
      status: 'PENDING',
      items: formattedItems,
      remarks: reqRemarks
    });

    setIsNewReqOpen(false);
    setReqItems([{ itemId: items[0]?.id || 'item-1', requestedQty: 10 }]);
    setReqRemarks('');
  };

  const handleSaveWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === wastageStoreId);
    const itm = items.find(i => i.id === wastageItemId);
    if (!itm) return;

    onCreateWastage({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      storeId: wastageStoreId,
      storeName: st ? st.name : 'Main Prasad Kitchen',
      itemId: itm.id,
      itemCode: itm.code,
      itemName: itm.name,
      unit: itm.unit,
      quantity: Number(wastageQty),
      costRate: itm.avgRate,
      totalCost: Number(wastageQty) * itm.avgRate,
      reason: wastageReason,
      reportedBy: 'Kitchen Supervisor',
      notes: wastageNotes
    });

    setIsNewWastageOpen(false);
    setWastageNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#3D4A1E]" />
            <span>Kitchen Store & Requisition Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Internal store transfers, kitchen raw material indents, daily meal preparation & wastage logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewReqOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#EA580C]" />
            <span>New Kitchen Indent</span>
          </button>

          <button
            onClick={() => setIsNewWastageOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Log Spoilage / Wastage</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('REQUISITIONS')}
          className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'REQUISITIONS'
              ? 'border-[#EA580C] text-[#3D4A1E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Kitchen Indent Requisitions ({requisitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WASTAGE')}
          className={`pb-3 px-1 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'WASTAGE'
              ? 'border-[#EA580C] text-[#3D4A1E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Daily Wastage Logs ({wastageLogs.length})</span>
        </button>
      </div>

      {/* REQUISITIONS TAB */}
      {activeTab === 'REQUISITIONS' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Req Number</th>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-4 py-3">Meal Type</th>
                  <th className="px-4 py-3">Source Store</th>
                  <th className="px-4 py-3">Target Kitchen</th>
                  <th className="px-4 py-3">Items Requested</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#3D4A1E]">{req.reqNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{req.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{req.mealType || 'General'}</td>
                    <td className="px-4 py-3 text-gray-600">{req.fromStoreName}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{req.toStoreName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {req.items.length} Items ({req.items.map(i => i.itemName).slice(0, 2).join(', ')}...)
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => onUpdateReqStatus(req.id, 'APPROVED')}
                          className="px-3 py-1 bg-[#3D4A1E] text-white rounded text-[11px] font-bold hover:bg-[#2C3616] cursor-pointer"
                        >
                          Approve & Transfer Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WASTAGE TAB */}
      {activeTab === 'WASTAGE' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Kitchen Store</th>
                  <th className="px-4 py-3">Item / SKU</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Cost Value (₹)</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Reported By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wastageLogs.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 font-mono">{w.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{w.storeName}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{w.itemName}</div>
                      <span className="text-[10px] text-gray-400 font-mono">{w.itemCode}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-700">
                      {w.quantity} {w.unit}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-rose-700">
                      ₹ {w.totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.reason} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{w.reportedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Requisition Modal */}
      <Modal
        isOpen={isNewReqOpen}
        onClose={() => setIsNewReqOpen(false)}
        title="Create Kitchen Store Requisition Indent"
        subtitle="Transfer raw materials from Central Store to Kitchen"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveReq} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Kitchen Section</label>
              <select
                value={targetKitchenId}
                onChange={(e) => setTargetKitchenId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg font-bold text-gray-900"
              >
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Meal / Batch Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              >
                <option value="Lunch">Lunch Thali Prep</option>
                <option value="Dinner">Dinner Meal Prep</option>
                <option value="Breakfast">Morning Prasad / Breakfast</option>
                <option value="Snacks">Sweets & Snacks Batch</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Requested Ingredients</span>
              <button
                type="button"
                onClick={handleAddItemToReq}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold text-xs cursor-pointer"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-2">
              {reqItems.map((ri, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <select
                    value={ri.itemId}
                    onChange={(e) => {
                      const updated = [...reqItems];
                      updated[idx].itemId = e.target.value;
                      setReqItems(updated);
                    }}
                    className="flex-1 p-1.5 border border-gray-300 rounded font-medium"
                  >
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>

                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Qty Needed"
                      value={ri.requestedQty}
                      onChange={(e) => {
                        const updated = [...reqItems];
                        updated[idx].requestedQty = Number(e.target.value);
                        setReqItems(updated);
                      }}
                      className="w-full p-1.5 border border-gray-300 rounded font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Preparation Indent Remarks</label>
            <input
              type="text"
              placeholder="e.g. For 500 visitors afternoon meal batch"
              value={reqRemarks}
              onChange={(e) => setReqRemarks(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsNewReqOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Submit Kitchen Indent
            </button>
          </div>
        </form>
      </Modal>

      {/* New Wastage Modal */}
      <Modal
        isOpen={isNewWastageOpen}
        onClose={() => setIsNewWastageOpen(false)}
        title="Log Kitchen Spoilage / Wastage"
        subtitle="Mandatory reporting for unconsumed or damaged raw materials"
        maxWidth="md"
      >
        <form onSubmit={handleSaveWastage} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Store / Kitchen Location</label>
            <select
              value={wastageStoreId}
              onChange={(e) => setWastageStoreId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Raw Material Item</label>
            <select
              value={wastageItemId}
              onChange={(e) => setWastageItemId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Wasted Quantity</label>
            <input
              type="number"
              step="0.01"
              value={wastageQty}
              onChange={(e) => setWastageQty(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg font-bold text-rose-700 text-base"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Primary Reason</label>
            <select
              value={wastageReason}
              onChange={(e) => setWastageReason(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              <option value="Spoilage">Natural Spoilage / Mold</option>
              <option value="Preparation Loss">Preparation / Sorting Loss</option>
              <option value="Over-Cooking">Cooking Over-exposure</option>
              <option value="Expired">Past Shelf Expiry Date</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Detailed Explanation</label>
            <textarea
              rows={2}
              placeholder="e.g. Softened during transport handling..."
              value={wastageNotes}
              onChange={(e) => setWastageNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsNewWastageOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Record Wastage Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
