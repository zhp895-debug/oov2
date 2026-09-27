import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { inventoryRouter, seedInitialDatabase } from './src/server/inventoryRoutes';
import { transferRouter } from './src/server/transferRoutes';
import { purchaseRouter } from './src/server/purchaseRoutes';
import { kitchenRouter } from './src/server/kitchenRoutes';
import {
  INITIAL_USERS,
  INITIAL_STORES,
  INITIAL_SUPPLIERS,
  INITIAL_ITEMS,
  INITIAL_RECIPES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GRNS,
  INITIAL_TRANSFERS,
  INITIAL_PRODUCTION,
  INITIAL_WASTAGE,
  INITIAL_AUDITS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS
} from './src/data/initialData';
import { generateInitialBalances, computeKPIs, generateAlertsList } from './src/lib/storeManager';
import { StockTransaction, StockBalance, ActivityLog, InventoryItem, GoodsReceivedNote, StoreTransfer, ProductionRecord, WastageRecord, StockAdjustment, StockAudit } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Middleware for Mobile APK / Capacitor & Remote Clients
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email', 'X-User-Role']
  }));

  app.use(express.json());

  // Initialize DB seed
  try {
    await seedInitialDatabase();
  } catch (err) {
    console.error('Seed DB Error:', err);
  }

  // Phase 2, 3 & 4 PostgreSQL/Prisma Inventory, Transfer, Purchase, and Kitchen API Routes
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/transfers', transferRouter);
  app.use('/api/purchases', purchaseRouter);
  app.use('/api', kitchenRouter);

  // In-Memory Database State
  let users = [...INITIAL_USERS];
  let stores = [...INITIAL_STORES];
  let suppliers = [...INITIAL_SUPPLIERS];
  let items: InventoryItem[] = [...INITIAL_ITEMS];
  let recipes = [...INITIAL_RECIPES];
  let purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
  let grns: GoodsReceivedNote[] = [...INITIAL_GRNS];
  let transfers: StoreTransfer[] = [...INITIAL_TRANSFERS];
  let productionRecords: ProductionRecord[] = [...INITIAL_PRODUCTION];
  let wastageRecords: WastageRecord[] = [...INITIAL_WASTAGE];
  let stockAdjustments: StockAdjustment[] = [];
  let stockAudits: StockAudit[] = [...INITIAL_AUDITS];
  let activityLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
  let settings = { ...INITIAL_SETTINGS };

  // Calculate Initial Balances & Stock Transactions History
  let balances: StockBalance[] = generateInitialBalances(items, stores);
  let stockTransactions: StockTransaction[] = [];

  // Helper log function
  const logAction = (user: string, role: any, action: any, module: string, description: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      role,
      action,
      module,
      description
    };
    activityLogs.unshift(newLog);
  };

  // Helper to adjust stock transactionally
  const recordStockTransaction = (
    type: any,
    itemId: string,
    storeId: string,
    quantity: number, // positive for addition, negative for deduction
    rate: number,
    refType?: any,
    refNo?: string,
    reason?: string,
    user: string = 'System'
  ) => {
    const item = items.find(i => i.id === itemId);
    const store = stores.find(s => s.id === storeId);
    if (!item || !store) return;

    // Find or create balance
    let bal = balances.find(b => b.itemId === itemId && b.storeId === storeId);
    if (!bal) {
      bal = {
        itemId,
        itemCode: item.code,
        itemName: item.name,
        category: item.category,
        unit: item.unit,
        storeId,
        storeName: store.name,
        currentStock: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
        purchaseRate: rate,
        avgRate: rate,
        totalValuation: 0,
        batches: [],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      balances.push(bal);
    }

    // Update balance
    bal.currentStock += quantity;
    if (bal.currentStock < 0 && !settings.allowNegativeStock) {
      bal.currentStock = 0; // Guard negative unless allowed
    }
    bal.availableQuantity = bal.currentStock;
    bal.totalValuation = Math.max(0, bal.currentStock * bal.avgRate);
    bal.lastUpdated = new Date().toISOString().split('T')[0];

    // Create transaction record
    const tx: StockTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionNumber: `TXN-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      itemId,
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit,
      quantity,
      rate,
      totalValue: Math.abs(quantity * rate),
      fromStoreId: quantity < 0 ? storeId : undefined,
      toStoreId: quantity > 0 ? storeId : undefined,
      referenceType: refType,
      referenceNumber: refNo,
      reason,
      performedBy: user,
      performedByRole: 'store_manager',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    stockTransactions.unshift(tx);
  };

  // --- API ROUTES ---

  // Full state snapshot
  app.get('/api/state', (req, res) => {
    const kpis = computeKPIs(items, balances, purchaseOrders, wastageRecords, transfers, stockAudits);
    const alerts = generateAlertsList(items, balances, purchaseOrders);

    res.json({
      users,
      stores,
      suppliers,
      items,
      recipes,
      purchaseOrders,
      grns,
      transfers,
      productionRecords,
      wastageRecords,
      stockAdjustments,
      stockAudits,
      activityLogs,
      settings,
      balances,
      stockTransactions,
      kpis,
      alerts
    });
  });

  // Item Master Endpoints
  app.get('/api/items', (req, res) => res.json(items));
  app.post('/api/items', (req, res) => {
    const newItem: InventoryItem = {
      ...req.body,
      id: `itm-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    logAction(req.body.user || 'Admin', 'super_admin', 'CREATE', 'Item Master', `Added new item: ${newItem.name} (${newItem.code})`);
    res.json(newItem);
  });

  app.put('/api/items/:id', (req, res) => {
    const index = items.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...req.body, updatedDate: new Date().toISOString().split('T')[0] };
      logAction(req.body.user || 'Admin', 'super_admin', 'UPDATE', 'Item Master', `Updated item details: ${items[index].name}`);
      res.json(items[index]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });

  // GRN Receipt -> Updates Inventory
  app.post('/api/grn', (req, res) => {
    const grn: GoodsReceivedNote = {
      ...req.body,
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      grnDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    grns.unshift(grn);

    // Apply inventory updates for accepted items
    grn.items.forEach(gi => {
      if (gi.acceptedQty > 0) {
        recordStockTransaction('grn_receive', gi.itemId, grn.storeId, gi.acceptedQty, gi.rate, 'GRN', grn.grnNumber, gi.remarks, grn.qualityCheckedBy);
      }
    });

    logAction(grn.qualityCheckedBy, 'store_manager', 'GRN', 'Purchase', `Received Goods Note ${grn.grnNumber} value ₹${grn.totalAcceptedValue}`);
    res.json(grn);
  });

  // Store Transfer Workflow
  app.post('/api/transfers', (req, res) => {
    const transfer: StoreTransfer = {
      ...req.body,
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      transferDate: new Date().toISOString().split('T')[0],
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    };
    transfers.unshift(transfer);
    logAction(transfer.requestedBy, 'kitchen_manager', 'TRANSFER', 'Store Transfer', `Requested transfer ${transfer.transferNumber} from ${transfer.fromStoreName} to ${transfer.toStoreName}`);
    res.json(transfer);
  });

  app.put('/api/transfers/:id/status', (req, res) => {
    const { status, user } = req.body;
    const trf = transfers.find(t => t.id === req.params.id);
    if (!trf) return res.status(404).json({ error: 'Transfer not found' });

    trf.status = status;
    if (status === 'approved') trf.approvedBy = user;
    if (status === 'dispatched') {
      trf.dispatchedBy = user;
      // Deduct from sender store
      trf.items.forEach(ti => {
        recordStockTransaction('transfer_out', ti.itemId, trf.fromStoreId, -ti.transferredQty, ti.rate, 'TRANSFER', trf.transferNumber, `Transferred to ${trf.toStoreName}`, user);
      });
    }
    if (status === 'received') {
      trf.receivedBy = user;
      // Add to receiver store
      trf.items.forEach(ti => {
        recordStockTransaction('transfer_in', ti.itemId, trf.toStoreId, ti.transferredQty, ti.rate, 'TRANSFER', trf.transferNumber, `Received from ${trf.fromStoreName}`, user);
      });
    }

    logAction(user, 'store_manager', 'UPDATE', 'Store Transfer', `Updated transfer ${trf.transferNumber} status to ${status}`);
    res.json(trf);
  });

  // Kitchen Production Entry with Recipe BOM Auto-Deduction
  app.post('/api/production', (req, res) => {
    const { recipeId, producedQuantity, kitchenStoreId, user, notes } = req.body;
    const recipe = recipes.find(r => r.id === recipeId);
    const store = stores.find(s => s.id === kitchenStoreId) || stores.find(s => s.type === 'kitchen') || stores[4];

    if (!recipe) return res.status(400).json({ error: 'Recipe not found' });

    // Calculate yield multiplier
    const multiplier = producedQuantity / (recipe.yieldQuantity || 1);

    const rawUsages: any[] = [];
    let totalActualCost = 0;

    // Deduct ingredients from kitchen inventory
    recipe.ingredients.forEach(ing => {
      const requiredQty = ing.quantity * multiplier;
      const ingTotalCost = requiredQty * ing.costPerUnit;
      totalActualCost += ingTotalCost;

      recordStockTransaction(
        'production_consumption',
        ing.itemId,
        store.id,
        -requiredQty,
        ing.costPerUnit,
        'PRODUCTION',
        recipe.code,
        `Production of ${producedQuantity} ${recipe.yieldUnit} ${recipe.name}`,
        user
      );

      rawUsages.push({
        itemId: ing.itemId,
        itemCode: ing.itemCode,
        itemName: ing.itemName,
        unit: ing.unit,
        expectedQty: requiredQty,
        actualQty: requiredQty,
        varianceQty: 0,
        rate: ing.costPerUnit,
        varianceValue: 0
      });
    });

    const record: ProductionRecord = {
      id: `prd-${Date.now()}`,
      productionNumber: `PRD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productionDate: new Date().toISOString().split('T')[0],
      kitchenStoreId: store.id,
      kitchenStoreName: store.name,
      producedItems: [
        {
          recipeId: recipe.id,
          recipeCode: recipe.code,
          recipeName: recipe.name,
          producedQuantity,
          yieldUnit: recipe.yieldUnit,
          unitCost: recipe.costPerYieldUnit,
          totalProductionValue: producedQuantity * recipe.costPerYieldUnit
        }
      ],
      rawMaterialUsage: rawUsages,
      totalExpectedCost: totalActualCost,
      totalActualCost,
      varianceTotalValue: 0,
      recordedBy: user,
      status: 'completed',
      notes,
      createdAt: new Date().toISOString()
    };

    productionRecords.unshift(record);
    logAction(user, 'kitchen_manager', 'PRODUCTION', 'Kitchen Production', `Recorded production of ${producedQuantity} ${recipe.yieldUnit} ${recipe.name}`);
    res.json(record);
  });

  // Record Wastage
  app.post('/api/wastage', (req, res) => {
    const { storeId, department, items: wItems, user } = req.body;
    const store = stores.find(s => s.id === storeId) || stores[0];

    let totalVal = 0;
    const processedItems = wItems.map((wi: any) => {
      const item = items.find(i => i.id === wi.itemId);
      const val = wi.quantity * (item ? item.purchaseRate : 100);
      totalVal += val;
      return {
        ...wi,
        itemName: item?.name || 'Item',
        itemCode: item?.code || 'SKU',
        unit: item?.unit || 'Kg',
        rate: item?.purchaseRate || 100,
        totalValue: val
      };
    });

    const requiresApproval = totalVal >= settings.wastageApprovalThreshold;

    const wastageRecord: WastageRecord = {
      id: `wst-${Date.now()}`,
      wastageNumber: `WST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      storeName: store.name,
      department: department || 'Kitchen',
      items: processedItems,
      totalValue: totalVal,
      requiresApproval,
      status: requiresApproval ? 'pending_approval' : 'approved',
      recordedBy: user,
      approvedBy: requiresApproval ? undefined : 'Auto-Approved',
      createdAt: new Date().toISOString()
    };

    if (!requiresApproval) {
      processedItems.forEach((pi: any) => {
        recordStockTransaction('wastage', pi.itemId, store.id, -pi.quantity, pi.rate, 'WASTAGE', wastageRecord.wastageNumber, pi.reason, user);
      });
    }

    wastageRecords.unshift(wastageRecord);
    logAction(user, 'kitchen_manager', 'WASTAGE', 'Wastage', `Recorded wastage entry ${wastageRecord.wastageNumber} value ₹${totalVal}`);
    res.json(wastageRecord);
  });

  app.put('/api/wastage/:id/approve', (req, res) => {
    const { user } = req.body;
    const wst = wastageRecords.find(w => w.id === req.params.id);
    if (!wst) return res.status(404).json({ error: 'Wastage not found' });

    wst.status = 'approved';
    wst.approvedBy = user;
    wst.approvalDate = new Date().toISOString().split('T')[0];

    wst.items.forEach(pi => {
      recordStockTransaction('wastage', pi.itemId, wst.storeId, -pi.quantity, pi.rate, 'WASTAGE', wst.wastageNumber, pi.reason, user);
    });

    logAction(user, 'store_manager', 'APPROVE', 'Wastage', `Approved high-value wastage ${wst.wastageNumber} value ₹${wst.totalValue}`);
    res.json(wst);
  });

  // Stock Audit Workflow
  app.post('/api/audits', (req, res) => {
    const { storeId, auditorName, auditItems } = req.body;
    const store = stores.find(s => s.id === storeId) || stores[0];

    let sysVal = 0;
    let physVal = 0;
    let varVal = 0;

    const processedAuditItems = auditItems.map((ai: any) => {
      const sVal = ai.systemQty * ai.rate;
      const pVal = ai.physicalQty * ai.rate;
      const vVal = ai.varianceQty * ai.rate;
      sysVal += sVal;
      physVal += pVal;
      varVal += vVal;
      return {
        ...ai,
        varianceValue: vVal
      };
    });

    const audit: StockAudit = {
      id: `aud-${Date.now()}`,
      auditNumber: `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: new Date().toISOString().split('T')[0],
      completionDate: new Date().toISOString().split('T')[0],
      storeId: store.id,
      storeName: store.name,
      auditorName,
      items: processedAuditItems,
      totalSystemValue: sysVal,
      totalPhysicalValue: physVal,
      totalVarianceValue: varVal,
      status: 'submitted_for_approval',
      createdAt: new Date().toISOString()
    };

    stockAudits.unshift(audit);
    logAction(auditorName, 'auditor', 'AUDIT', 'Stock Audit', `Submitted stock audit ${audit.auditNumber} with variance value ₹${varVal}`);
    res.json(audit);
  });

  app.put('/api/audits/:id/finalize', (req, res) => {
    const { user } = req.body;
    const audit = stockAudits.find(a => a.id === req.params.id);
    if (!audit) return res.status(404).json({ error: 'Audit not found' });

    audit.status = 'finalized';
    audit.approvedBy = user;

    // Apply adjustments automatically
    audit.items.forEach(ai => {
      if (ai.varianceQty !== 0) {
        recordStockTransaction('stock_adjustment', ai.itemId, audit.storeId, ai.varianceQty, ai.rate, 'AUDIT', audit.auditNumber, `Physical audit adjustment (${ai.notes || 'Count variance'})`, user);
      }
    });

    logAction(user, 'super_admin', 'APPROVE', 'Stock Audit', `Finalized Stock Audit ${audit.auditNumber} and synchronized inventory`);
    res.json(audit);
  });

  // Reset demo state
  app.post('/api/reset', (req, res) => {
    users = [...INITIAL_USERS];
    stores = [...INITIAL_STORES];
    suppliers = [...INITIAL_SUPPLIERS];
    items = [...INITIAL_ITEMS];
    recipes = [...INITIAL_RECIPES];
    purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
    grns = [...INITIAL_GRNS];
    transfers = [...INITIAL_TRANSFERS];
    productionRecords = [...INITIAL_PRODUCTION];
    wastageRecords = [...INITIAL_WASTAGE];
    stockAdjustments = [];
    stockAudits = [...INITIAL_AUDITS];
    activityLogs = [...INITIAL_ACTIVITY_LOGS];
    settings = { ...INITIAL_SETTINGS };
    balances = generateInitialBalances(items, stores);
    stockTransactions = [];

    res.json({ message: 'State reset successfully' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OliveOrange Stock Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
