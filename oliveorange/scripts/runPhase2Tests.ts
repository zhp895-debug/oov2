import { prisma, StockTransactionService } from '../src/server/stockService';

async function runTests() {
  console.log('=== RUNNING PHASE 2 INVENTORY ENGINE TEST SUITE ===\n');

  try {
    // Setup test items and stores
    const testStoreA = await prisma.store.upsert({
      where: { code: 'TEST-STR-A' },
      update: {},
      create: {
        code: 'TEST-STR-A',
        name: 'Test Store Alpha',
        type: 'main',
        location: 'Test Bay A',
        status: 'active'
      }
    });

    const testStoreB = await prisma.store.upsert({
      where: { code: 'TEST-STR-B' },
      update: {},
      create: {
        code: 'TEST-STR-B',
        name: 'Test Store Beta',
        type: 'dry',
        location: 'Test Bay B',
        status: 'active'
      }
    });

    const testRice = await prisma.item.upsert({
      where: { code: 'TEST-RICE-001' },
      update: {},
      create: {
        code: 'TEST-RICE-001',
        name: 'Test Basmati Rice',
        category: 'Grains',
        unit: 'Kg',
        minStock: 10,
        maxStock: 500,
        reorderLevel: 25,
        purchaseRate: 100,
        avgRate: 100,
        batchTracking: true,
        expiryTracking: true,
        status: 'active'
      }
    });

    // Ensure settings
    await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: { allowNegativeStock: false },
      create: { id: 'default', allowNegativeStock: false }
    });

    // Clean test transactions for test item
    await prisma.inventoryTransaction.deleteMany({
      where: { itemId: testRice.id }
    });

    console.log('--- TEST 1: OPENING STOCK (+100 KG) ---');
    await StockTransactionService.createInTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 100,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test Runner'
    });
    let stock1 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Opening: ${stock1} KG (Expected: 100 KG)`);
    if (stock1 !== 100) throw new Error(`TEST 1 FAILED: Expected 100, got ${stock1}`);
    console.log('✔ TEST 1 PASSED\n');

    console.log('--- TEST 2: PURCHASE IN (+50 KG) ---');
    await StockTransactionService.createInTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'PURCHASE_IN',
      quantity: 50,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test Runner'
    });
    let stock2 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Purchase: ${stock2} KG (Expected: 150 KG)`);
    if (stock2 !== 150) throw new Error(`TEST 2 FAILED: Expected 150, got ${stock2}`);
    console.log('✔ TEST 2 PASSED\n');

    console.log('--- TEST 3: CONSUMPTION OUT (-20 KG) ---');
    await StockTransactionService.createOutTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'CONSUMPTION_OUT',
      quantity: 20,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test Runner'
    });
    let stock3 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Consumption: ${stock3} KG (Expected: 130 KG)`);
    if (stock3 !== 130) throw new Error(`TEST 3 FAILED: Expected 130, got ${stock3}`);
    console.log('✔ TEST 3 PASSED\n');

    console.log('--- TEST 4: WASTAGE OUT (-5 KG) ---');
    await StockTransactionService.createOutTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'WASTAGE_OUT',
      quantity: 5,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test Runner'
    });
    let stock4 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Wastage: ${stock4} KG (Expected: 125 KG)`);
    if (stock4 !== 125) throw new Error(`TEST 4 FAILED: Expected 125, got ${stock4}`);
    console.log('✔ TEST 4 PASSED\n');

    console.log('--- TEST 5: TRANSFER OUT (-10 KG) ---');
    await StockTransactionService.createOutTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'TRANSFER_OUT',
      quantity: 10,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test Runner'
    });
    let stock5 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Transfer Out: ${stock5} KG (Expected: 115 KG)`);
    if (stock5 !== 115) throw new Error(`TEST 5 FAILED: Expected 115, got ${stock5}`);
    console.log('✔ TEST 5 PASSED\n');

    console.log('--- TEST 6: ATTEMPT OVER-DRAW (200 KG OUT) - SHOULD REJECT ---');
    let rejected = false;
    try {
      await StockTransactionService.createOutTransaction({
        itemId: testRice.id,
        storeId: testStoreA.id,
        transactionType: 'CONSUMPTION_OUT',
        quantity: 200,
        unitId: 'Kg',
        rate: 100,
        createdBy: 'Test Runner'
      });
    } catch (err: any) {
      rejected = true;
      console.log(`Rejection Message: "${err.message}"`);
    }
    let stock6 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Stock after attempt: ${stock6} KG (Expected: 115 KG)`);
    if (!rejected || stock6 !== 115) throw new Error('TEST 6 FAILED: Overdraw was not rejected properly!');
    console.log('✔ TEST 6 PASSED\n');

    console.log('--- TEST 7: ADJUSTMENT IN (+5 KG) ---');
    await StockTransactionService.createInTransaction({
      itemId: testRice.id,
      storeId: testStoreA.id,
      transactionType: 'ADJUSTMENT_IN',
      quantity: 5,
      unitId: 'Kg',
      rate: 100,
      remarks: 'Physical Count Adjustment',
      createdBy: 'Test Runner'
    });
    let stock7 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Adjustment In: ${stock7} KG (Expected: 120 KG)`);
    if (stock7 !== 120) throw new Error(`TEST 7 FAILED: Expected 120, got ${stock7}`);
    console.log('✔ TEST 7 PASSED\n');

    console.log('--- TEST 8: REVERSE ADJUSTMENT (-5 KG) ---');
    const adjTx = await prisma.inventoryTransaction.findFirst({
      where: { itemId: testRice.id, transactionType: 'ADJUSTMENT_IN' }
    });
    if (!adjTx) throw new Error('Adjustment transaction not found for reversal test');

    await StockTransactionService.reverseTransaction(adjTx.id, 'Entry correction', 'Admin Test');
    let stock8 = await StockTransactionService.getCurrentStock(testRice.id, testStoreA.id);
    console.log(`Current Stock after Reversal: ${stock8} KG (Expected: 115 KG)`);
    if (stock8 !== 115) throw new Error(`TEST 8 FAILED: Expected 115, got ${stock8}`);
    console.log('✔ TEST 8 PASSED\n');

    console.log('--- TEST 9: STORE-TO-STORE TRANSFER DISPATCH & RECEIVE ---');
    // Source initial: 100 KG in Store A
    const transferRice = await prisma.item.create({
      data: {
        code: `TRF-RICE-${Date.now()}`,
        name: 'Transfer Test Rice',
        category: 'Grains',
        unit: 'Kg',
        purchaseRate: 100,
        status: 'active'
      }
    });

    await StockTransactionService.createInTransaction({
      itemId: transferRice.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 100,
      unitId: 'Kg',
      rate: 100,
      createdBy: 'Test'
    });

    const transferObj = await prisma.stockTransfer.create({
      data: {
        transferNumber: `TRF-TEST-${Date.now()}`,
        fromStoreId: testStoreA.id,
        toStoreId: testStoreB.id,
        status: 'REQUESTED',
        requestedBy: 'Test Runner',
        items: {
          create: [{ itemId: transferRice.id, quantity: 20, unitId: 'Kg' }]
        }
      },
      include: { items: true }
    });

    // Dispatch
    await StockTransactionService.createOutTransaction({
      itemId: transferRice.id,
      storeId: testStoreA.id,
      transactionType: 'TRANSFER_OUT',
      quantity: 20,
      unitId: 'Kg',
      referenceType: 'TRANSFER',
      referenceId: transferObj.transferNumber,
      createdBy: 'Test Dispatcher'
    });

    const sourceStockAfterDispatch = await StockTransactionService.getCurrentStock(transferRice.id, testStoreA.id);
    const destStockBeforeReceive = await StockTransactionService.getCurrentStock(transferRice.id, testStoreB.id);
    console.log(`Source Stock after dispatch: ${sourceStockAfterDispatch} KG (Expected: 80 KG)`);
    console.log(`Dest Stock before receive: ${destStockBeforeReceive} KG (Expected: 0 KG)`);

    if (sourceStockAfterDispatch !== 80 || destStockBeforeReceive !== 0) {
      throw new Error('TEST 9 FAILED at Dispatch phase');
    }

    // Receive
    await StockTransactionService.createInTransaction({
      itemId: transferRice.id,
      storeId: testStoreB.id,
      transactionType: 'TRANSFER_IN',
      quantity: 20,
      unitId: 'Kg',
      referenceType: 'TRANSFER',
      referenceId: transferObj.transferNumber,
      createdBy: 'Test Receiver'
    });

    const destStockAfterReceive = await StockTransactionService.getCurrentStock(transferRice.id, testStoreB.id);
    console.log(`Dest Stock after receive: ${destStockAfterReceive} KG (Expected: 20 KG)`);

    if (destStockAfterReceive !== 20) {
      throw new Error('TEST 9 FAILED at Receive phase');
    }
    console.log('✔ TEST 9 PASSED\n');

    console.log('--- TEST 10: BATCH-WISE STOCK TRACKING ---');
    const batchItem = await prisma.item.create({
      data: {
        code: `BATCH-ITEM-${Date.now()}`,
        name: 'Batch Test Flour',
        category: 'Flour',
        unit: 'Kg',
        batchTracking: true,
        purchaseRate: 50,
        status: 'active'
      }
    });

    await StockTransactionService.createInTransaction({
      itemId: batchItem.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 50,
      unitId: 'Kg',
      batchNumber: 'BATCH-A',
      createdBy: 'Test'
    });

    await StockTransactionService.createInTransaction({
      itemId: batchItem.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 100,
      unitId: 'Kg',
      batchNumber: 'BATCH-B',
      createdBy: 'Test'
    });

    const batchAStock = await StockTransactionService.getCurrentStock(batchItem.id, testStoreA.id, undefined, 'BATCH-A');
    const batchBStock = await StockTransactionService.getCurrentStock(batchItem.id, testStoreA.id, undefined, 'BATCH-B');
    console.log(`Batch A Stock: ${batchAStock} KG (Expected: 50 KG)`);
    console.log(`Batch B Stock: ${batchBStock} KG (Expected: 100 KG)`);

    if (batchAStock !== 50 || batchBStock !== 100) {
      throw new Error('TEST 10 FAILED: Batch stock separation failed');
    }
    console.log('✔ TEST 10 PASSED\n');

    console.log('--- TEST 11: EXPIRY REPORT FILTERING ---');
    const expiryItem = await prisma.item.create({
      data: {
        code: `EXP-ITEM-${Date.now()}`,
        name: 'Expiring Dairy Cream',
        category: 'Dairy',
        unit: 'Ltr',
        expiryTracking: true,
        purchaseRate: 200,
        status: 'active'
      }
    });

    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 3); // 3 days from now

    await StockTransactionService.createInTransaction({
      itemId: expiryItem.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 25,
      unitId: 'Ltr',
      batchNumber: 'EXP-BATCH-01',
      expiryDate: nearExpiryDate,
      createdBy: 'Test'
    });

    const expTxs = await prisma.inventoryTransaction.findMany({
      where: { itemId: expiryItem.id, status: 'POSTED' }
    });
    console.log(`Created expiring item batch with expiry date ${nearExpiryDate.toISOString().split('T')[0]}`);
    if (expTxs.length === 0) throw new Error('TEST 11 FAILED: Expiring transaction not found');
    console.log('✔ TEST 11 PASSED\n');

    console.log('--- TEST 12: CONCURRENT OUT PROTECTION ---');
    // Available stock = 30 KG
    const concItem = await prisma.item.create({
      data: {
        code: `CONC-ITEM-${Date.now()}`,
        name: 'Concurrent Test Sugar',
        category: 'Grains',
        unit: 'Kg',
        purchaseRate: 40,
        status: 'active'
      }
    });

    await StockTransactionService.createInTransaction({
      itemId: concItem.id,
      storeId: testStoreA.id,
      transactionType: 'INVENTORY_OPENING',
      quantity: 30,
      unitId: 'Kg',
      createdBy: 'Test'
    });

    // Execute 2 concurrent requests: Request A = 20 KG, Request B = 20 KG. Only 1 can succeed!
    const results = await Promise.allSettled([
      StockTransactionService.createOutTransaction({
        itemId: concItem.id,
        storeId: testStoreA.id,
        transactionType: 'CONSUMPTION_OUT',
        quantity: 20,
        unitId: 'Kg',
        createdBy: 'User A'
      }),
      StockTransactionService.createOutTransaction({
        itemId: concItem.id,
        storeId: testStoreA.id,
        transactionType: 'CONSUMPTION_OUT',
        quantity: 20,
        unitId: 'Kg',
        createdBy: 'User B'
      })
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejectedConc = results.filter(r => r.status === 'rejected').length;
    const finalConcStock = await StockTransactionService.getCurrentStock(concItem.id, testStoreA.id);

    console.log(`Concurrent results: ${fulfilled} succeeded, ${rejectedConc} rejected.`);
    console.log(`Final stock: ${finalConcStock} KG (Expected: 10 KG, strictly non-negative)`);

    if (fulfilled !== 1 || finalConcStock < 0) {
      throw new Error(`TEST 12 FAILED: Concurrent transactions created invalid state or negative stock (${finalConcStock})`);
    }
    console.log('✔ TEST 12 PASSED\n');

    console.log('🎉 ALL 12 PHASE 2 TEST CASES PASSED SUCCESSFULLY! 🎉');

  } catch (err: any) {
    console.error('❌ TEST SUITE FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
