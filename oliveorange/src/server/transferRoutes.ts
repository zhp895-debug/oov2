import { Router } from 'express';
import { prisma, StockTransactionService } from './stockService';

export const transferRouter = Router();

/**
 * 1. POST /api/transfers - Create transfer request
 */
transferRouter.post('/', async (req, res) => {
  try {
    const { fromStoreId, toStoreId, fromLocationId, toLocationId, items, requestedBy, remarks } = req.body;

    if (!fromStoreId || !toStoreId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'fromStoreId, toStoreId, and non-empty items array are required.' });
    }
    if (fromStoreId === toStoreId) {
      return res.status(400).json({ error: 'Source and destination store cannot be the same.' });
    }

    const count = await prisma.stockTransfer.count();
    const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        fromStoreId,
        fromLocationId,
        toStoreId,
        toLocationId,
        status: 'REQUESTED',
        requestedBy: requestedBy || 'Store Staff',
        remarks,
        items: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            quantity: parseFloat(i.quantity),
            unitId: i.unitId || 'Kg',
            batchNumber: i.batchNumber || null,
            expiryDate: i.expiryDate ? new Date(i.expiryDate) : null
          }))
        }
      },
      include: {
        items: { include: { item: true } },
        fromStore: true,
        toStore: true
      }
    });

    await prisma.auditLog.create({
      data: {
        user: requestedBy || 'Store Staff',
        role: 'STORE_STAFF',
        action: 'TRANSFER_CREATED',
        module: 'TRANSFER',
        description: `Created transfer request ${transferNumber} from ${transfer.fromStore.name} to ${transfer.toStore.name}`,
        reference: transfer.id
      }
    });

    res.status(201).json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. GET /api/transfers - List transfers
 */
transferRouter.get('/', async (req, res) => {
  try {
    const { status, fromStoreId, toStoreId } = req.query as any;

    const transfers = await prisma.stockTransfer.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(fromStoreId ? { fromStoreId } : {}),
        ...(toStoreId ? { toStoreId } : {})
      },
      include: {
        items: { include: { item: true } },
        fromStore: true,
        toStore: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transfers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. GET /api/transfers/:id - Transfer Details
 */
transferRouter.get('/:id', async (req, res) => {
  try {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { item: true } },
        fromStore: true,
        toStore: true
      }
    });

    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });

    res.json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. POST /api/transfers/:id/approve - Approve Transfer
 */
transferRouter.post('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const transfer = await prisma.stockTransfer.findUnique({ where: { id: req.params.id } });

    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    if (transfer.status !== 'REQUESTED') {
      return res.status(400).json({ error: `Cannot approve transfer in ${transfer.status} state.` });
    }

    const updated = await prisma.stockTransfer.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'Store Manager'
      },
      include: {
        items: { include: { item: true } },
        fromStore: true,
        toStore: true
      }
    });

    await prisma.auditLog.create({
      data: {
        user: approvedBy || 'Store Manager',
        role: 'STORE_MANAGER',
        action: 'TRANSFER_APPROVED',
        module: 'TRANSFER',
        description: `Approved transfer request ${transfer.transferNumber}`,
        reference: transfer.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. POST /api/transfers/:id/dispatch - Dispatch Transfer (Deducts source stock via TRANSFER_OUT)
 */
transferRouter.post('/:id/dispatch', async (req, res) => {
  try {
    const { dispatchedBy } = req.body;
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { item: true } } }
    });

    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    if (transfer.status !== 'APPROVED' && transfer.status !== 'REQUESTED') {
      return res.status(400).json({ error: `Cannot dispatch transfer in ${transfer.status} state.` });
    }

    // Database transaction safety for dispatching
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate stock availability for all items in source store
      for (const item of transfer.items) {
        const validation = await StockTransactionService.validateStockAvailability(
          item.itemId,
          transfer.fromStoreId,
          item.quantity,
          item.batchNumber || undefined
        );

        if (!validation.valid) {
          throw new Error(`Cannot dispatch transfer. Item '${item.item.name}': ${validation.message}`);
        }
      }

      // 2. Create TRANSFER_OUT for source store
      for (const item of transfer.items) {
        await tx.inventoryTransaction.create({
          data: {
            itemId: item.itemId,
            storeId: transfer.fromStoreId,
            locationId: transfer.fromLocationId,
            transactionType: 'TRANSFER_OUT',
            quantity: item.quantity,
            unitId: item.unitId,
            rate: item.item.purchaseRate,
            totalValue: item.quantity * item.item.purchaseRate,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            referenceType: 'TRANSFER',
            referenceId: transfer.transferNumber,
            remarks: `Transfer OUT to store ${transfer.toStoreId}`,
            status: 'POSTED',
            createdBy: dispatchedBy || 'Store Manager'
          }
        });
      }

      // 3. Update transfer status
      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: req.params.id },
        data: {
          status: 'DISPATCHED',
          dispatchedAt: new Date()
        },
        include: {
          items: { include: { item: true } },
          fromStore: true,
          toStore: true
        }
      });

      await tx.auditLog.create({
        data: {
          user: dispatchedBy || 'Store Manager',
          role: 'STORE_MANAGER',
          action: 'TRANSFER_DISPATCHED',
          module: 'TRANSFER',
          description: `Dispatched transfer ${transfer.transferNumber}`,
          reference: transfer.id
        }
      });

      return updatedTransfer;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 6. POST /api/transfers/:id/receive - Receive Transfer (Adds destination stock via TRANSFER_IN)
 */
transferRouter.post('/:id/receive', async (req, res) => {
  try {
    const { receivedBy } = req.body;
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { item: true } } }
    });

    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    if (transfer.status !== 'DISPATCHED') {
      return res.status(400).json({ error: `Cannot receive transfer in ${transfer.status} state. Transfer must be DISPATCHED first.` });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create TRANSFER_IN for destination store
      for (const item of transfer.items) {
        await tx.inventoryTransaction.create({
          data: {
            itemId: item.itemId,
            storeId: transfer.toStoreId,
            locationId: transfer.toLocationId,
            transactionType: 'TRANSFER_IN',
            quantity: item.quantity,
            unitId: item.unitId,
            rate: item.item.purchaseRate,
            totalValue: item.quantity * item.item.purchaseRate,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            referenceType: 'TRANSFER',
            referenceId: transfer.transferNumber,
            remarks: `Transfer IN from store ${transfer.fromStoreId}`,
            status: 'POSTED',
            createdBy: receivedBy || 'Store Receiver'
          }
        });
      }

      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: req.params.id },
        data: {
          status: 'COMPLETED',
          receivedAt: new Date()
        },
        include: {
          items: { include: { item: true } },
          fromStore: true,
          toStore: true
        }
      });

      await tx.auditLog.create({
        data: {
          user: receivedBy || 'Store Receiver',
          role: 'STORE_STAFF',
          action: 'TRANSFER_RECEIVED',
          module: 'TRANSFER',
          description: `Received and completed transfer ${transfer.transferNumber}`,
          reference: transfer.id
        }
      });

      return updatedTransfer;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 7. POST /api/transfers/:id/cancel - Cancel Transfer
 */
transferRouter.post('/:id/cancel', async (req, res) => {
  try {
    const { user } = req.body;
    const transfer = await prisma.stockTransfer.findUnique({ where: { id: req.params.id } });

    if (!transfer) return res.status(404).json({ error: 'Transfer not found.' });
    if (transfer.status === 'DISPATCHED' || transfer.status === 'RECEIVED' || transfer.status === 'COMPLETED') {
      return res.status(400).json({ error: `Cannot cancel transfer that has already been ${transfer.status}.` });
    }

    const updated = await prisma.stockTransfer.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Store Admin',
        role: 'STORE_MANAGER',
        action: 'TRANSFER_CANCELLED',
        module: 'TRANSFER',
        description: `Cancelled transfer ${transfer.transferNumber}`,
        reference: transfer.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
