import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { ItemMaster } from './pages/ItemMaster';
import { InventoryView } from './pages/InventoryView';
import { PurchaseManagement } from './pages/PurchaseManagement';
import { KitchenManagement } from './pages/KitchenManagement';
import { RecipeBOM } from './pages/RecipeBOM';
import { StockAudit } from './pages/StockAudit';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AppTour } from './components/common/AppTour';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer, ToastMessage } from './components/common/ToastContainer';

import {
  INITIAL_ITEMS,
  INITIAL_STORES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_WASTAGE,
  INITIAL_RECIPES,
  INITIAL_AUDITS
} from './data/initialData';
import { generateInitialBalances } from './lib/storeManager';

import {
  InventoryItem,
  Store,
  Supplier,
  StockBalance,
  StockTransaction,
  PurchaseOrder,
  GoodsReceivedNote,
  KitchenRequisition,
  WastageLog,
  Recipe,
  StockAuditSession,
  POStatus,
  RequisitionStatus,
  User
} from './types';
import { INITIAL_USERS } from './data/initialData';
import { LoginModal } from './components/auth/LoginModal';
import { Login } from './pages/Login';

export default function App() {
  // App Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // App Tour & Command Palette State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  // App User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('oliveorange_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleLoginUser = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('oliveorange_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user in localStorage', e);
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('oliveorange_user');
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
  };

  // App Core Data State
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [balances, setBalances] = useState<StockBalance[]>(() => generateInitialBalances(INITIAL_ITEMS, INITIAL_STORES));
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [grns, setGRNs] = useState<GoodsReceivedNote[]>(INITIAL_GRNS);
  const [requisitions, setRequisitions] = useState<KitchenRequisition[]>([]);
  const [wastageLogs, setWastageLogs] = useState<WastageLog[]>(INITIAL_WASTAGE);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [audits, setAudits] = useState<StockAuditSession[]>(INITIAL_AUDITS);

  // Computed alert metrics
  const lowStockCount = balances.filter(b => {
    const itemDef = items.find(i => i.id === b.itemId);
    const reorder = itemDef ? itemDef.reorderLevel : 15;
    return b.currentStock <= reorder;
  }).length;

  // Handlers
  const handleAddItem = (newItem: Partial<InventoryItem>) => {
    const created: InventoryItem = {
      id: `item-${Date.now()}`,
      code: newItem.code || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newItem.name || 'New Item',
      category: newItem.category || 'Grains',
      subCategory: newItem.subCategory || '',
      unit: newItem.unit || 'Kg',
      brand: newItem.brand || '',
      minStock: newItem.minStock || 10,
      maxStock: newItem.maxStock || 100,
      reorderLevel: newItem.reorderLevel || 15,
      storageLocation: newItem.storageLocation || 'Central Godown',
      shelfRack: newItem.shelfRack || 'A-01',
      primarySupplierId: newItem.primarySupplierId || suppliers[0]?.id || 'sup-1',
      primarySupplierName: newItem.primarySupplierName || suppliers[0]?.name || 'Supplier',
      purchaseRate: newItem.purchaseRate || 100,
      avgRate: newItem.avgRate || 100,
      batchTracking: newItem.batchTracking ?? true,
      expiryTracking: newItem.expiryTracking ?? true,
      status: newItem.status || 'active',
      description: newItem.description || ''
    };

    setItems([...items, created]);

    // Initialize balance in central store
    const centralStore = stores.find(s => s.isMainStore) || stores[0];
    const newBal: StockBalance = {
      id: `bal-${Date.now()}`,
      itemId: created.id,
      itemCode: created.code,
      itemName: created.name,
      category: created.category,
      storeId: centralStore.id,
      storeName: centralStore.name,
      unit: created.unit,
      currentStock: 0,
      allocatedStock: 0,
      avgRate: created.purchaseRate,
      totalValuation: 0,
      batches: [],
      lastUpdated: new Date().toISOString()
    };
    setBalances([...balances, newBal]);
  };

  const handleUpdateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleRecordAdjustment = (adj: any) => {
    // Update balance
    setBalances(prev => prev.map(b => {
      if (b.itemId === adj.itemId && b.storeId === adj.storeId) {
        const newQty = adj.physicalQty;
        return {
          ...b,
          currentStock: newQty,
          totalValuation: newQty * b.avgRate,
          lastUpdated: new Date().toISOString()
        };
      }
      return b;
    }));

    // Record Transaction
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      storeId: adj.storeId,
      storeName: adj.storeName,
      itemId: adj.itemId,
      itemCode: adj.itemCode,
      itemName: adj.itemName,
      unit: adj.unit,
      type: 'PHYSICAL_ADJUSTMENT',
      quantity: adj.adjustmentQty,
      rate: adj.rate,
      totalAmount: adj.totalImpactValue,
      performedBy: 'Super Admin',
      reason: `${adj.reason}: ${adj.remarks}`
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleCreatePO = (po: Partial<PurchaseOrder>) => {
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: po.poNumber || `PO-${Date.now()}`,
      supplierId: po.supplierId || 'sup-1',
      supplierName: po.supplierName || 'Supplier',
      orderDate: po.orderDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: po.expectedDeliveryDate || new Date().toISOString().split('T')[0],
      items: po.items || [],
      subtotal: po.subtotal || 0,
      gstAmount: po.gstAmount || 0,
      totalAmount: po.totalAmount || 0,
      status: po.status || 'PENDING_APPROVAL',
      destinationStoreId: po.destinationStoreId || 'store-1',
      destinationStoreName: po.destinationStoreName || 'Central Godown',
      notes: po.notes,
      createdBy: po.createdBy || 'Super Admin'
    };
    setPOs([newPO, ...pos]);
  };

  const handleUpdatePOStatus = (id: string, status: POStatus) => {
    setPOs(pos.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleCreateGRN = (grn: Partial<GoodsReceivedNote>) => {
    const newGRN: GoodsReceivedNote = {
      id: `grn-${Date.now()}`,
      grnNumber: grn.grnNumber || `GRN-${Date.now()}`,
      poNumber: grn.poNumber || '',
      supplierName: grn.supplierName || '',
      receivedDate: grn.receivedDate || new Date().toISOString().split('T')[0],
      invoiceNumber: grn.invoiceNumber || '',
      items: grn.items || [],
      totalValue: grn.totalValue || 0,
      storeId: grn.storeId || 'store-1',
      storeName: grn.storeName || 'Central Godown',
      receivedBy: grn.receivedBy || 'Super Admin',
      qualityPassed: grn.qualityPassed ?? true,
      notes: grn.notes
    };

    setGRNs([newGRN, ...grns]);

    // Increase stock balance for GRN items
    grn.items?.forEach(gi => {
      setBalances(prev => prev.map(b => {
        if (b.itemId === gi.itemId && b.storeId === newGRN.storeId) {
          const updatedQty = b.currentStock + gi.acceptedQty;
          return {
            ...b,
            currentStock: updatedQty,
            totalValuation: updatedQty * b.avgRate,
            lastUpdated: new Date().toISOString()
          };
        }
        return b;
      }));

      // Add transaction
      const newTx: StockTransaction = {
        id: `tx-${Date.now()}-${Math.random()}`,
        date: new Date().toISOString().split('T')[0],
        storeId: newGRN.storeId,
        storeName: newGRN.storeName,
        itemId: gi.itemId,
        itemCode: gi.itemCode,
        itemName: gi.itemName,
        unit: gi.unit,
        type: 'GRN_RECEIPT',
        quantity: gi.acceptedQty,
        rate: gi.unitRate || gi.rate || 0,
        totalAmount: gi.acceptedQty * (gi.unitRate || gi.rate || 0),
        referenceNumber: newGRN.grnNumber,
        performedBy: newGRN.receivedBy || newGRN.qualityCheckedBy || 'System'
      };
      setTransactions(prev => [newTx, ...prev]);
    });
  };

  const handleCreateRequisition = (req: Partial<KitchenRequisition>) => {
    const newReq: KitchenRequisition = {
      id: `req-${Date.now()}`,
      reqNumber: req.reqNumber || `REQ-${Date.now()}`,
      date: req.date || new Date().toISOString(),
      fromStoreId: req.fromStoreId || 'store-1',
      fromStoreName: req.fromStoreName || 'Central Godown',
      toStoreId: req.toStoreId || 'store-2',
      toStoreName: req.toStoreName || 'Kitchen',
      requestedBy: req.requestedBy || 'Chef Suresh',
      mealType: req.mealType || 'General',
      status: req.status || 'PENDING',
      items: req.items || [],
      remarks: req.remarks
    };

    setRequisitions([newReq, ...requisitions]);
  };

  const handleUpdateReqStatus = (id: string, status: RequisitionStatus) => {
    const req = requisitions.find(r => r.id === id);
    if (!req) return;

    setRequisitions(requisitions.map(r => r.id === id ? { ...r, status } : r));

    if (status === 'APPROVED') {
      // Transfer stock from source store to target kitchen
      req.items.forEach(item => {
        // Deduct from source store
        setBalances(prev => prev.map(b => {
          if (b.itemId === item.itemId && b.storeId === req.fromStoreId) {
            const newQty = Math.max(0, b.currentStock - item.requestedQty);
            return { ...b, currentStock: newQty, totalValuation: newQty * b.avgRate };
          }
          // Add to target store
          if (b.itemId === item.itemId && b.storeId === req.toStoreId) {
            const newQty = b.currentStock + item.requestedQty;
            return { ...b, currentStock: newQty, totalValuation: newQty * b.avgRate };
          }
          return b;
        }));
      });
    }
  };

  const handleCreateWastage = (wst: Partial<WastageLog>) => {
    const newWst: WastageLog = {
      id: `wst-${Date.now()}`,
      date: wst.date || new Date().toISOString(),
      storeId: wst.storeId || 'store-2',
      storeName: wst.storeName || 'Kitchen',
      itemId: wst.itemId || 'item-1',
      itemCode: wst.itemCode || 'SKU-01',
      itemName: wst.itemName || 'Item',
      unit: wst.unit || 'Kg',
      quantity: wst.quantity || 1,
      costRate: wst.costRate || 100,
      totalCost: wst.totalCost || 100,
      reason: wst.reason || 'Spoilage',
      reportedBy: wst.reportedBy || 'Kitchen Supervisor',
      notes: wst.notes
    };

    setWastageLogs([newWst, ...wastageLogs]);

    // Deduct quantity from store balance
    setBalances(prev => prev.map(b => {
      if (b.itemId === newWst.itemId && b.storeId === newWst.storeId) {
        const newQty = Math.max(0, b.currentStock - newWst.quantity);
        return { ...b, currentStock: newQty, totalValuation: newQty * b.avgRate };
      }
      return b;
    }));

    // Record wastage transaction
    const newTx: StockTransaction = {
      id: `tx-wst-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      storeId: newWst.storeId,
      storeName: newWst.storeName,
      itemId: newWst.itemId,
      itemCode: newWst.itemCode,
      itemName: newWst.itemName,
      unit: newWst.unit,
      type: 'WASTAGE_LOG',
      quantity: -newWst.quantity,
      rate: newWst.costRate,
      totalAmount: -newWst.totalCost,
      reason: newWst.reason,
      performedBy: newWst.reportedBy
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleExecuteProduction = (recipeId: string, portions: number, kitchenStoreId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const multiplier = portions / (recipe.standardServings || 1);

    recipe.ingredients.forEach(ing => {
      const perQty = ing.quantityPerPortion ?? ing.quantity ?? 1;
      const rateVal = ing.costPerPortion ?? ing.costPerUnit ?? 0;
      const neededQty = perQty * multiplier;

      // Deduct from kitchen balance
      setBalances(prev => prev.map(b => {
        if (b.itemId === ing.itemId && b.storeId === kitchenStoreId) {
          const newQty = Math.max(0, b.currentStock - neededQty);
          return { ...b, currentStock: newQty, totalValuation: newQty * b.avgRate };
        }
        return b;
      }));

      // Record transaction
      const newTx: StockTransaction = {
        id: `tx-prod-${Date.now()}-${Math.random()}`,
        date: new Date().toISOString().split('T')[0],
        storeId: kitchenStoreId,
        storeName: stores.find(s => s.id === kitchenStoreId)?.name || 'Kitchen',
        itemId: ing.itemId,
        itemCode: ing.itemCode,
        itemName: ing.itemName,
        unit: ing.unit,
        type: 'KITCHEN_CONSUMPTION',
        quantity: -neededQty,
        rate: rateVal,
        totalAmount: -(neededQty * rateVal),
        reason: `Production of ${portions}x ${recipe.dishName || recipe.name}`,
        performedBy: 'Kitchen Executive Chef'
      };
      setTransactions(prev => [newTx, ...prev]);
    });
  };

  const handleCreateAuditSession = (audit: Partial<StockAuditSession>) => {
    const newAudit: StockAuditSession = {
      id: `aud-${Date.now()}`,
      auditNumber: audit.auditNumber || `AUD-${Date.now()}`,
      date: audit.date || new Date().toISOString().split('T')[0],
      storeId: audit.storeId || 'store-1',
      storeName: audit.storeName || 'Central Godown',
      auditorName: audit.auditorName || 'Lead Auditor',
      status: audit.status || 'IN_PROGRESS',
      items: audit.items || [],
      totalPositiveVariance: audit.totalPositiveVariance || 0,
      totalNegativeVariance: audit.totalNegativeVariance || 0,
      netVarianceValue: audit.netVarianceValue || 0
    };
    setAudits([newAudit, ...audits]);
  };

  const handlePostAuditAdjustment = (auditId: string) => {
    setAudits(audits.map(a => a.id === auditId ? { ...a, status: 'POSTED' } : a));
  };

  const handleAddStore = (store: Partial<Store>) => {
    const newStore: Store = {
      id: `store-${Date.now()}`,
      code: store.code || `STR-${Date.now()}`,
      name: store.name || 'New Store',
      type: store.type || 'KITCHEN',
      inCharge: store.inCharge || 'Supervisor',
      location: store.location || 'Ground Floor',
      isMainStore: store.isMainStore ?? false
    };
    setStores([...stores, newStore]);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginUser} currentUser={currentUser} />;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[#1F2937] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogoutUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          activeTabTitle={activeTab.replace('-', ' ')}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onStoreChange={setSelectedStoreId}
          lowStockCount={lowStockCount}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onStartTour={() => setIsTourOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onQuickAction={(action) => {
            if (action === 'new-indent') setActiveTab('kitchen');
          }}
        />

        {/* Dynamic Page View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                balances={balances}
                transactions={transactions}
                requisitions={requisitions}
                pos={pos}
                items={items}
                onNavigate={setActiveTab}
                onOpenNewPO={() => setActiveTab('purchasing')}
                onOpenNewReq={() => setActiveTab('kitchen')}
                onStartTour={() => setIsTourOpen(true)}
              />
            )}

            {activeTab === 'item-master' && (
              <ItemMaster
                items={items}
                suppliers={suppliers}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView />
            )}

            {activeTab === 'purchasing' && (
              <PurchaseManagement />
            )}

            {activeTab === 'kitchen' && (
              <KitchenManagement
                requisitions={requisitions}
                wastageLogs={wastageLogs}
                items={items}
                stores={stores}
                onCreateRequisition={handleCreateRequisition}
                onUpdateReqStatus={handleUpdateReqStatus}
                onCreateWastage={handleCreateWastage}
              />
            )}

            {activeTab === 'recipe-bom' && (
              <RecipeBOM
                recipes={recipes}
                items={items}
                stores={stores}
                onCreateRecipe={(r) => setRecipes([...recipes, { ...r, id: `rec-${Date.now()}` } as Recipe])}
                onExecuteProduction={handleExecuteProduction}
              />
            )}

            {activeTab === 'stock-audit' && (
              <StockAudit
                audits={audits}
                stores={stores}
                balances={balances}
                items={items}
                onCreateAuditSession={handleCreateAuditSession}
                onPostAuditAdjustment={handlePostAuditAdjustment}
              />
            )}

            {activeTab === 'reports' && (
              <Reports
                balances={balances}
                transactions={transactions}
                wastageLogs={wastageLogs}
                items={items}
                stores={stores}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                stores={stores}
                onAddStore={handleAddStore}
                onStartTour={() => setIsTourOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Authentication & User Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
      />

      {/* Interactive App Tour Guide */}
      <AppTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={setActiveTab}
        currentTab={activeTab}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onStartTour={() => setIsTourOpen(true)}
        stores={stores}
        selectedStoreId={selectedStoreId}
        onStoreChange={setSelectedStoreId}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
