import { Router } from 'express';
import { prisma, StockTransactionService } from './stockService';

export const inventoryRouter = Router();

/**
 * Seed initial database records if empty
 */
export async function seedInitialDatabase() {
  // Seed suppliers if empty
  const supplierCount = await prisma.supplier.count();
  let sup1, sup2, sup3;
  if (supplierCount === 0) {
    sup1 = await prisma.supplier.create({
      data: {
        code: 'SUP-0001',
        name: 'Swastik Agro Traders',
        contactPerson: 'Ramesh Patel',
        email: 'swastik.agro@example.com',
        phone: '+91 98250 12345',
        address: 'APMC Market Yard, Unjha, Gujarat',
        gstin: '24AAAAA0000A1Z5',
        category: 'Grains & Spices',
        paymentTerms: 'Net 30'
      }
    });

    sup2 = await prisma.supplier.create({
      data: {
        code: 'SUP-0002',
        name: 'Gujarat Dairy Co-op',
        contactPerson: 'Kailash Dairy',
        email: 'orders@gujaraddairy.example.com',
        phone: '+91 98250 54321',
        address: 'Anand Dairy Road, Gujarat',
        gstin: '24BBBBB1111B1Z6',
        category: 'Dairy & Ghee',
        paymentTerms: 'Net 15'
      }
    });

    sup3 = await prisma.supplier.create({
      data: {
        code: 'SUP-0003',
        name: 'Shree Krishna Flour Mills',
        contactPerson: 'Gopal Shah',
        email: 'krishna.mills@example.com',
        phone: '+91 98250 99887',
        address: 'GIDC Industrial Area, Ahmedabad',
        gstin: '24CCCCC2222C1Z7',
        category: 'Flour & Atta',
        paymentTerms: 'Net 30'
      }
    });
  }

  const itemCount = await prisma.item.count();
  if (itemCount === 0) {
    console.log('Seeding initial items and stores into PostgreSQL/SQLite database...');

    // Seed Stores
    const mainStore = await prisma.store.create({
      data: {
        code: 'STR-MAIN',
        name: 'Main Central Store',
        type: 'main',
        location: 'Ground Floor Block A',
        managerName: 'Rajesh Sharma',
        inCharge: 'Rajesh Sharma',
        contactNumber: '+91 98765 43210',
        isMainStore: true,
        status: 'active'
      }
    });

    const kitchenStore = await prisma.store.create({
      data: {
        code: 'STR-KTN',
        name: 'Main Kitchen Store',
        type: 'kitchen',
        location: 'Kitchen Kitchen Deck',
        managerName: 'Chef Suresh',
        inCharge: 'Chef Suresh',
        contactNumber: '+91 98765 43211',
        isMainStore: false,
        status: 'active'
      }
    });

    const dryStore = await prisma.store.create({
      data: {
        code: 'STR-DRY',
        name: 'Dry Provisions Store',
        type: 'dry',
        location: 'Basement Storage B1',
        managerName: 'Amit Patel',
        inCharge: 'Amit Patel',
        contactNumber: '+91 98765 43212',
        isMainStore: false,
        status: 'active'
      }
    });

    // Seed Items
    const rice = await prisma.item.create({
      data: {
        code: 'PRM-GRN-001',
        name: 'Basmati Rice Premium (1121)',
        category: 'Grains',
        subCategory: 'Rice',
        unit: 'Kg',
        brand: 'Kohinoor',
        minStock: 50,
        maxStock: 500,
        reorderLevel: 100,
        storageLocation: 'Main Store',
        shelfRack: 'A-12',
        primarySupplierName: 'Swastik Agro Traders',
        purchaseRate: 110,
        avgRate: 110,
        batchTracking: true,
        expiryTracking: true,
        status: 'active',
        description: 'Long grain aromatic basmati rice for biryani and pulav.'
      }
    });

    const flour = await prisma.item.create({
      data: {
        code: 'PRM-FLR-002',
        name: 'Whole Wheat Atta (Sharbati)',
        category: 'Flour',
        subCategory: 'Atta',
        unit: 'Kg',
        brand: 'Aashirvaad',
        minStock: 40,
        maxStock: 300,
        reorderLevel: 80,
        storageLocation: 'Dry Store',
        shelfRack: 'B-04',
        primarySupplierName: 'Shree Krishna Mills',
        purchaseRate: 42,
        avgRate: 42,
        batchTracking: true,
        expiryTracking: true,
        status: 'active',
        description: 'Fresh ground whole wheat flour for rotis and puris.'
      }
    });

    const ghee = await prisma.item.create({
      data: {
        code: 'PRM-OIL-003',
        name: 'Pure Desi Cow Ghee',
        category: 'Oil & Ghee',
        subCategory: 'Ghee',
        unit: 'Ltr',
        brand: 'Amul',
        minStock: 20,
        maxStock: 150,
        reorderLevel: 35,
        storageLocation: 'Main Store',
        shelfRack: 'C-01',
        primarySupplierName: 'Gujarat Dairy Co-op',
        purchaseRate: 580,
        avgRate: 580,
        batchTracking: true,
        expiryTracking: true,
        status: 'active',
        description: 'Pure cow ghee for sweet preparation and prasadam.'
      }
    });

    const turmeric = await prisma.item.create({
      data: {
        code: 'PRM-SPC-004',
        name: 'Turmeric Powder (Haldi)',
        category: 'Spices & Masala',
        subCategory: 'Powder Spices',
        unit: 'Kg',
        brand: 'MDH',
        minStock: 5,
        maxStock: 30,
        reorderLevel: 10,
        storageLocation: 'Dry Store',
        shelfRack: 'D-02',
        primarySupplierName: 'Swastik Agro Traders',
        purchaseRate: 180,
        avgRate: 180,
        batchTracking: true,
        expiryTracking: true,
        status: 'active',
        description: 'High curcumin grade 1 turmeric powder.'
      }
    });

    const paneer = await prisma.item.create({
      data: {
        code: 'PRM-DRY-005',
        name: 'Fresh Malai Paneer',
        category: 'Dairy',
        subCategory: 'Paneer',
        unit: 'Kg',
        brand: 'Amul',
        minStock: 10,
        maxStock: 50,
        reorderLevel: 15,
        storageLocation: 'Cold Room',
        shelfRack: 'CR-01',
        primarySupplierName: 'Gujarat Dairy Co-op',
        purchaseRate: 320,
        avgRate: 320,
        batchTracking: true,
        expiryTracking: true,
        status: 'active',
        description: 'Fresh cottage cheese for daily gravies and snacks.'
      }
    });

    // Seed Default System Settings
    await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        allowNegativeStock: false,
        enableFefo: true,
        allowPartialKitchenIssue: true,
        trackFinishedGoods: false,
        productionVarianceThreshold: 5.0,
        wastageThreshold: 5000,
        expiryWarningDays: 15
      }
    });

    // Seed Opening Stock Transactions
    await StockTransactionService.createInTransaction({
      itemId: rice.id,
      storeId: mainStore.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 100,
      unitId: 'Kg',
      rate: 110,
      batchNumber: 'RICE-2026-001',
      expiryDate: new Date('2026-12-31'),
      remarks: 'Initial Opening Stock Entry',
      createdBy: 'System Super Admin'
    });

    await StockTransactionService.createInTransaction({
      itemId: flour.id,
      storeId: mainStore.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 150,
      unitId: 'Kg',
      rate: 42,
      batchNumber: 'FLR-2026-01',
      expiryDate: new Date('2026-09-30'),
      remarks: 'Initial Opening Stock Entry',
      createdBy: 'System Super Admin'
    });

    await StockTransactionService.createInTransaction({
      itemId: ghee.id,
      storeId: mainStore.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 50,
      unitId: 'Ltr',
      rate: 580,
      batchNumber: 'GHEE-2026-A',
      expiryDate: new Date('2026-08-20'), // Expiring soon
      remarks: 'Initial Opening Stock Entry',
      createdBy: 'System Super Admin'
    });

    // Seed Sample Recipes
    const recipeCount = await prisma.recipe.count();
    if (recipeCount === 0) {
      // Find or create items for Samosa recipe
      let potato = await prisma.item.findFirst({ where: { name: { contains: 'Potato' } } });
      if (!potato) {
        potato = await prisma.item.create({
          data: {
            code: 'PRM-VEG-001',
            name: 'Fresh Potatoes (A Grade)',
            category: 'Vegetables',
            unit: 'Kg',
            purchaseRate: 25,
            avgRate: 25,
            status: 'active'
          }
        });
      }

      let maida = await prisma.item.findFirst({ where: { name: { contains: 'Maida' } } });
      if (!maida) {
        maida = await prisma.item.create({
          data: {
            code: 'PRM-FLR-003',
            name: 'Maida (Refined Wheat Flour)',
            category: 'Flour',
            unit: 'Kg',
            purchaseRate: 40,
            avgRate: 40,
            status: 'active'
          }
        });
      }

      let oil = await prisma.item.findFirst({ where: { name: { contains: 'Oil' } } });
      if (!oil) {
        oil = await prisma.item.create({
          data: {
            code: 'PRM-OIL-001',
            name: 'Refined Cooking Oil',
            category: 'Oil',
            unit: 'Ltr',
            purchaseRate: 120,
            avgRate: 120,
            status: 'active'
          }
        });
      }

      let salt = await prisma.item.findFirst({ where: { name: { contains: 'Salt' } } });
      if (!salt) {
        salt = await prisma.item.create({
          data: {
            code: 'PRM-SPI-008',
            name: 'Iodized Salt',
            category: 'Spices',
            unit: 'Kg',
            purchaseRate: 20,
            avgRate: 20,
            status: 'active'
          }
        });
      }

      let spices = await prisma.item.findFirst({ where: { name: { contains: 'Turmeric' } } }) || turmeric;

      // Create Samosa Recipe (100 PCS)
      await prisma.recipe.create({
        data: {
          recipeCode: 'REC-000001',
          name: 'Crispy Punjabi Samosa',
          description: 'Traditional potato stuffed fried samosa for snack counter.',
          outputQuantity: 100,
          outputUnitId: 'PCS',
          yieldQuantity: 100,
          wastagePercentage: 2.0,
          version: 1,
          status: 'ACTIVE',
          createdBy: 'Head Chef Maharaj',
          items: {
            create: [
              { itemId: maida.id, quantity: 5.0, unitId: 'Kg', wastagePercentage: 0 },
              { itemId: potato.id, quantity: 8.0, unitId: 'Kg', wastagePercentage: 5.0 },
              { itemId: oil.id, quantity: 2.0, unitId: 'Ltr', wastagePercentage: 0 },
              { itemId: salt.id, quantity: 0.2, unitId: 'Kg', wastagePercentage: 0 },
              { itemId: spices.id, quantity: 0.15, unitId: 'Kg', wastagePercentage: 0 }
            ]
          }
        }
      });
    }

    console.log('Seeding completed successfully!');
  }
}

/**
 * 1. GET /api/inventory/stock - Stock Balances with calculations from transactions
 */
inventoryRouter.get('/stock', async (req, res) => {
  try {
    const { itemId, storeId, categoryId, status, search } = req.query as any;

    const items = await prisma.item.findMany({
      where: {
        status: 'active',
        ...(itemId ? { id: itemId } : {}),
        ...(categoryId ? { category: categoryId } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { category: { contains: search } }
          ]
        } : {})
      }
    });

    const stores = await prisma.store.findMany({
      where: {
        status: 'active',
        ...(storeId ? { id: storeId } : {})
      }
    });

    const result = [];

    for (const item of items) {
      for (const store of stores) {
        const availableQuantity = await StockTransactionService.getCurrentStock(item.id, store.id);

        // Compute average rate & total value
        const inTxs = await prisma.inventoryTransaction.findMany({
          where: {
            itemId: item.id,
            storeId: store.id,
            transactionType: { in: ['INVENTORY_OPENING', 'PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_IN'] },
            status: 'POSTED'
          }
        });

        let sumInQty = 0;
        let sumInVal = 0;
        inTxs.forEach(t => {
          sumInQty += t.quantity;
          sumInVal += (t.totalValue || t.quantity * (t.rate || item.purchaseRate));
        });

        const averageRate = sumInQty > 0 ? (sumInVal / sumInQty) : item.purchaseRate;
        const stockValue = availableQuantity * averageRate;

        // Status calculation
        let stockStatus = 'HEALTHY';
        if (availableQuantity <= 0) {
          stockStatus = 'OUT_OF_STOCK';
        } else if (availableQuantity <= item.minStock) {
          stockStatus = 'CRITICAL';
        } else if (availableQuantity <= item.reorderLevel) {
          stockStatus = 'LOW_STOCK';
        }

        // Apply status filter if provided
        if (status && status !== 'ALL' && stockStatus !== status) {
          continue;
        }

        result.push({
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          category: item.category,
          storeId: store.id,
          storeName: store.name,
          location: item.storageLocation || store.location,
          availableQuantity,
          unit: item.unit,
          averageRate: Math.round(averageRate * 100) / 100,
          stockValue: Math.round(stockValue * 100) / 100,
          minimumStock: item.minStock,
          reorderLevel: item.reorderLevel,
          maximumStock: item.maxStock,
          batchTracking: item.batchTracking,
          expiryTracking: item.expiryTracking,
          status: stockStatus
        });
      }
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. GET /api/inventory/stock/:itemId - Item specific stock breakdown
 */
inventoryRouter.get('/stock/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const stores = await prisma.store.findMany({ where: { status: 'active' } });
    const storeBreakdown = [];

    for (const store of stores) {
      const qty = await StockTransactionService.getCurrentStock(item.id, store.id);
      if (qty > 0) {
        storeBreakdown.push({
          storeId: store.id,
          storeName: store.name,
          quantity: qty,
          unit: item.unit,
          value: Math.round(qty * item.purchaseRate * 100) / 100
        });
      }
    }

    res.json({
      item,
      storeBreakdown
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. GET /api/inventory/ledger/:itemId - Running Stock Ledger
 */
inventoryRouter.get('/ledger/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { storeId, batchNumber, startDate, endDate } = req.query as any;

    const ledger = await StockTransactionService.getStockLedger(itemId, {
      storeId,
      batchNumber,
      startDate,
      endDate
    });

    res.json(ledger);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. GET /api/inventory/valuation - Stock Valuation Report
 */
inventoryRouter.get('/valuation', async (req, res) => {
  try {
    const { itemId, storeId } = req.query as any;
    const valuation = await StockTransactionService.calculateStockValue(itemId, storeId);
    res.json(valuation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. GET /api/inventory/expiring - Expiring Batches Report
 */
inventoryRouter.get('/expiring', async (req, res) => {
  try {
    const days = parseInt((req.query.days as string) || '15', 10);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    // Find all posted transactions with expiry dates
    const txs = await prisma.inventoryTransaction.findMany({
      where: {
        status: 'POSTED',
        expiryDate: { not: null },
        batchNumber: { not: null }
      },
      include: {
        item: true,
        store: true
      }
    });

    // Group by itemId + storeId + batchNumber
    const batchMap = new Map<string, {
      item: any;
      store: any;
      batchNumber: string;
      expiryDate: Date;
      quantity: number;
    }>();

    for (const tx of txs) {
      const key = `${tx.itemId}_${tx.storeId}_${tx.batchNumber}`;
      if (!batchMap.has(key)) {
        batchMap.set(key, {
          item: tx.item,
          store: tx.store,
          batchNumber: tx.batchNumber!,
          expiryDate: tx.expiryDate!,
          quantity: 0
        });
      }
      const entry = batchMap.get(key)!;
      const dir = StockTransactionService.getDirection(tx.transactionType);
      if (dir === 'IN') entry.quantity += tx.quantity;
      if (dir === 'OUT') entry.quantity -= tx.quantity;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = [];
    for (const [, b] of batchMap.entries()) {
      if (b.quantity > 0) {
        const expDate = new Date(b.expiryDate);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= days) {
          let status = 'Good';
          if (daysRemaining <= 0) status = 'Expired';
          else if (daysRemaining <= 7) status = 'Critical';
          else if (daysRemaining <= 15) status = 'Expiring Soon';

          result.push({
            itemId: b.item.id,
            itemCode: b.item.code,
            itemName: b.item.name,
            category: b.item.category,
            batchNumber: b.batchNumber,
            expiryDate: b.expiryDate.toISOString().split('T')[0],
            daysRemaining,
            quantity: b.quantity,
            unit: b.item.unit,
            storeId: b.store.id,
            storeName: b.store.name,
            location: b.item.storageLocation || b.store.location,
            status
          });
        }
      }
    }

    // Sort by expiry date ascending (earliest first)
    result.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 6. POST /api/inventory/opening-stock - Create Opening Stock Entry
 */
inventoryRouter.post('/opening-stock', async (req, res) => {
  try {
    const { itemId, storeId, locationId, quantity, unitId, rate, batchNumber, expiryDate, remarks, user } = req.body;

    if (!itemId || !storeId || !quantity) {
      return res.status(400).json({ error: 'itemId, storeId, and quantity are required.' });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    // Validate batch tracking requirements
    if (item.batchTracking && !batchNumber) {
      return res.status(400).json({ error: `Batch number is required for batch-tracked item '${item.name}'.` });
    }
    if (item.expiryTracking && !expiryDate) {
      return res.status(400).json({ error: `Expiry date is required for expiry-tracked item '${item.name}'.` });
    }

    // Check duplicate opening stock entry for Item + Store + Batch
    const existingOpening = await prisma.inventoryTransaction.findFirst({
      where: {
        itemId,
        storeId,
        batchNumber: batchNumber || null,
        transactionType: 'INVENTORY_OPENING',
        status: 'POSTED'
      }
    });

    if (existingOpening) {
      return res.status(400).json({
        error: 'Opening stock already recorded for this item, store, and batch.'
      });
    }

    const tx = await StockTransactionService.createInTransaction({
      itemId,
      storeId,
      locationId,
      transactionType: 'INVENTORY_OPENING',
      quantity: parseFloat(quantity),
      unitId: unitId || item.unit,
      rate: rate !== undefined ? parseFloat(rate) : item.purchaseRate,
      batchNumber,
      expiryDate,
      remarks: remarks || 'Initial Opening Stock',
      createdBy: user || 'Store Admin'
    });

    res.status(201).json(tx);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 7. POST /api/inventory/adjustments - Create Stock Adjustment (In / Out)
 */
inventoryRouter.post('/adjustments', async (req, res) => {
  try {
    const { itemId, storeId, locationId, adjustmentType, quantity, unitId, rate, reason, remarks, user } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Reason is required for stock adjustments.' });
    }
    if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(adjustmentType)) {
      return res.status(400).json({ error: 'adjustmentType must be ADJUSTMENT_IN or ADJUSTMENT_OUT.' });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const qty = parseFloat(quantity);
    const unitRate = rate !== undefined ? parseFloat(rate) : item.purchaseRate;

    let tx;
    if (adjustmentType === 'ADJUSTMENT_IN') {
      tx = await StockTransactionService.createInTransaction({
        itemId,
        storeId,
        locationId,
        transactionType: 'ADJUSTMENT_IN',
        quantity: qty,
        unitId: unitId || item.unit,
        rate: unitRate,
        remarks: `[${reason}] ${remarks || ''}`.trim(),
        createdBy: user || 'Store Auditor'
      });
    } else {
      tx = await StockTransactionService.createOutTransaction({
        itemId,
        storeId,
        locationId,
        transactionType: 'ADJUSTMENT_OUT',
        quantity: qty,
        unitId: unitId || item.unit,
        rate: unitRate,
        remarks: `[${reason}] ${remarks || ''}`.trim(),
        createdBy: user || 'Store Auditor'
      });
    }

    res.status(201).json(tx);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 8. POST /api/inventory/transactions/in - Generic Stock IN
 */
inventoryRouter.post('/transactions/in', async (req, res) => {
  try {
    const tx = await StockTransactionService.createInTransaction(req.body);
    res.status(201).json(tx);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 9. POST /api/inventory/transactions/out - Generic Stock OUT
 */
inventoryRouter.post('/transactions/out', async (req, res) => {
  try {
    const tx = await StockTransactionService.createOutTransaction(req.body);
    res.status(201).json(tx);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 10. POST /api/inventory/transactions/:id/reverse - Reverse Transaction
 */
inventoryRouter.post('/transactions/:id/reverse', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, user } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason for reversal is required.' });
    }

    const reversalTx = await StockTransactionService.reverseTransaction(id, reason, user || 'Super Admin');
    res.json(reversalTx);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * System Settings Endpoints
 */
inventoryRouter.get('/settings', async (req, res) => {
  try {
    const settings = await StockTransactionService.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

inventoryRouter.post('/settings', async (req, res) => {
  try {
    const { allowNegativeStock, enableFefo, wastageThreshold, expiryWarningDays } = req.body;

    const updated = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: {
        ...(allowNegativeStock !== undefined ? { allowNegativeStock } : {}),
        ...(enableFefo !== undefined ? { enableFefo } : {}),
        ...(wastageThreshold !== undefined ? { wastageThreshold } : {}),
        ...(expiryWarningDays !== undefined ? { expiryWarningDays } : {})
      },
      create: {
        id: 'default',
        allowNegativeStock: !!allowNegativeStock,
        enableFefo: enableFefo ?? true,
        wastageThreshold: wastageThreshold || 5000,
        expiryWarningDays: expiryWarningDays || 15
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dashboard Overview Real Data API
 */
inventoryRouter.get('/dashboard', async (req, res) => {
  try {
    const items = await prisma.item.findMany({ where: { status: 'active' } });
    const stores = await prisma.store.findMany({ where: { status: 'active' } });

    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      let itemTotalQty = 0;
      for (const store of stores) {
        const qty = await StockTransactionService.getCurrentStock(item.id, store.id);
        itemTotalQty += qty;
        totalStockValue += (qty * item.purchaseRate);
      }

      if (itemTotalQty <= 0) outOfStockCount++;
      else if (itemTotalQty <= item.minStock) lowStockCount++;
    }

    // Expiring count within 15 days
    const expiringItems = await fetchExpiringBatches(15);

    // Today's IN vs OUT
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTxs = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: today },
        status: 'POSTED'
      }
    });

    let todayInward = 0;
    let todayOutward = 0;
    let todayWastage = 0;

    todayTxs.forEach(t => {
      const dir = StockTransactionService.getDirection(t.transactionType);
      if (dir === 'IN') todayInward += (t.totalValue || t.quantity * t.rate!);
      if (dir === 'OUT') todayOutward += (t.totalValue || t.quantity * t.rate!);
      if (t.transactionType === 'WASTAGE_OUT') todayWastage += (t.totalValue || t.quantity * t.rate!);
    });

    // Recent movements
    const recentMovements = await prisma.inventoryTransaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { item: true, store: true }
    });

    res.json({
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalItems: items.length,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      expiringItems: expiringItems.length,
      todayInward: Math.round(todayInward * 100) / 100,
      todayOutward: Math.round(todayOutward * 100) / 100,
      todayWastage: Math.round(todayWastage * 100) / 100,
      recentMovements
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchExpiringBatches(days: number) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  const txs = await prisma.inventoryTransaction.findMany({
    where: {
      status: 'POSTED',
      expiryDate: { not: null },
      batchNumber: { not: null }
    }
  });

  const map = new Map<string, number>();
  txs.forEach(t => {
    const key = `${t.itemId}_${t.storeId}_${t.batchNumber}`;
    const dir = StockTransactionService.getDirection(t.transactionType);
    const curr = map.get(key) || 0;
    if (dir === 'IN') map.set(key, curr + t.quantity);
    if (dir === 'OUT') map.set(key, curr - t.quantity);
  });

  return Array.from(map.entries()).filter(([, qty]) => qty > 0);
}
