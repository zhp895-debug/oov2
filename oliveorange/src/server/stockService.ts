import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Stock Direction Maps
export const STOCK_IN_TYPES = [
  'INVENTORY_OPENING',
  'PURCHASE_IN',
  'TRANSFER_IN',
  'ADJUSTMENT_IN',
  'PRODUCTION_IN'
] as const;

export const STOCK_OUT_TYPES = [
  'TRANSFER_OUT',
  'CONSUMPTION_OUT',
  'WASTAGE_OUT',
  'PURCHASE_RETURN_OUT',
  'ADJUSTMENT_OUT'
] as const;

export type TransactionType =
  | 'INVENTORY_OPENING'
  | 'PURCHASE_IN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'CONSUMPTION_OUT'
  | 'WASTAGE_OUT'
  | 'PURCHASE_RETURN_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'REVERSAL'
  | 'PRODUCTION_IN';

export interface CreateTransactionParams {
  itemId: string;
  storeId: string;
  locationId?: string;
  transactionType: TransactionType;
  quantity: number; // positive number
  unitId: string;
  rate?: number;
  totalValue?: number;
  batchNumber?: string;
  expiryDate?: Date | string;
  referenceType?: string;
  referenceId?: string;
  remarks?: string;
  createdBy: string;
}

export class StockTransactionService {
  /**
   * Determine stock direction from transaction type
   */
  static getDirection(transactionType: string): 'IN' | 'OUT' | 'REVERSAL' {
    if (STOCK_IN_TYPES.includes(transactionType as any)) return 'IN';
    if (STOCK_OUT_TYPES.includes(transactionType as any)) return 'OUT';
    return 'REVERSAL';
  }

  /**
   * Get system setting
   */
  static async getSettings() {
    let settings = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: 'default',
          allowNegativeStock: false,
          enableFefo: true,
          wastageThreshold: 5000,
          expiryWarningDays: 15
        }
      });
    }
    return settings;
  }

  /**
   * Calculate current stock for item, store, location, and batch
   */
  static async getCurrentStock(itemId: string, storeId?: string, locationId?: string, batchNumber?: string): Promise<number> {
    const where: any = { itemId, status: 'POSTED' };
    if (storeId) where.storeId = storeId;
    if (locationId) where.locationId = locationId;
    if (batchNumber) where.batchNumber = batchNumber;

    const txs = await prisma.inventoryTransaction.findMany({ where });

    let balance = 0;
    for (const tx of txs) {
      const dir = this.getDirection(tx.transactionType);
      if (dir === 'IN') {
        balance += tx.quantity;
      } else if (dir === 'OUT') {
        balance -= tx.quantity;
      } else if (dir === 'REVERSAL') {
        // If reversing an IN transaction, subtract quantity
        // If reversing an OUT transaction, add quantity
        if (tx.remarks && tx.remarks.includes('REVERSAL_IN')) {
          balance -= tx.quantity;
        } else if (tx.remarks && tx.remarks.includes('REVERSAL_OUT')) {
          balance += tx.quantity;
        }
      }
    }
    return Math.max(0, balance);
  }

  /**
   * Validate if stock is sufficient for OUT transaction
   */
  static async validateStockAvailability(
    itemId: string,
    storeId: string,
    requestedQty: number,
    batchNumber?: string,
    locationId?: string
  ): Promise<{ valid: boolean; availableStock: number; message?: string }> {
    const availableStock = await this.getCurrentStock(itemId, storeId, locationId, batchNumber);
    const settings = await this.getSettings();

    if (requestedQty > availableStock && !settings.allowNegativeStock) {
      const item = await prisma.item.findUnique({ where: { id: itemId } });
      const unit = item?.unit || 'Units';
      return {
        valid: false,
        availableStock,
        message: `Insufficient stock. Available: ${availableStock} ${unit}.`
      };
    }

    return { valid: true, availableStock };
  }

  /**
   * Create an IN transaction (INVENTORY_OPENING, PURCHASE_IN, TRANSFER_IN, ADJUSTMENT_IN)
   */
  static async createInTransaction(params: CreateTransactionParams, prismaTx?: any) {
    const db = prismaTx || prisma;

    if (params.quantity <= 0) {
      throw new Error('Transaction quantity must be greater than zero.');
    }

    const rate = params.rate ?? 0;
    const totalValue = params.totalValue ?? (params.quantity * rate);

    const tx = await db.inventoryTransaction.create({
      data: {
        itemId: params.itemId,
        storeId: params.storeId,
        locationId: params.locationId || null,
        transactionType: params.transactionType,
        quantity: params.quantity,
        unitId: params.unitId,
        rate,
        totalValue,
        batchNumber: params.batchNumber || null,
        expiryDate: params.expiryDate ? new Date(params.expiryDate) : null,
        referenceType: params.referenceType || null,
        referenceId: params.referenceId || null,
        remarks: params.remarks || null,
        status: 'POSTED',
        createdBy: params.createdBy
      }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        user: params.createdBy,
        role: 'STORE_MANAGER',
        action: `STOCK_IN_${params.transactionType}`,
        module: 'INVENTORY',
        description: `Stock IN (${params.transactionType}): ${params.quantity} ${params.unitId}`,
        itemId: params.itemId,
        quantity: params.quantity,
        storeId: params.storeId,
        reference: params.referenceId || params.referenceType || undefined
      }
    });

    return tx;
  }

  /**
   * Create an OUT transaction (TRANSFER_OUT, CONSUMPTION_OUT, WASTAGE_OUT, PURCHASE_RETURN_OUT, ADJUSTMENT_OUT)
   */
  static async createOutTransaction(params: CreateTransactionParams, prismaTx?: any) {
    if (params.quantity <= 0) {
      throw new Error('Transaction quantity must be greater than zero.');
    }

    const execute = async (tx: any) => {
      // Stock check inside transaction
      const validation = await this.validateStockAvailability(
        params.itemId,
        params.storeId,
        params.quantity,
        params.batchNumber,
        params.locationId
      );

      if (!validation.valid) {
        throw new Error(validation.message || 'Insufficient stock.');
      }

      const rate = params.rate ?? 0;
      const totalValue = params.totalValue ?? (params.quantity * rate);

      const createdTx = await tx.inventoryTransaction.create({
        data: {
          itemId: params.itemId,
          storeId: params.storeId,
          locationId: params.locationId || null,
          transactionType: params.transactionType,
          quantity: params.quantity,
          unitId: params.unitId,
          rate,
          totalValue,
          batchNumber: params.batchNumber || null,
          expiryDate: params.expiryDate ? new Date(params.expiryDate) : null,
          referenceType: params.referenceType || null,
          referenceId: params.referenceId || null,
          remarks: params.remarks || null,
          status: 'POSTED',
          createdBy: params.createdBy
        }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          user: params.createdBy,
          role: 'STORE_MANAGER',
          action: `STOCK_OUT_${params.transactionType}`,
          module: 'INVENTORY',
          description: `Stock OUT (${params.transactionType}): ${params.quantity} ${params.unitId}`,
          itemId: params.itemId,
          quantity: params.quantity,
          storeId: params.storeId,
          reference: params.referenceId || params.referenceType || undefined
        }
      });

      return createdTx;
    };

    if (prismaTx) {
      return await execute(prismaTx);
    } else {
      return await prisma.$transaction(async (tx) => execute(tx));
    }
  }

  /**
   * Get Stock Ledger for an Item with running balance
   */
  static async getStockLedger(itemId: string, filters?: { storeId?: string; batchNumber?: string; startDate?: string; endDate?: string }) {
    const where: any = { itemId, status: 'POSTED' };
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.batchNumber) where.batchNumber = filters.batchNumber;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters?.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const txs = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: true,
        store: true
      },
      orderBy: { createdAt: 'asc' }
    });

    let runningBalance = 0;
    const ledger = txs.map(tx => {
      const dir = this.getDirection(tx.transactionType);
      let inQty = 0;
      let outQty = 0;

      if (dir === 'IN') {
        inQty = tx.quantity;
        runningBalance += tx.quantity;
      } else if (dir === 'OUT') {
        outQty = tx.quantity;
        runningBalance -= tx.quantity;
      } else if (dir === 'REVERSAL') {
        if (tx.remarks && tx.remarks.includes('REVERSAL_OUT')) {
          inQty = tx.quantity;
          runningBalance += tx.quantity;
        } else {
          outQty = tx.quantity;
          runningBalance -= tx.quantity;
        }
      }

      return {
        id: tx.id,
        date: tx.createdAt.toISOString().split('T')[0],
        createdAt: tx.createdAt,
        transactionType: tx.transactionType,
        referenceType: tx.referenceType || 'N/A',
        referenceId: tx.referenceId || '',
        reference: tx.referenceType ? `${tx.referenceType} ${tx.referenceId || ''}`.trim() : (tx.remarks || 'Manual'),
        storeId: tx.storeId,
        storeName: tx.store.name,
        locationId: tx.locationId || '-',
        batchNumber: tx.batchNumber || '-',
        expiryDate: tx.expiryDate ? tx.expiryDate.toISOString().split('T')[0] : '-',
        inQty,
        outQty,
        balance: Math.max(0, runningBalance),
        rate: tx.rate || 0,
        totalValue: tx.totalValue || 0,
        remarks: tx.remarks || '',
        createdBy: tx.createdBy
      };
    });

    return ledger;
  }

  /**
   * Reverse an existing transaction
   */
  static async reverseTransaction(transactionId: string, reason: string, user: string) {
    const originalTx = await prisma.inventoryTransaction.findUnique({ where: { id: transactionId } });
    if (!originalTx) {
      throw new Error('Transaction not found.');
    }

    // Check if already reversed
    const existingReversal = await prisma.inventoryTransaction.findFirst({
      where: {
        referenceType: 'REVERSAL',
        referenceId: originalTx.id
      }
    });

    if (existingReversal) {
      throw new Error('Transaction has already been reversed.');
    }

    const origDir = this.getDirection(originalTx.transactionType);
    const isOrigIn = origDir === 'IN';

    // Create offsetting reversal transaction
    return await prisma.$transaction(async (tx) => {
      const reversalTxType = 'REVERSAL';
      const reversalRemarks = isOrigIn
        ? `REVERSAL_IN of ${originalTx.id}: ${reason}`
        : `REVERSAL_OUT of ${originalTx.id}: ${reason}`;

      const reversalTx = await tx.inventoryTransaction.create({
        data: {
          itemId: originalTx.itemId,
          storeId: originalTx.storeId,
          locationId: originalTx.locationId,
          transactionType: reversalTxType,
          quantity: originalTx.quantity,
          unitId: originalTx.unitId,
          rate: originalTx.rate,
          totalValue: originalTx.totalValue,
          batchNumber: originalTx.batchNumber,
          expiryDate: originalTx.expiryDate,
          referenceType: 'REVERSAL',
          referenceId: originalTx.id,
          remarks: reversalRemarks,
          status: 'POSTED',
          createdBy: user
        }
      });

      await tx.auditLog.create({
        data: {
          user,
          role: 'SUPER_ADMIN',
          action: 'TRANSACTION_REVERSED',
          module: 'INVENTORY',
          description: `Reversed transaction ${originalTx.id} (${originalTx.transactionType}): ${reason}`,
          itemId: originalTx.itemId,
          quantity: originalTx.quantity,
          storeId: originalTx.storeId,
          reference: originalTx.id
        }
      });

      return reversalTx;
    });
  }

  /**
   * Calculate overall stock valuation and average rates
   */
  static async calculateStockValue(itemId?: string, storeId?: string) {
    const itemWhere: any = { status: 'active' };
    if (itemId) itemWhere.id = itemId;

    const items = await prisma.item.findMany({ where: itemWhere });
    const stores = await prisma.store.findMany({ where: storeId ? { id: storeId } : { status: 'active' } });

    const result = [];
    for (const item of items) {
      for (const store of stores) {
        const availableQty = await this.getCurrentStock(item.id, store.id);
        if (availableQty > 0 || !itemId) {
          // Calculate average rate from IN transactions
          const inTxs = await prisma.inventoryTransaction.findMany({
            where: {
              itemId: item.id,
              storeId: store.id,
              transactionType: { in: [...STOCK_IN_TYPES] },
              status: 'POSTED'
            }
          });

          let totalInQty = 0;
          let totalInVal = 0;
          inTxs.forEach(t => {
            totalInQty += t.quantity;
            totalInVal += (t.totalValue || t.quantity * (t.rate || item.purchaseRate));
          });

          const avgRate = totalInQty > 0 ? (totalInVal / totalInQty) : item.purchaseRate;
          const stockValue = availableQty * avgRate;

          result.push({
            itemId: item.id,
            itemCode: item.code,
            itemName: item.name,
            category: item.category,
            storeId: store.id,
            storeName: store.name,
            availableQuantity: availableQty,
            unit: item.unit,
            averageRate: Math.round(avgRate * 100) / 100,
            stockValue: Math.round(stockValue * 100) / 100
          });
        }
      }
    }
    return result;
  }
}
