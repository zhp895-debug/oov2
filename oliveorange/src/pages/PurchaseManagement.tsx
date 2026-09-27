import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import {
  ShoppingCart,
  FileText,
  Plus,
  Search,
  CheckCircle,
  Truck,
  Building,
  RotateCcw,
  AlertTriangle,
  Clock,
  Eye,
  XCircle,
  TrendingUp,
  Award,
  DollarSign,
  PackageCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const PurchaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REQUISITIONS' | 'ORDERS' | 'GRNS' | 'RETURNS' | 'SUPPLIERS'>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  // Selected Detail Modals
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<any>(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState<any>(null);
  const [viewingDocument, setViewingDocument] = useState<{ type: string; data: any } | null>(null);

  // Creation Modal States
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState<any>(null);

  // Form States
  const [prForm, setPrForm] = useState<any>({
    requestedBy: 'Store Manager',
    storeId: '',
    priority: 'MEDIUM',
    remarks: '',
    items: [{ itemId: '', requestedQuantity: 10, unitId: 'Kg', suggestedSupplierId: '' }]
  });

  const [poForm, setPoForm] = useState<any>({
    supplierId: '',
    storeId: '',
    requisitionId: '',
    paymentTerms: 'Net 30',
    discount: 0,
    shippingAmount: 0,
    createdBy: 'Purchase Manager',
    notes: '',
    items: [{ itemId: '', orderedQuantity: 10, unitPrice: 0, discount: 0, taxRate: 5 }]
  });

  const [grnForm, setGrnForm] = useState<any>({
    purchaseOrderId: '',
    invoiceNumber: '',
    vehicleNumber: '',
    receivedBy: 'Store Receiver',
    remarks: '',
    items: []
  });

  const [returnForm, setReturnForm] = useState<any>({
    supplierId: '',
    storeId: '',
    purchaseOrderId: '',
    grnId: '',
    reason: '',
    createdBy: 'Store Manager',
    items: [{ itemId: '', quantity: 5, unitId: 'Kg', rate: 0, batchNumber: '' }]
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    category: 'Provisions',
    paymentTerms: 'Net 30'
  });

  // Inspection Form State
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);

  // Notification Banner Handler
  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Initial Data Fetching
  const fetchBaseMasterData = async () => {
    try {
      const [itemRes, storeRes, suppRes] = await Promise.all([
        apiFetch('/api/inventory/items'),
        apiFetch('/api/inventory/stores'),
        apiFetch('/api/purchases/suppliers')
      ]);
      if (itemRes.ok) setItems(await itemRes.ok ? await itemRes.json() : []);
      if (storeRes.ok) setStores(await storeRes.json());
      if (suppRes.ok) setSuppliers(await suppRes.json());
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch('/api/purchases/dashboard');
      if (res.ok) setDashboardData(await res.json());
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const fetchRequisitions = async () => {
    try {
      const res = await apiFetch('/api/purchases/requisitions');
      if (res.ok) setRequisitions(await res.json());
    } catch (err) {
      console.error('Error fetching requisitions:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/api/purchases/orders');
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchGRNs = async () => {
    try {
      const res = await apiFetch('/api/purchases/grn');
      if (res.ok) setGrns(await res.json());
    } catch (err) {
      console.error('Error fetching GRNs:', err);
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await apiFetch('/api/purchases/returns');
      if (res.ok) setReturns(await res.json());
    } catch (err) {
      console.error('Error fetching returns:', err);
    }
  };

  useEffect(() => {
    fetchBaseMasterData();
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'DASHBOARD') fetchDashboard();
    if (activeTab === 'REQUISITIONS') fetchRequisitions();
    if (activeTab === 'ORDERS') fetchOrders();
    if (activeTab === 'GRNS') fetchGRNs();
    if (activeTab === 'RETURNS') fetchReturns();
    if (activeTab === 'SUPPLIERS') fetchBaseMasterData();
  }, [activeTab]);

  // Handle PO Selection in GRN Form
  const handlePOSelectForGRN = (poId: string) => {
    const po = orders.find(o => o.id === poId);
    if (!po) return;

    setGrnForm({
      ...grnForm,
      purchaseOrderId: poId,
      items: po.items.map((pi: any) => ({
        purchaseOrderItemId: pi.id,
        itemId: pi.itemId,
        itemName: pi.item.name,
        orderedQuantity: pi.orderedQuantity,
        pendingQuantity: pi.pendingQuantity,
        receivedQuantity: pi.pendingQuantity > 0 ? pi.pendingQuantity : 0,
        acceptedQuantity: pi.pendingQuantity > 0 ? pi.pendingQuantity : 0,
        rejectedQuantity: 0,
        unitId: pi.unitId,
        unitPrice: pi.unitPrice,
        batchNumber: pi.item.batchTracking ? `BATCH-${Date.now().toString().slice(-4)}` : '',
        expiryDate: pi.item.expiryTracking ? new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] : ''
      }))
    });
  };

  // Actions
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/purchases/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create requisition');

      showNotification('success', `Purchase Requisition ${data.requisitionNumber} created successfully.`);
      setIsPRModalOpen(false);
      fetchRequisitions();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePR = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/purchases/requisitions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Store Director' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Requisition ${data.requisitionNumber} Approved.`);
      fetchRequisitions();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/purchases/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PO');

      showNotification('success', `Purchase Order ${data.poNumber} created successfully.`);
      setIsPOModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePO = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/purchases/orders/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Store Director' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Purchase Order ${data.poNumber} Approved! Ready for Goods Receipt.`);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/purchases/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grnForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create GRN');

      showNotification('success', `Goods Received Note ${data.grnNumber} created in DRAFT status.`);
      setIsGRNModalOpen(false);
      fetchGRNs();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInspectModalOpen) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/purchases/grn/${isInspectModalOpen.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectorName: 'Quality Inspector',
          qualityStatus: 'PASSED',
          itemInspections: inspectionItems
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `GRN ${data.grnNumber} Inspected & Quality Status set to PASSED.`);
      setIsInspectModalOpen(null);
      fetchGRNs();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveGRN = async (grnId: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/purchases/grn/${grnId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Store Manager' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `GRN ${data.grnNumber} Approved! PURCHASE_IN Inventory transactions posted.`);
      fetchGRNs();
      fetchDashboard();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/purchases/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Purchase Return ${data.returnNumber} created.`);
      setIsReturnModalOpen(false);
      fetchReturns();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReturn = async (returnId: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/purchases/returns/${returnId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy: 'Store Manager' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Purchase Return ${data.returnNumber} Completed & PURCHASE_RETURN_OUT stock deducted.`);
      fetchReturns();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/purchases/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Supplier ${data.name} added.`);
      setIsSupplierModalOpen(false);
      fetchBaseMasterData();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openSupplierDetail = async (supplierId: string) => {
    try {
      const res = await apiFetch(`/api/purchases/suppliers/${supplierId}`);
      if (res.ok) {
        setSelectedSupplierDetail(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openItemHistory = async (itemId: string) => {
    try {
      const res = await apiFetch(`/api/purchases/items/${itemId}/history`);
      if (res.ok) {
        setSelectedItemHistory(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-lg flex items-center justify-between text-white text-sm font-medium shadow-md transition-all ${
          feedback.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-80 hover:opacity-100 text-lg">×</button>
        </div>
      )}

      {/* Header & Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            Purchase Management & Supplier Workflow
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Phase 3 Engine: Requisitions → PO → GRN → Quality Control → Stock Posting → Purchase Returns
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
          {(['DASHBOARD', 'REQUISITIONS', 'ORDERS', 'GRNS', 'RETURNS', 'SUPPLIERS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); setStatusFilter('ALL'); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ==========================================
          1. PURCHASE DASHBOARD VIEW
      ========================================== */}
      {activeTab === 'DASHBOARD' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase">Pending Requisitions</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{dashboardData.pendingRequisitions}</p>
              <p className="text-[11px] text-amber-600 mt-1">Awaiting Approval</p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase">Open Purchase Orders</span>
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{dashboardData.openPurchaseOrders}</p>
              <p className="text-[11px] text-blue-600 mt-1">{dashboardData.pendingPOApprovals} Pending Approvals</p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase">Today's GRNs</span>
                <Truck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{dashboardData.todaysGRNs}</p>
              <p className="text-[11px] text-emerald-600 mt-1">{dashboardData.pendingGRNs} Pending Inspection/Posting</p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 uppercase">Purchases This Month</span>
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">₹{dashboardData.purchaseValueThisMonth.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-rose-500 mt-1">Returns: ₹{dashboardData.purchaseReturnValue.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Top Purchased Items Table */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Top Purchased Items (By Spend Value)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase bg-stone-50/50 dark:bg-stone-800/50">
                    <th className="p-3">Item Name</th>
                    <th className="p-3 text-right">Total Quantity Received</th>
                    <th className="p-3 text-right">Total Spend Value (₹)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {dashboardData.topPurchasedItems.map((item: any) => (
                    <tr key={item.itemId} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-semibold">{item.itemName}</td>
                      <td className="p-3 text-right font-medium">{item.totalQty}</td>
                      <td className="p-3 text-right font-bold text-amber-700 dark:text-amber-400">
                        ₹{item.totalValue.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openItemHistory(item.itemId)}
                          className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800"
                        >
                          Price History
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dashboardData.topPurchasedItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-stone-500">No purchase transactions posted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. PURCHASE REQUISITIONS VIEW
      ========================================== */}
      {activeTab === 'REQUISITIONS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search PR No or Item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setPrForm({
                  requestedBy: 'Store Manager',
                  storeId: stores[0]?.id || '',
                  priority: 'MEDIUM',
                  remarks: '',
                  items: [{ itemId: items[0]?.id || '', requestedQuantity: 10, unitId: 'Kg', suggestedSupplierId: '' }]
                });
                setIsPRModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Requisition
            </button>
          </div>

          {/* PR Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase font-semibold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">PR Number</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Store</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3 text-center">Items</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {requisitions.map((pr) => (
                    <tr key={pr.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-amber-700 dark:text-amber-400">{pr.requisitionNumber}</td>
                      <td className="p-3">{pr.requestedBy}</td>
                      <td className="p-3">{pr.store?.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pr.priority === 'HIGH' || pr.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}>
                          {pr.priority}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium">{pr.items?.length || 0} Line Items</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          pr.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingDocument({ type: 'PR', data: pr })}
                          className="p-1 text-stone-600 hover:text-amber-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(pr.status === 'DRAFT' || pr.status === 'SUBMITTED') && (
                          <button
                            onClick={() => handleApprovePR(pr.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requisitions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-stone-500">No purchase requisitions found. Create one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. PURCHASE ORDERS VIEW
      ========================================== */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search PO No or Supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setPoForm({
                  supplierId: suppliers[0]?.id || '',
                  storeId: stores[0]?.id || '',
                  paymentTerms: 'Net 30',
                  discount: 0,
                  shippingAmount: 0,
                  createdBy: 'Purchase Manager',
                  notes: '',
                  items: [{ itemId: items[0]?.id || '', orderedQuantity: 10, unitPrice: items[0]?.purchaseRate || 50, discount: 0, taxRate: 5 }]
                });
                setIsPOModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </button>
          </div>

          {/* PO Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase font-semibold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Store</th>
                    <th className="p-3 text-right">Grand Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {orders.map((po) => (
                    <tr key={po.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-amber-700 dark:text-amber-400">{po.poNumber}</td>
                      <td className="p-3 font-medium">{po.supplier?.name}</td>
                      <td className="p-3">{po.store?.name}</td>
                      <td className="p-3 text-right font-bold">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          po.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          po.status === 'PARTIALLY_RECEIVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          po.status === 'FULLY_RECEIVED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingDocument({ type: 'PO', data: po })}
                          className="p-1 text-stone-600 hover:text-amber-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(po.status === 'DRAFT' || po.status === 'PENDING_APPROVAL') && (
                          <button
                            onClick={() => handleApprovePO(po.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                          >
                            Approve PO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-stone-500">No purchase orders found. Create one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          4. GOODS RECEIVED NOTE (GRN) VIEW
      ========================================== */}
      {activeTab === 'GRNS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search GRN No or PO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (orders.filter(o => o.status === 'APPROVED' || o.status === 'PARTIALLY_RECEIVED').length === 0) {
                  showNotification('error', 'No Approved POs available for goods receiving. Please create and approve a PO first.');
                  return;
                }
                const firstPo = orders.find(o => o.status === 'APPROVED' || o.status === 'PARTIALLY_RECEIVED');
                if (firstPo) handlePOSelectForGRN(firstPo.id);
                setIsGRNModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
            >
              <Truck className="w-4 h-4" />
              New Goods Received Note
            </button>
          </div>

          {/* GRN Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase font-semibold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">GRN Number</th>
                    <th className="p-3">PO Reference</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Quality Status</th>
                    <th className="p-3">Posting Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {grns.map((grn) => (
                    <tr key={grn.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-amber-700 dark:text-amber-400">{grn.grnNumber}</td>
                      <td className="p-3 font-medium">{grn.purchaseOrder?.poNumber}</td>
                      <td className="p-3">{grn.supplier?.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          grn.qualityStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {grn.qualityStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          grn.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {grn.status === 'APPROVED' ? 'POSTED TO STOCK' : grn.status}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingDocument({ type: 'GRN', data: grn })}
                          className="p-1 text-stone-600 hover:text-amber-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {grn.status !== 'APPROVED' && (
                          <>
                            <button
                              onClick={() => {
                                setIsInspectModalOpen(grn);
                                setInspectionItems(grn.items.map((gi: any) => ({
                                  id: gi.id,
                                  acceptedQuantity: gi.acceptedQuantity,
                                  rejectedQuantity: gi.rejectedQuantity,
                                  rejectionReason: gi.rejectionReason || '',
                                  batchNumber: gi.batchNumber || '',
                                  expiryDate: gi.expiryDate ? gi.expiryDate.split('T')[0] : ''
                                })));
                              }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-medium"
                            >
                              Inspect Quality
                            </button>

                            <button
                              onClick={() => handleApproveGRN(grn.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium shadow-sm"
                            >
                              Approve & Post Stock
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {grns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-stone-500">No Goods Received Notes found. Create one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          5. PURCHASE RETURNS VIEW
      ========================================== */}
      {activeTab === 'RETURNS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Supplier Returns & Credit Reversals</h2>
            <button
              onClick={() => {
                setReturnForm({
                  supplierId: suppliers[0]?.id || '',
                  storeId: stores[0]?.id || '',
                  reason: 'Quality / Damage Defect',
                  createdBy: 'Store Manager',
                  items: [{ itemId: items[0]?.id || '', quantity: 5, unitId: 'Kg', rate: items[0]?.purchaseRate || 50, batchNumber: '' }]
                });
                setIsReturnModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              New Purchase Return
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase font-semibold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">Return No</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-rose-700 dark:text-rose-400">{ret.returnNumber}</td>
                      <td className="p-3 font-medium">{ret.supplier?.name}</td>
                      <td className="p-3 text-stone-600">{ret.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {ret.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCompleteReturn(ret.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-medium"
                          >
                            Complete Return & Deduct Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {returns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-500">No purchase returns recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          6. SUPPLIER MASTER & HISTORY VIEW
      ========================================== */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Approved Suppliers & Vendor Directories</h2>
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 rounded">
                      {sup.code}
                    </span>
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                      ★ {sup.rating || 5.0}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{sup.name}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{sup.contactPerson} ({sup.phone})</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{sup.address}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-500">Terms: {sup.paymentTerms || 'Net 30'}</span>
                  <button
                    onClick={() => openSupplierDetail(sup.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded"
                  >
                    View History & Metrics
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          SUPPLIER HISTORY MODAL / DRAWER
      ========================================== */}
      {selectedSupplierDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 border border-stone-200 dark:border-stone-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{selectedSupplierDetail.supplier.name}</h3>
                <p className="text-xs text-stone-500">{selectedSupplierDetail.supplier.contactPerson} • {selectedSupplierDetail.supplier.phone}</p>
              </div>
              <button onClick={() => setSelectedSupplierDetail(null)} className="text-stone-400 hover:text-stone-600 text-lg font-bold">✕</button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400">Total Purchase Value</span>
                <p className="text-base font-bold text-amber-600 mt-1">₹{selectedSupplierDetail.metrics.totalPurchaseValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400">Total Orders</span>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">{selectedSupplierDetail.metrics.numberOfPOs}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400">Pending Orders</span>
                <p className="text-base font-bold text-blue-600 mt-1">{selectedSupplierDetail.metrics.pendingPOs}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400">Last Purchase</span>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">{selectedSupplierDetail.metrics.lastPurchaseDate || 'N/A'}</p>
              </div>
            </div>

            {/* Item Wise Purchase History */}
            <div>
              <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Item-Wise Supplied History</h4>
              <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 text-right">Total Qty Supplied</th>
                      <th className="p-2.5 text-right">Last Rate (₹)</th>
                      <th className="p-2.5 text-right">Last Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                    {selectedSupplierDetail.itemWiseHistory.map((h: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{h.itemName}</td>
                        <td className="p-2.5 text-right font-bold">{h.totalQty}</td>
                        <td className="p-2.5 text-right text-amber-600 font-bold">₹{h.lastRate}</td>
                        <td className="p-2.5 text-right text-stone-500">{h.lastDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ITEM PRICE HISTORY MODAL
      ========================================== */}
      {selectedItemHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{selectedItemHistory.item.name}</h3>
                <p className="text-xs text-stone-500">Current Rate: ₹{selectedItemHistory.currentPurchaseRate}/KG • Avg Rate: ₹{selectedItemHistory.averageRate}/KG</p>
              </div>
              <button onClick={() => setSelectedItemHistory(null)} className="text-stone-400 hover:text-stone-600 text-lg font-bold">✕</button>
            </div>

            <div className="overflow-x-auto max-h-60 border border-stone-200 dark:border-stone-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-500 font-semibold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Rate (₹)</th>
                    <th className="p-2.5">Batch / Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {selectedItemHistory.priceHistory.map((h: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{h.date}</td>
                      <td className="p-2.5">{h.supplierName}</td>
                      <td className="p-2.5 text-right font-semibold">{h.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-amber-600">₹{h.unitPrice}</td>
                      <td className="p-2.5 text-stone-500">{h.batchNumber} (Exp: {h.expiryDate})</td>
                    </tr>
                  ))}
                  {selectedItemHistory.priceHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-stone-500">No historical purchase transactions recorded for this item.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">Create Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 font-medium mb-1">Select Supplier *</label>
                  <select
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    required
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-500 font-medium mb-1">Destination Store *</label>
                  <select
                    value={poForm.storeId}
                    onChange={(e) => setPoForm({ ...poForm, storeId: e.target.value })}
                    className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    required
                  >
                    {stores.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-stone-500">Order Items</span>
                  <button
                    type="button"
                    onClick={() => setPoForm({
                      ...poForm,
                      items: [...poForm.items, { itemId: items[0]?.id || '', orderedQuantity: 10, unitPrice: items[0]?.purchaseRate || 50, discount: 0, taxRate: 5 }]
                    })}
                    className="text-amber-600 font-semibold text-[11px] hover:underline"
                  >
                    + Add Line Item
                  </button>
                </div>

                {poForm.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center bg-stone-50 dark:bg-stone-800/50 p-2 rounded border border-stone-200 dark:border-stone-800">
                    <select
                      value={it.itemId}
                      onChange={(e) => {
                        const selItem = items.find(i => i.id === e.target.value);
                        const newItems = [...poForm.items];
                        newItems[idx] = {
                          ...newItems[idx],
                          itemId: e.target.value,
                          unitPrice: selItem ? selItem.purchaseRate : 50
                        };
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="flex-1 p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    >
                      {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={it.orderedQuantity}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].orderedQuantity = parseFloat(e.target.value);
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-20 p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />

                    <input
                      type="number"
                      placeholder="Rate ₹"
                      value={it.unitPrice}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].unitPrice = parseFloat(e.target.value);
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-24 p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold shadow-sm"
                >
                  Save & Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GRN MODAL */}
      {isGRNModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">Receive Goods (GRN Entry)</h3>
            <form onSubmit={handleCreateGRN} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-500 font-medium mb-1">Select Approved PO *</label>
                <select
                  value={grnForm.purchaseOrderId}
                  onChange={(e) => handlePOSelectForGRN(e.target.value)}
                  className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  required
                >
                  {orders.filter(o => o.status === 'APPROVED' || o.status === 'PARTIALLY_RECEIVED').map(o => (
                    <option key={o.id} value={o.id}>{o.poNumber} - {o.supplier?.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Supplier Invoice Number"
                  value={grnForm.invoiceNumber}
                  onChange={(e) => setGrnForm({ ...grnForm, invoiceNumber: e.target.value })}
                  className="p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Vehicle Number"
                  value={grnForm.vehicleNumber}
                  onChange={(e) => setGrnForm({ ...grnForm, vehicleNumber: e.target.value })}
                  className="p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              {/* Items Line Receiving */}
              <div className="space-y-2">
                <span className="font-bold uppercase text-stone-500">Items Receiving Details</span>
                {grnForm.items.map((it: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 space-y-2">
                    <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span>{it.itemName}</span>
                      <span className="text-amber-600">Pending on PO: {it.pendingQuantity} {it.unitId}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-stone-500">Received Qty</label>
                        <input
                          type="number"
                          value={it.receivedQuantity}
                          onChange={(e) => {
                            const newItems = [...grnForm.items];
                            newItems[idx].receivedQuantity = parseFloat(e.target.value);
                            newItems[idx].acceptedQuantity = parseFloat(e.target.value);
                            setGrnForm({ ...grnForm, items: newItems });
                          }}
                          className="w-full p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-500">Batch Number</label>
                        <input
                          type="text"
                          placeholder="e.g. BATCH-101"
                          value={it.batchNumber}
                          onChange={(e) => {
                            const newItems = [...grnForm.items];
                            newItems[idx].batchNumber = e.target.value;
                            setGrnForm({ ...grnForm, items: newItems });
                          }}
                          className="w-full p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-500">Expiry Date</label>
                        <input
                          type="date"
                          value={it.expiryDate}
                          onChange={(e) => {
                            const newItems = [...grnForm.items];
                            newItems[idx].expiryDate = e.target.value;
                            setGrnForm({ ...grnForm, items: newItems });
                          }}
                          className="w-full p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGRNModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow-sm"
                >
                  Create GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">Add New Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Supplier Company Name *"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                required
              />
              <input
                type="text"
                placeholder="Contact Person"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="GSTIN Number"
                  value={supplierForm.gstin}
                  onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                  className="p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
