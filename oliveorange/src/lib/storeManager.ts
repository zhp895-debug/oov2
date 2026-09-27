import {
  InventoryItem,
  Store,
  StockBalance,
  StockTransaction,
  PurchaseOrder,
  GoodsReceivedNote,
  StoreTransfer,
  Recipe,
  ProductionRecord,
  ConsumptionRecord,
  WastageRecord,
  StockAdjustment,
  StockAudit,
  ActivityLog,
  RoleType,
  KPIOverview,
  AlertItem
} from '../types';
import {
  INITIAL_ITEMS,
  INITIAL_STORES,
  INITIAL_RECIPES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_TRANSFERS,
  INITIAL_PRODUCTION,
  INITIAL_WASTAGE,
  INITIAL_AUDITS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
  INITIAL_SUPPLIERS
} from '../data/initialData';

// Initial seed stock balances for items across stores
export function generateInitialBalances(items: InventoryItem[], stores: Store[]): StockBalance[] {
  const balances: StockBalance[] = [];

  items.forEach((item, index) => {
    // Distribute item stock logically across main stores
    const mainStore = stores.find(s => s.type === 'main') || stores[0];
    const dryStore = stores.find(s => s.type === 'dry') || stores[1];
    const coldStore = stores.find(s => s.type === 'cold') || stores[2];
    const kitchenStore = stores.find(s => s.type === 'kitchen') || stores[4];

    // Determine target store based on category
    let targetStore = mainStore;
    if (['Flour', 'Oil', 'Spices', 'Packaging'].includes(item.category)) targetStore = dryStore;
    if (['Dairy', 'Fruits'].includes(item.category)) targetStore = coldStore;
    if (item.category === 'Vegetables') targetStore = stores.find(s => s.type === 'vegetable') || mainStore;

    // Base mock stock relative to reorder level
    const isLow = index % 7 === 0;
    const isOut = index === 18;
    const baseQty = isOut ? 0 : isLow ? Math.floor(item.reorderLevel * 0.4) : Math.floor(item.reorderLevel * 2.5);

    const mfgYr = 2026;
    const expYr = item.category === 'Dairy' || item.category === 'Vegetables' ? 2026 : 2027;
    const expMth = (index % 12) + 1;
    const mthStr = expMth < 10 ? `0${expMth}` : `${expMth}`;

    balances.push({
      id: `bal-${item.id}-${targetStore.id}`,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      unit: item.unit,
      storeId: targetStore.id,
      storeName: targetStore.name,
      currentStock: baseQty,
      availableQuantity: baseQty,
      reservedQuantity: 0,
      damagedQuantity: 0,
      purchaseRate: item.purchaseRate,
      avgRate: item.purchaseRate,
      totalValuation: baseQty * item.purchaseRate,
      batches: baseQty > 0 ? [{
        batchNumber: `BATCH-${item.code.split('-')[1] || '01'}-2026`,
        expiryDate: `${expYr}-${mthStr}-28`,
        purchaseRate: item.purchaseRate,
        quantity: baseQty,
        storeId: targetStore.id
      }] : [],
      lastUpdated: '2026-08-12'
    });

    // Also seed a small kitchen store buffer for top cooking essentials
    if (['Grains', 'Flour', 'Spices', 'Oil'].includes(item.category) && !isOut) {
      const kQty = Math.floor(item.reorderLevel * 0.5);
      balances.push({
        id: `bal-${item.id}-${kitchenStore.id}`,
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        category: item.category,
        unit: item.unit,
        storeId: kitchenStore.id,
        storeName: kitchenStore.name,
        currentStock: kQty,
        availableQuantity: kQty,
        reservedQuantity: 0,
        damagedQuantity: 0,
        purchaseRate: item.purchaseRate,
        avgRate: item.purchaseRate,
        totalValuation: kQty * item.purchaseRate,
        batches: [{
          batchNumber: `BATCH-KIT-${item.code.split('-')[1] || '01'}`,
          expiryDate: '2027-06-30',
          purchaseRate: item.purchaseRate,
          quantity: kQty,
          storeId: kitchenStore.id
        }],
        lastUpdated: '2026-08-12'
      });
    }
  });

  return balances;
}

export function checkRolePermission(role: RoleType, module: string, action: 'view' | 'create' | 'approve' | 'delete'): boolean {
  if (role === 'super_admin') return true;

  switch (module) {
    case 'dashboard':
    case 'items':
    case 'inventory':
    case 'recipes':
    case 'alerts':
    case 'reports':
      return true; // viewable by all staff

    case 'purchases':
    case 'suppliers':
      if (role === 'store_manager' || role === 'accountant') return true;
      if (role === 'store_staff' && action === 'view') return true;
      return false;

    case 'transfers':
      if (role === 'store_manager' || role === 'store_staff' || role === 'kitchen_manager') return true;
      return action === 'view';

    case 'kitchen':
    case 'production':
      if (role === 'kitchen_manager' || role === 'store_manager') return true;
      return action === 'view';

    case 'wastage':
      if (action === 'approve') return role === 'store_manager';
      return true;

    case 'adjustments':
      if (action === 'approve') return role === 'store_manager' || role === 'auditor';
      return role === 'store_manager' || role === 'auditor';

    case 'audits':
      if (role === 'auditor' || role === 'store_manager') return true;
      return action === 'view';

    case 'users':
    case 'settings':
    case 'activity-logs':
      return false; // Handled by super_admin check at start

    default:
      return true;
  }
}

export function computeKPIs(
  items: InventoryItem[],
  balances: StockBalance[],
  orders: PurchaseOrder[],
  wastage: WastageRecord[],
  transfers: StoreTransfer[],
  audits: StockAudit[]
): KPIOverview {
  let totalStockValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  const todayStr = '2026-08-13';

  // Item stock mapping
  const itemTotalQtyMap = new Map<string, number>();
  balances.forEach(b => {
    totalStockValue += b.totalValuation;
    itemTotalQtyMap.set(b.itemId, (itemTotalQtyMap.get(b.itemId) || 0) + b.currentStock);

    // Check expiry
    b.batches.forEach(bt => {
      if (bt.expiryDate) {
        const exp = new Date(bt.expiryDate).getTime();
        const now = new Date(todayStr).getTime();
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) expiredCount++;
        else if (diffDays <= 15) expiringSoonCount++;
      }
    });
  });

  items.forEach(item => {
    const qty = itemTotalQtyMap.get(item.id) || 0;
    if (qty === 0) outOfStockCount++;
    else if (qty <= item.reorderLevel) lowStockCount++;
  });

  const pendingApprovalsCount = orders.filter(o => o.status === 'pending_approval').length +
    wastage.filter(w => w.status === 'pending_approval').length +
    transfers.filter(t => t.status === 'pending_approval').length;

  // Stock variance total from latest audit
  let stockVarianceTotal = 0;
  audits.forEach(a => {
    stockVarianceTotal += Math.abs(a.totalVarianceValue);
  });

  return {
    totalStockValue: Math.round(totalStockValue),
    totalItemsCount: items.length,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    expiredCount,
    todayPurchases: 85400,
    todayConsumption: 42800,
    todayWastage: 3200,
    todayTransfers: transfers.filter(t => t.transferDate === todayStr).length,
    pendingApprovalsCount,
    stockVarianceTotal: Math.round(stockVarianceTotal)
  };
}

export function generateAlertsList(items: InventoryItem[], balances: StockBalance[], orders: PurchaseOrder[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  const itemQtyMap = new Map<string, number>();
  balances.forEach(b => {
    itemQtyMap.set(b.itemId, (itemQtyMap.get(b.itemId) || 0) + b.currentStock);
  });

  items.forEach(item => {
    const qty = itemQtyMap.get(item.id) || 0;
    if (qty === 0) {
      alerts.push({
        id: `alt-out-${item.id}`,
        type: 'out_of_stock',
        severity: 'critical',
        title: `Out of Stock: ${item.name}`,
        message: `Stock level reached 0 ${item.unit}. Immediate purchase requisition required!`,
        itemId: item.id,
        itemCode: item.code,
        actionRequired: 'Create Purchase Requisition'
      });
    } else if (qty <= item.reorderLevel) {
      alerts.push({
        id: `alt-low-${item.id}`,
        type: 'low_stock',
        severity: 'warning',
        title: `Low Stock Reorder Alert: ${item.name}`,
        message: `Current stock ${qty} ${item.unit} is below reorder level (${item.reorderLevel} ${item.unit}).`,
        itemId: item.id,
        itemCode: item.code,
        actionRequired: 'Raise PO to ' + item.primarySupplierName
      });
    }
  });

  orders.filter(o => o.status === 'pending_approval').forEach(po => {
    alerts.push({
      id: `alt-po-${po.id}`,
      type: 'pending_approval',
      severity: 'warning',
      title: `Pending PO Approval: ${po.poNumber}`,
      message: `Purchase Order for ${po.supplierName} worth ₹${po.grandTotal.toLocaleString()} requires Manager approval.`,
      actionRequired: 'Review & Approve PO'
    });
  });

  return alerts;
}
