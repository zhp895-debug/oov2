import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import {
  Boxes,
  Search,
  Download,
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  RotateCcw,
  Layers,
  FileText,
  Calendar,
  X,
  Building,
  Check
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ExportModal } from '../components/ui/ExportModal';

type SubTab = 'stock' | 'ledger' | 'opening-stock' | 'adjustments' | 'expiring' | 'transfers';

export const InventoryView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('stock');

  // Shared Data States loaded from Database APIs
  const [items, setItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Ledger States
  const [selectedLedgerItemId, setSelectedLedgerItemId] = useState<string>('');
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [loadingLedger, setLoadingLedger] = useState<boolean>(false);

  // Opening Stock Form State
  const [opItemId, setOpItemId] = useState('');
  const [opStoreId, setOpStoreId] = useState('');
  const [opQty, setOpQty] = useState('');
  const [opRate, setOpRate] = useState('');
  const [opBatch, setOpBatch] = useState('');
  const [opExpiry, setOpExpiry] = useState('');
  const [opRemarks, setOpRemarks] = useState('');

  // Adjustment Form State
  const [adjItemId, setAdjItemId] = useState('');
  const [adjStoreId, setAdjStoreId] = useState('');
  const [adjType, setAdjType] = useState<'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'>('ADJUSTMENT_IN');
  const [adjQty, setAdjQty] = useState('');
  const [adjRate, setAdjRate] = useState('');
  const [adjReason, setAdjReason] = useState('Physical count correction');
  const [adjRemarks, setAdjRemarks] = useState('');

  // Expiring Batches State
  const [expiringDays, setExpiringDays] = useState('15');
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);

  // Store Transfers State
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [trfFromStoreId, setTrfFromStoreId] = useState('');
  const [trfToStoreId, setTrfToStoreId] = useState('');
  const [trfRemarks, setTrfRemarks] = useState('');
  const [trfItems, setTrfItems] = useState<Array<{ itemId: string; quantity: string; batchNumber: string }>>([
    { itemId: '', quantity: '10', batchNumber: '' }
  ]);

  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load items and stores on mount
  useEffect(() => {
    fetchItemsAndStores();
    fetchStockList();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'stock') fetchStockList();
    if (activeSubTab === 'expiring') fetchExpiringBatches();
    if (activeSubTab === 'transfers') fetchTransfers();
  }, [activeSubTab, selectedStoreId, selectedCategory, selectedStatus, expiringDays]);

  // Fetch Ledger when ledger item changes
  useEffect(() => {
    if (selectedLedgerItemId) {
      fetchLedger(selectedLedgerItemId);
    }
  }, [selectedLedgerItemId]);

  const fetchItemsAndStores = async () => {
    try {
      const [resItems, resStores] = await Promise.all([
        apiFetch('/api/items'),
        apiFetch('/api/inventory/stock')
      ]);
      const dataItems = await resItems.json();
      if (Array.isArray(dataItems)) setItems(dataItems);

      // Unique stores from backend
      const resStoresRaw = await apiFetch('/api/inventory/stock');
      const dataStock = await resStoresRaw.json();
      if (Array.isArray(dataStock)) {
        const uniqueStores = Array.from(new Set(dataStock.map((s: any) => JSON.stringify({ id: s.storeId, name: s.storeName }))))
          .map((s: any) => JSON.parse(s));
        setStores(uniqueStores);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchStockList = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedStoreId !== 'ALL') query.append('storeId', selectedStoreId);
      if (selectedCategory !== 'ALL') query.append('categoryId', selectedCategory);
      if (selectedStatus !== 'ALL') query.append('status', selectedStatus);
      if (searchTerm) query.append('search', searchTerm);

      const res = await apiFetch(`/api/inventory/stock?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setStockList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (itemId: string) => {
    setLoadingLedger(true);
    try {
      const res = await apiFetch(`/api/inventory/ledger/${itemId}`);
      const data = await res.json();
      if (Array.isArray(data)) setLedgerData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const fetchExpiringBatches = async () => {
    try {
      const res = await apiFetch(`/api/inventory/expiring?days=${expiringDays}`);
      const data = await res.json();
      if (Array.isArray(data)) setExpiringBatches(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchTransfers = async () => {
    try {
      const res = await apiFetch('/api/transfers');
      const data = await res.json();
      if (Array.isArray(data)) setTransfers(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Submit Opening Stock
  const handleCreateOpeningStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiFetch('/api/inventory/opening-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: opItemId,
          storeId: opStoreId,
          quantity: opQty,
          rate: opRate,
          batchNumber: opBatch,
          expiryDate: opExpiry,
          remarks: opRemarks,
          user: 'Store Admin'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create opening stock.');
      }

      setSuccessMsg(`Successfully created opening stock for ${data.quantity} units!`);
      setOpItemId('');
      setOpQty('');
      setOpRate('');
      setOpBatch('');
      setOpExpiry('');
      setOpRemarks('');
      fetchStockList();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Submit Adjustment
  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiFetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: adjItemId,
          storeId: adjStoreId,
          adjustmentType: adjType,
          quantity: adjQty,
          rate: adjRate,
          reason: adjReason,
          remarks: adjRemarks,
          user: 'Store Auditor'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post adjustment.');
      }

      setSuccessMsg(`Stock adjustment posted successfully (${data.quantity} units)!`);
      setAdjItemId('');
      setAdjQty('');
      setAdjRate('');
      setAdjRemarks('');
      fetchStockList();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Transfer Actions
  const handleApproveTransfer = async (id: string) => {
    try {
      const res = await apiFetch(`/api/transfers/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Store Manager' })
      });
      if (res.ok) fetchTransfers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatchTransfer = async (id: string) => {
    setErrorMsg(null);
    try {
      const res = await apiFetch(`/api/transfers/${id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchedBy: 'Store Manager' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch transfer.');
      fetchTransfers();
      fetchStockList();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleReceiveTransfer = async (id: string) => {
    setErrorMsg(null);
    try {
      const res = await apiFetch(`/api/transfers/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedBy: 'Store Receiver' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to receive transfer.');
      fetchTransfers();
      fetchStockList();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStoreId: trfFromStoreId,
          toStoreId: trfToStoreId,
          items: trfItems.filter(i => i.itemId && Number(i.quantity) > 0),
          requestedBy: 'Kitchen Executive',
          remarks: trfRemarks
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create transfer request.');

      setIsNewTransferOpen(false);
      fetchTransfers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#3D4A1E]" />
            <span>OliveOrange Transactional Stock Engine</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable transaction ledger, PostgreSQL database stock balances, FEFO expiry & store transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export Stock Report</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-lg text-rose-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-amber-50 border-l-4 border-[#3D4A1E] rounded-r-lg text-[#3D4A1E] text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#EA580C] font-bold">Dismiss</button>
        </div>
      )}

      {/* Phase 2 Navigation Sub-Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 gap-2 bg-white p-2 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'stock'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Balances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'ledger'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('opening-stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'opening-stock'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Opening Stock Entry</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adjustments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'adjustments'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stock Adjustments</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expiring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'expiring'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Expiring Batches</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'transfers'
              ? 'bg-[#3D4A1E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Store Transfers</span>
        </button>
      </div>

      {/* 1. STOCK BALANCES TAB */}
      {activeSubTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Database Stock by Item Name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="font-semibold">Store:</span>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                >
                  <option value="ALL">All Stores</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="font-semibold">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="HEALTHY">Healthy</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Item Code</th>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3">Available Qty</th>
                    <th className="px-4 py-3">Avg Rate (₹)</th>
                    <th className="px-4 py-3">Stock Value (₹)</th>
                    <th className="px-4 py-3">Stock Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockList.map((row, idx) => (
                    <tr key={`${row.itemId}-${row.storeId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#3D4A1E]">{row.itemCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{row.itemName}</div>
                        <div className="text-[10px] text-gray-400">{row.category}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{row.storeName}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {row.availableQuantity} {row.unit}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">₹ {row.averageRate}</td>
                      <td className="px-4 py-3 font-extrabold text-[#3D4A1E]">
                        ₹ {row.stockValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedLedgerItemId(row.itemId);
                            setActiveSubTab('ledger');
                          }}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stockList.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                        No inventory stock records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. STOCK LEDGER TAB */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Item Stock Movement Ledger</h3>
              <p className="text-xs text-gray-500">Chronological audit trail with real-time running balance</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-700">Select Item:</label>
              <select
                value={selectedLedgerItemId}
                onChange={(e) => setSelectedLedgerItemId(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none min-w-[220px]"
              >
                <option value="">-- Choose Item --</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
              </select>
            </div>
          </div>

          {selectedLedgerItemId ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Txn Type</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Store</th>
                    <th className="p-3">Batch / Exp</th>
                    <th className="p-3 text-right">In Qty</th>
                    <th className="p-3 text-right">Out Qty</th>
                    <th className="p-3 text-right">Running Balance</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {ledgerData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-600">{row.date}</td>
                      <td className="p-3 font-bold text-gray-900">{row.transactionType}</td>
                      <td className="p-3 text-gray-600">{row.reference}</td>
                      <td className="p-3 text-gray-800">{row.storeName}</td>
                      <td className="p-3 font-mono text-gray-500">{row.batchNumber}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        {row.inQty > 0 ? `+${row.inQty}` : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600">
                        {row.outQty > 0 ? `-${row.outQty}` : '-'}
                      </td>
                      <td className="p-3 text-right font-black text-[#3D4A1E] text-sm bg-amber-50/50">
                        {row.balance}
                      </td>
                      <td className="p-3 text-right font-semibold">₹ {row.rate}</td>
                      <td className="p-3 text-gray-500">{row.createdBy}</td>
                    </tr>
                  ))}
                  {ledgerData.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400">
                        No transaction history found for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 font-medium bg-gray-50 rounded-lg border border-dashed border-gray-300">
              Please select an item above to view its stock movement ledger.
            </div>
          )}
        </div>
      )}

      {/* 3. OPENING STOCK ENTRY TAB */}
      {activeSubTab === 'opening-stock' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#3D4A1E]" />
              <span>Record Opening Stock</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Creates an immutable INVENTORY_OPENING transaction in PostgreSQL database
            </p>
          </div>

          <form onSubmit={handleCreateOpeningStock} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item *</label>
                <select
                  required
                  value={opItemId}
                  onChange={(e) => {
                    setOpItemId(e.target.value);
                    const itm = items.find(i => i.id === e.target.value);
                    if (itm) setOpRate(String(itm.purchaseRate));
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium bg-gray-50"
                >
                  <option value="">-- Select Item --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Store *</label>
                <select
                  required
                  value={opStoreId}
                  onChange={(e) => setOpStoreId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium bg-gray-50"
                >
                  <option value="">-- Select Store --</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Opening Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 100"
                  value={opQty}
                  onChange={(e) => setOpQty(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit Cost Rate (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 110"
                  value={opRate}
                  onChange={(e) => setOpRate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-2026-001"
                  value={opBatch}
                  onChange={(e) => setOpBatch(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={opExpiry}
                  onChange={(e) => setOpExpiry(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Remarks / Audit Note</label>
              <textarea
                rows={2}
                placeholder="Initial physical count notes..."
                value={opRemarks}
                onChange={(e) => setOpRemarks(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              Post Opening Stock Transaction
            </button>
          </form>
        </div>
      )}

      {/* 4. STOCK ADJUSTMENTS TAB */}
      {activeSubTab === 'adjustments' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3D4A1E]" />
              <span>Record Stock Adjustment</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Requires a mandatory reason. Creates ADJUSTMENT_IN or ADJUSTMENT_OUT transaction.
            </p>
          </div>

          <form onSubmit={handleCreateAdjustment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Adjustment Type *</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-gray-800 bg-gray-50"
                >
                  <option value="ADJUSTMENT_IN">Adjustment IN (+ Increase)</option>
                  <option value="ADJUSTMENT_OUT">Adjustment OUT (- Decrease)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Compulsory Reason *</label>
                <select
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium bg-gray-50"
                >
                  <option value="Physical count correction">Physical count correction</option>
                  <option value="Damaged stock write-off">Damaged stock write-off</option>
                  <option value="System entry correction">System entry correction</option>
                  <option value="Found stock">Found stock</option>
                  <option value="Supplier return adjustment">Supplier return adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Item *</label>
                <select
                  required
                  value={adjItemId}
                  onChange={(e) => {
                    setAdjItemId(e.target.value);
                    const itm = items.find(i => i.id === e.target.value);
                    if (itm) setAdjRate(String(itm.purchaseRate));
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium bg-gray-50"
                >
                  <option value="">-- Select Item --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Store *</label>
                <select
                  required
                  value={adjStoreId}
                  onChange={(e) => setAdjStoreId(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-medium bg-gray-50"
                >
                  <option value="">-- Select Store --</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Adjustment Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Rate (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjRate}
                  onChange={(e) => setAdjRate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Detailed Remarks</label>
              <textarea
                rows={2}
                placeholder="Audit explanation for adjustment..."
                value={adjRemarks}
                onChange={(e) => setAdjRemarks(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              Post Adjustment Transaction
            </button>
          </form>
        </div>
      )}

      {/* 5. EXPIRING BATCHES TAB */}
      {activeSubTab === 'expiring' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">FEFO Expiring Batches Tracker</h3>
              <p className="text-xs text-gray-500">First Expire First Out monitoring for perishable goods</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Expiry Window:</span>
              <select
                value={expiringDays}
                onChange={(e) => setExpiringDays(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
              >
                <option value="7">Next 7 Days</option>
                <option value="15">Next 15 Days</option>
                <option value="30">Next 30 Days</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Days Left</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {expiringBatches.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#3D4A1E]">{row.itemCode}</td>
                    <td className="p-3 font-bold text-gray-900">{row.itemName}</td>
                    <td className="p-3 font-mono">{row.batchNumber}</td>
                    <td className="p-3 font-semibold text-gray-700">{row.expiryDate}</td>
                    <td className="p-3 font-bold text-amber-800">{row.daysRemaining} days</td>
                    <td className="p-3 font-extrabold">{row.quantity} {row.unit}</td>
                    <td className="p-3 text-gray-700">{row.storeName}</td>
                    <td className="p-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
                {expiringBatches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No batches expiring within the next {expiringDays} days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. STORE TRANSFERS TAB */}
      {activeSubTab === 'transfers' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Store-to-Store Transfer Workflow</h3>
              <p className="text-xs text-gray-500">Requested → Approved → Dispatched (TRANSFER_OUT) → Received (TRANSFER_IN)</p>
            </div>

            <button
              onClick={() => setIsNewTransferOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#EA580C]" />
              <span>New Transfer Request</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3D4A1E] text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Transfer No</th>
                  <th className="p-3">From Store</th>
                  <th className="p-3">To Store</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#3D4A1E]">{trf.transferNumber}</td>
                    <td className="p-3 text-gray-900 font-semibold">{trf.fromStore?.name}</td>
                    <td className="p-3 text-gray-900 font-semibold">{trf.toStore?.name}</td>
                    <td className="p-3 text-gray-600">{trf.requestedBy}</td>
                    <td className="p-3">
                      <StatusBadge status={trf.status} />
                    </td>
                    <td className="p-3 text-gray-500 font-mono">{trf.createdAt.split('T')[0]}</td>
                    <td className="p-3 text-right space-x-1">
                      {trf.status === 'REQUESTED' && (
                        <button
                          onClick={() => handleApproveTransfer(trf.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded font-bold hover:bg-blue-100"
                        >
                          Approve
                        </button>
                      )}
                      {(trf.status === 'APPROVED' || trf.status === 'REQUESTED') && (
                        <button
                          onClick={() => handleDispatchTransfer(trf.id)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded font-bold hover:bg-amber-100"
                        >
                          Dispatch
                        </button>
                      )}
                      {trf.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleReceiveTransfer(trf.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded font-bold hover:bg-emerald-100"
                        >
                          Receive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No store transfer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Transfer Request Modal */}
      <Modal
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        title="Create Store-to-Store Transfer Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTransferRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Source Store (From) *</label>
            <select
              required
              value={trfFromStoreId}
              onChange={(e) => setTrfFromStoreId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              <option value="">-- Select Source Store --</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Destination Store (To) *</label>
            <select
              required
              value={trfToStoreId}
              onChange={(e) => setTrfToStoreId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              <option value="">-- Select Destination Store --</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Item to Transfer *</label>
            <select
              required
              value={trfItems[0].itemId}
              onChange={(e) => setTrfItems([{ ...trfItems[0], itemId: e.target.value }])}
              className="w-full p-2 border border-gray-300 rounded-lg font-medium"
            >
              <option value="">-- Select Item --</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              required
              value={trfItems[0].quantity}
              onChange={(e) => setTrfItems([{ ...trfItems[0], quantity: e.target.value }])}
              className="w-full p-2 border border-gray-300 rounded-lg font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold"
          >
            Submit Transfer Request
          </button>
        </form>
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Current Stock & Valuation"
        data={stockList}
        filename="OliveOrange_Current_Stock"
      />
    </div>
  );
};
