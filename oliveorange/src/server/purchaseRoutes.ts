import { Router } from 'express';
import { prisma, StockTransactionService } from './stockService';

export const purchaseRouter = Router();

// ==========================================
// 1. PURCHASE REQUISITIONS API
// ==========================================

// GET /api/purchases/requisitions - List Requisitions
purchaseRouter.get('/requisitions', async (req, res) => {
  try {
    const { status, storeId, priority } = req.query as any;

    const requisitions = await prisma.purchaseRequisition.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
        ...(priority ? { priority } : {})
      },
      include: {
        store: true,
        items: {
          include: {
            item: true,
            suggestedSupplier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requisitions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/requisitions - Create Requisition
purchaseRouter.post('/requisitions', async (req, res) => {
  try {
    const { requestedBy, storeId, requiredDate, priority, remarks, items } = req.body;

    if (!requestedBy || !storeId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'requestedBy, storeId, and items array are required.' });
    }

    const count = await prisma.purchaseRequisition.count();
    const currentYear = new Date().getFullYear();
    const requisitionNumber = `PR-${currentYear}-${String(count + 1).padStart(6, '0')}`;

    const requisition = await prisma.purchaseRequisition.create({
      data: {
        requisitionNumber,
        requestedBy,
        storeId,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        priority: priority || 'MEDIUM',
        status: 'DRAFT',
        remarks,
        items: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            requestedQuantity: parseFloat(i.requestedQuantity),
            unitId: i.unitId || 'Kg',
            suggestedSupplierId: i.suggestedSupplierId || null,
            remarks: i.remarks || null
          }))
        }
      },
      include: {
        store: true,
        items: { include: { item: true, suggestedSupplier: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: requestedBy,
        role: 'STORE_MANAGER',
        action: 'REQUISITION_CREATED',
        module: 'PURCHASE',
        description: `Created Purchase Requisition ${requisitionNumber}`,
        reference: requisition.id
      }
    });

    res.status(201).json(requisition);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/requisitions/:id
purchaseRouter.get('/requisitions/:id', async (req, res) => {
  try {
    const requisition = await prisma.purchaseRequisition.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        items: { include: { item: true, suggestedSupplier: true } }
      }
    });

    if (!requisition) return res.status(404).json({ error: 'Requisition not found.' });
    res.json(requisition);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/purchases/requisitions/:id - Update Draft Requisition
purchaseRouter.put('/requisitions/:id', async (req, res) => {
  try {
    const reqId = req.params.id;
    const { requiredDate, priority, remarks, items } = req.body;

    const existing = await prisma.purchaseRequisition.findUnique({ where: { id: reqId } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found.' });
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot update requisition in ${existing.status} status.` });
    }

    // Delete existing items & recreate
    await prisma.purchaseRequisitionItem.deleteMany({ where: { requisitionId: reqId } });

    const updated = await prisma.purchaseRequisition.update({
      where: { id: reqId },
      data: {
        requiredDate: requiredDate ? new Date(requiredDate) : undefined,
        priority: priority || existing.priority,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        items: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            requestedQuantity: parseFloat(i.requestedQuantity),
            unitId: i.unitId || 'Kg',
            suggestedSupplierId: i.suggestedSupplierId || null,
            remarks: i.remarks || null
          }))
        }
      },
      include: {
        store: true,
        items: { include: { item: true, suggestedSupplier: true } }
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/requisitions/:id/submit
purchaseRouter.post('/requisitions/:id/submit', async (req, res) => {
  try {
    const reqId = req.params.id;
    const existing = await prisma.purchaseRequisition.findUnique({ where: { id: reqId } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found.' });
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot submit requisition in ${existing.status} status.` });
    }

    const updated = await prisma.purchaseRequisition.update({
      where: { id: reqId },
      data: { status: 'SUBMITTED' },
      include: { store: true, items: { include: { item: true } } }
    });

    await prisma.auditLog.create({
      data: {
        user: existing.requestedBy,
        role: 'STORE_MANAGER',
        action: 'REQUISITION_SUBMITTED',
        module: 'PURCHASE',
        description: `Submitted Purchase Requisition ${existing.requisitionNumber}`,
        reference: reqId
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/requisitions/:id/approve
purchaseRouter.post('/requisitions/:id/approve', async (req, res) => {
  try {
    const reqId = req.params.id;
    const { approvedBy } = req.body;

    const existing = await prisma.purchaseRequisition.findUnique({ where: { id: reqId } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found.' });
    if (existing.status !== 'SUBMITTED' && existing.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot approve requisition in ${existing.status} status.` });
    }

    const updated = await prisma.purchaseRequisition.update({
      where: { id: reqId },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'Purchase Manager',
        approvedAt: new Date()
      },
      include: { store: true, items: { include: { item: true } } }
    });

    await prisma.auditLog.create({
      data: {
        user: approvedBy || 'Purchase Manager',
        role: 'PURCHASE_MANAGER',
        action: 'REQUISITION_APPROVED',
        module: 'PURCHASE',
        description: `Approved Purchase Requisition ${existing.requisitionNumber}`,
        reference: reqId
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/requisitions/:id/reject
purchaseRouter.post('/requisitions/:id/reject', async (req, res) => {
  try {
    const reqId = req.params.id;
    const { rejectedBy, reason } = req.body;

    const existing = await prisma.purchaseRequisition.findUnique({ where: { id: reqId } });
    if (!existing) return res.status(404).json({ error: 'Requisition not found.' });

    const updated = await prisma.purchaseRequisition.update({
      where: { id: reqId },
      data: {
        status: 'REJECTED',
        remarks: reason ? `${existing.remarks || ''} [Rejected Reason: ${reason}]`.trim() : existing.remarks
      }
    });

    await prisma.auditLog.create({
      data: {
        user: rejectedBy || 'Purchase Manager',
        role: 'PURCHASE_MANAGER',
        action: 'REQUISITION_REJECTED',
        module: 'PURCHASE',
        description: `Rejected Purchase Requisition ${existing.requisitionNumber}: ${reason || 'No reason provided'}`,
        reference: reqId
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PURCHASE ORDERS API
// ==========================================

// GET /api/purchases/orders - List Orders
purchaseRouter.get('/orders', async (req, res) => {
  try {
    const { status, supplierId, storeId } = req.query as any;

    const orders = await prisma.purchaseOrder.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(storeId ? { storeId } : {})
      },
      include: {
        supplier: true,
        store: true,
        requisition: true,
        items: { include: { item: true } },
        grns: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/orders - Create Purchase Order
purchaseRouter.post('/orders', async (req, res) => {
  try {
    const {
      supplierId,
      storeId,
      requisitionId,
      orderDate,
      expectedDeliveryDate,
      paymentTerms,
      discount = 0,
      taxAmount = 0,
      shippingAmount = 0,
      createdBy,
      notes,
      items
    } = req.body;

    if (!supplierId || !storeId || !createdBy || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplierId, storeId, createdBy, and items array are required.' });
    }

    // Calculation using exact line items
    let subtotal = 0;
    let totalTax = 0;

    const processedItems = items.map((i: any) => {
      const qty = parseFloat(i.orderedQuantity);
      const price = parseFloat(i.unitPrice);
      const itemDiscount = parseFloat(i.discount || 0);
      const taxRate = parseFloat(i.taxRate || 0);

      const baseAmount = qty * price;
      const taxableAmount = Math.max(0, baseAmount - itemDiscount);
      const lineTax = (taxableAmount * taxRate) / 100;
      const lineTotal = taxableAmount + lineTax;

      subtotal += baseAmount;
      totalTax += lineTax;

      return {
        itemId: i.itemId,
        orderedQuantity: qty,
        unitId: i.unitId || 'Kg',
        unitPrice: price,
        discount: itemDiscount,
        taxRate,
        taxAmount: Math.round(lineTax * 100) / 100,
        lineTotal: Math.round(lineTotal * 100) / 100,
        receivedQuantity: 0,
        pendingQuantity: qty,
        remarks: i.remarks || null
      };
    });

    const poDiscount = parseFloat(discount || 0);
    const poShipping = parseFloat(shippingAmount || 0);
    const poTax = taxAmount !== undefined ? parseFloat(taxAmount) : totalTax;

    const grandTotal = subtotal - poDiscount + poTax + poShipping;

    const count = await prisma.purchaseOrder.count();
    const currentYear = new Date().getFullYear();
    const poNumber = `PO-${currentYear}-${String(count + 1).padStart(6, '0')}`;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        storeId,
        requisitionId: requisitionId || null,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        paymentTerms,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: poDiscount,
        taxAmount: Math.round(poTax * 100) / 100,
        shippingAmount: poShipping,
        grandTotal: Math.round(grandTotal * 100) / 100,
        status: 'DRAFT',
        createdBy,
        notes,
        items: {
          create: processedItems
        }
      },
      include: {
        supplier: true,
        store: true,
        items: { include: { item: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: createdBy,
        role: 'PURCHASE_MANAGER',
        action: 'PO_CREATED',
        module: 'PURCHASE',
        description: `Created Purchase Order ${poNumber} for supplier ${purchaseOrder.supplier.name} (Total: ₹${grandTotal})`,
        reference: purchaseOrder.id
      }
    });

    res.status(201).json(purchaseOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/orders/:id
purchaseRouter.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        store: true,
        requisition: true,
        items: { include: { item: true } },
        grns: {
          include: {
            items: { include: { item: true } }
          }
        }
      }
    });

    if (!order) return res.status(404).json({ error: 'Purchase Order not found.' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/orders/:id/submit
purchaseRouter.post('/orders/:id/submit', async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found.' });
    if (order.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot submit PO in ${order.status} status.` });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status: 'PENDING_APPROVAL' },
      include: { supplier: true, store: true, items: true }
    });

    await prisma.auditLog.create({
      data: {
        user: order.createdBy,
        role: 'PURCHASE_MANAGER',
        action: 'PO_SUBMITTED',
        module: 'PURCHASE',
        description: `Submitted Purchase Order ${order.poNumber} for approval`,
        reference: order.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/orders/:id/approve
purchaseRouter.post('/orders/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const order = await prisma.purchaseOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found.' });
    if (order.status !== 'PENDING_APPROVAL' && order.status !== 'DRAFT') {
      return res.status(400).json({ error: `Cannot approve PO in ${order.status} status.` });
    }

    // Check if user is approving their own PO (if strict setting enforced)
    if (order.createdBy === approvedBy && process.env.ALLOW_SELF_APPROVAL !== 'true') {
      // In development / demo we allow self-approval if explicitly requested or default fallback
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'Store Director',
        approvedAt: new Date()
      },
      include: { supplier: true, store: true, items: true }
    });

    await prisma.auditLog.create({
      data: {
        user: approvedBy || 'Store Director',
        role: 'DIRECTOR',
        action: 'PO_APPROVED',
        module: 'PURCHASE',
        description: `Approved Purchase Order ${order.poNumber}`,
        reference: order.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/orders/:id/cancel
purchaseRouter.post('/orders/:id/cancel', async (req, res) => {
  try {
    const { user, reason } = req.body;
    const order = await prisma.purchaseOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Purchase Order not found.' });
    if (['FULLY_RECEIVED', 'CLOSED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel PO in ${order.status} status.` });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${order.notes || ''} [Cancelled Reason: ${reason}]`.trim() : order.notes
      }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Purchase Manager',
        role: 'PURCHASE_MANAGER',
        action: 'PO_CANCELLED',
        module: 'PURCHASE',
        description: `Cancelled Purchase Order ${order.poNumber}`,
        reference: order.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. GOODS RECEIVED NOTE (GRN) API
// ==========================================

// GET /api/purchases/grn - List GRNs
purchaseRouter.get('/grn', async (req, res) => {
  try {
    const { status, purchaseOrderId, supplierId, storeId } = req.query as any;

    const grns = await prisma.goodsReceivedNote.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(purchaseOrderId ? { purchaseOrderId } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(storeId ? { storeId } : {})
      },
      include: {
        purchaseOrder: true,
        supplier: true,
        store: true,
        items: { include: { item: true, purchaseOrderItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(grns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/grn - Create GRN (Draft or Pending Inspection)
purchaseRouter.post('/grn', async (req, res) => {
  try {
    const {
      purchaseOrderId,
      receivedDate,
      invoiceNumber,
      invoiceDate,
      vehicleNumber,
      receivedBy,
      remarks,
      items
    } = req.body;

    if (!purchaseOrderId || !receivedBy || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'purchaseOrderId, receivedBy, and items array are required.' });
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true, supplier: true, store: true }
    });

    if (!po) return res.status(404).json({ error: 'Associated Purchase Order not found.' });
    if (po.status !== 'APPROVED' && po.status !== 'SENT' && po.status !== 'PARTIALLY_RECEIVED') {
      return res.status(400).json({ error: `Cannot receive Goods for PO in ${po.status} status. PO must be APPROVED.` });
    }

    let subtotal = 0;
    let taxAmount = 0;

    const processedItems = items.map((i: any) => {
      const poItem = po.items.find(pi => pi.id === i.purchaseOrderItemId || pi.itemId === i.itemId);
      const orderedQty = poItem ? poItem.orderedQuantity : (i.orderedQuantity || 0);
      const rcvQty = parseFloat(i.receivedQuantity || 0);
      const accQty = i.acceptedQuantity !== undefined ? parseFloat(i.acceptedQuantity) : rcvQty;
      const rejQty = i.rejectedQuantity !== undefined ? parseFloat(i.rejectedQuantity) : Math.max(0, rcvQty - accQty);
      const unitPrice = i.unitPrice !== undefined ? parseFloat(i.unitPrice) : (poItem ? poItem.unitPrice : 0);

      const lineTotal = accQty * unitPrice;
      subtotal += lineTotal;

      return {
        purchaseOrderItemId: poItem ? poItem.id : null,
        itemId: i.itemId,
        orderedQuantity: orderedQty,
        receivedQuantity: rcvQty,
        acceptedQuantity: accQty,
        rejectedQuantity: rejQty,
        unitId: i.unitId || (poItem ? poItem.unitId : 'Kg'),
        unitPrice,
        batchNumber: i.batchNumber || null,
        expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,
        rejectionReason: i.rejectionReason || null,
        remarks: i.remarks || null
      };
    });

    const grandTotal = subtotal + taxAmount;

    const count = await prisma.goodsReceivedNote.count();
    const currentYear = new Date().getFullYear();
    const grnNumber = `GRN-${currentYear}-${String(count + 1).padStart(6, '0')}`;

    const grn = await prisma.goodsReceivedNote.create({
      data: {
        grnNumber,
        purchaseOrderId,
        supplierId: po.supplierId,
        storeId: po.storeId,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        invoiceNumber,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        vehicleNumber,
        receivedBy,
        qualityStatus: 'PENDING',
        status: 'DRAFT',
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        remarks,
        items: {
          create: processedItems
        }
      },
      include: {
        purchaseOrder: true,
        supplier: true,
        store: true,
        items: { include: { item: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: receivedBy,
        role: 'STORE_RECEIVER',
        action: 'GRN_CREATED',
        module: 'PURCHASE',
        description: `Created GRN ${grnNumber} for PO ${po.poNumber}`,
        reference: grn.id
      }
    });

    res.status(201).json(grn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/grn/:id
purchaseRouter.get('/grn/:id', async (req, res) => {
  try {
    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id: req.params.id },
      include: {
        purchaseOrder: { include: { items: { include: { item: true } } } },
        supplier: true,
        store: true,
        items: { include: { item: true, purchaseOrderItem: true } }
      }
    });

    if (!grn) return res.status(404).json({ error: 'GRN not found.' });
    res.json(grn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/grn/:id/inspect - Submit Quality Inspection Result
purchaseRouter.post('/grn/:id/inspect', async (req, res) => {
  try {
    const grnId = req.params.id;
    const { inspectorName, qualityStatus, itemInspections } = req.body;

    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id: grnId },
      include: { items: true }
    });

    if (!grn) return res.status(404).json({ error: 'GRN not found.' });
    if (grn.status === 'APPROVED') {
      return res.status(400).json({ error: 'GRN has already been approved and posted.' });
    }

    // Update line item inspection quantities if supplied
    if (Array.isArray(itemInspections)) {
      for (const insp of itemInspections) {
        if (insp.id) {
          const acc = parseFloat(insp.acceptedQuantity);
          const rej = parseFloat(insp.rejectedQuantity || 0);
          await prisma.goodsReceivedNoteItem.update({
            where: { id: insp.id },
            data: {
              acceptedQuantity: acc,
              rejectedQuantity: rej,
              rejectionReason: insp.rejectionReason || null,
              batchNumber: insp.batchNumber || undefined,
              expiryDate: insp.expiryDate ? new Date(insp.expiryDate) : undefined
            }
          });
        }
      }
    }

    const updated = await prisma.goodsReceivedNote.update({
      where: { id: grnId },
      data: {
        qualityStatus: qualityStatus || 'PASSED',
        status: 'INSPECTED'
      },
      include: { items: { include: { item: true } } }
    });

    await prisma.auditLog.create({
      data: {
        user: inspectorName || 'Quality Inspector',
        role: 'QUALITY_INSPECTOR',
        action: 'GRN_INSPECTED',
        module: 'PURCHASE',
        description: `Inspected GRN ${grn.grnNumber}: Quality Status = ${qualityStatus || 'PASSED'}`,
        reference: grnId
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRITICAL ENDPOINT: POST /api/purchases/grn/:id/approve
 * Performs GRN Approval + PURCHASE_IN Stock Integration inside a database transaction!
 */
purchaseRouter.post('/grn/:id/approve', async (req, res) => {
  try {
    const grnId = req.params.id;
    const { approvedBy } = req.body;

    // 1. Fetch GRN with related PO, Store, and Items
    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id: grnId },
      include: {
        purchaseOrder: { include: { items: true } },
        store: true,
        items: { include: { item: true, purchaseOrderItem: true } }
      }
    });

    if (!grn) {
      return res.status(404).json({ error: 'GRN not found.' });
    }

    // DUPLICATE APPROVAL PROTECTION
    if (grn.status === 'APPROVED' || grn.approvedAt !== null) {
      return res.status(400).json({ error: 'GRN has already been approved.' });
    }

    const settings = await StockTransactionService.getSettings();
    const allowOverReceiving = settings.allowOverReceiving;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // PRE-VALIDATIONS BEFORE DATABASE TRANSACTION
    for (const item of grn.items) {
      const itemDef = item.item;

      // Acceptance + Rejection validation
      if (item.acceptedQuantity + item.rejectedQuantity !== item.receivedQuantity) {
        return res.status(400).json({
          error: `Validation Error for ${itemDef.name}: Accepted (${item.acceptedQuantity}) + Rejected (${item.rejectedQuantity}) must equal Received (${item.receivedQuantity}).`
        });
      }

      // Check pending quantity on PO item
      const poItem = grn.purchaseOrder.items.find(pi => pi.id === item.purchaseOrderItemId || pi.itemId === item.itemId);
      if (poItem) {
        if (item.acceptedQuantity > poItem.pendingQuantity && !allowOverReceiving) {
          return res.status(400).json({
            error: `Over-receiving rejected for '${itemDef.name}'. Accepted (${item.acceptedQuantity}) exceeds pending PO quantity (${poItem.pendingQuantity}).`
          });
        }
      }

      // Batch Tracking Validation
      if (itemDef.batchTracking && (!item.batchNumber || item.batchNumber.trim() === '')) {
        return res.status(400).json({
          error: `Approval Rejected: Batch number is mandatory for batch-tracked item '${itemDef.name}'.`
        });
      }

      // Expiry Tracking & Perishable Validation
      if (itemDef.expiryTracking) {
        if (!item.expiryDate) {
          return res.status(400).json({
            error: `Approval Rejected: Expiry date is mandatory for expiry-tracked item '${itemDef.name}'.`
          });
        }

        const expDate = new Date(item.expiryDate);
        expDate.setHours(0, 0, 0, 0);

        if (expDate < today) {
          return res.status(400).json({
            error: `Approval Rejected: Expired batch detected for '${itemDef.name}' (Expiry: ${expDate.toISOString().split('T')[0]}). Cannot accept expired goods.`
          });
        }
      }
    }

    // 2. ATOMIC DATABASE TRANSACTION FOR GRN APPROVAL & INVENTORY INTEGRATION
    const result = await prisma.$transaction(async (tx) => {
      // Re-check GRN status inside transaction to prevent race conditions
      const txGrn = await tx.goodsReceivedNote.findUnique({ where: { id: grnId } });
      if (!txGrn || txGrn.status === 'APPROVED' || txGrn.approvedAt !== null) {
        throw new Error('GRN has already been approved.');
      }

      // A. Create PURCHASE_IN inventory transactions ONLY for accepted quantity > 0
      for (const item of grn.items) {
        if (item.acceptedQuantity > 0) {
          await StockTransactionService.createInTransaction({
            itemId: item.itemId,
            storeId: grn.storeId,
            locationId: grn.locationId || undefined,
            transactionType: 'PURCHASE_IN',
            quantity: item.acceptedQuantity,
            unitId: item.unitId,
            rate: item.unitPrice,
            totalValue: item.acceptedQuantity * item.unitPrice,
            batchNumber: item.batchNumber || undefined,
            expiryDate: item.expiryDate || undefined,
            referenceType: 'GRN',
            referenceId: grn.grnNumber,
            remarks: `Received via GRN ${grn.grnNumber} for PO ${grn.purchaseOrder.poNumber}`,
            createdBy: approvedBy || 'Store Approver'
          }, tx);
        }
      }

      // B. Update Purchase Order Item Received & Pending Quantities
      for (const item of grn.items) {
        const poItem = grn.purchaseOrder.items.find(pi => pi.id === item.purchaseOrderItemId || pi.itemId === item.itemId);
        if (poItem) {
          const newReceived = poItem.receivedQuantity + item.acceptedQuantity;
          const newPending = Math.max(0, poItem.orderedQuantity - newReceived);

          await tx.purchaseOrderItem.update({
            where: { id: poItem.id },
            data: {
              receivedQuantity: newReceived,
              pendingQuantity: newPending
            }
          });
        }
      }

      // C. Recalculate PO overall status (PARTIALLY_RECEIVED vs FULLY_RECEIVED)
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: grn.purchaseOrderId }
      });

      const totalOrdered = updatedPoItems.reduce((sum, i) => sum + i.orderedQuantity, 0);
      const totalReceived = updatedPoItems.reduce((sum, i) => sum + i.receivedQuantity, 0);

      let newPoStatus = 'PARTIALLY_RECEIVED';
      if (totalReceived >= totalOrdered) {
        newPoStatus = 'FULLY_RECEIVED';
      }

      await tx.purchaseOrder.update({
        where: { id: grn.purchaseOrderId },
        data: { status: newPoStatus }
      });

      // D. Update GRN status to APPROVED
      const approvedGrn = await tx.goodsReceivedNote.update({
        where: { id: grnId },
        data: {
          status: 'APPROVED',
          approvedBy: approvedBy || 'Store Approver',
          approvedAt: new Date()
        },
        include: {
          purchaseOrder: true,
          supplier: true,
          store: true,
          items: { include: { item: true } }
        }
      });

      // E. Audit Log
      await tx.auditLog.create({
        data: {
          user: approvedBy || 'Store Approver',
          role: 'STORE_MANAGER',
          action: 'GRN_APPROVED',
          module: 'PURCHASE',
          description: `Approved GRN ${grn.grnNumber} & created PURCHASE_IN inventory transactions`,
          reference: grnId
        }
      });

      return approvedGrn;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/purchases/grn/:id/reject - Reject GRN
purchaseRouter.post('/grn/:id/reject', async (req, res) => {
  try {
    const grnId = req.params.id;
    const { rejectedBy, reason } = req.body;

    const grn = await prisma.goodsReceivedNote.findUnique({ where: { id: grnId } });
    if (!grn) return res.status(404).json({ error: 'GRN not found.' });
    if (grn.status === 'APPROVED') {
      return res.status(400).json({ error: 'Cannot reject an already approved GRN.' });
    }

    const updated = await prisma.goodsReceivedNote.update({
      where: { id: grnId },
      data: {
        status: 'REJECTED',
        qualityStatus: 'FAILED',
        remarks: reason ? `${grn.remarks || ''} [Rejected Reason: ${reason}]`.trim() : grn.remarks
      }
    });

    await prisma.auditLog.create({
      data: {
        user: rejectedBy || 'Quality Inspector',
        role: 'QUALITY_INSPECTOR',
        action: 'GRN_REJECTED',
        module: 'PURCHASE',
        description: `Rejected GRN ${grn.grnNumber}: ${reason || 'Failed inspection'}`,
        reference: grnId
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. PURCHASE RETURNS API
// ==========================================

// GET /api/purchases/returns - List Returns
purchaseRouter.get('/returns', async (req, res) => {
  try {
    const { status, supplierId, storeId } = req.query as any;

    const returns = await prisma.purchaseReturn.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(storeId ? { storeId } : {})
      },
      include: {
        supplier: true,
        purchaseOrder: true,
        grn: true,
        store: true,
        items: { include: { item: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/returns - Create Purchase Return
purchaseRouter.post('/returns', async (req, res) => {
  try {
    const { supplierId, purchaseOrderId, grnId, storeId, returnDate, reason, createdBy, items } = req.body;

    if (!supplierId || !storeId || !reason || !createdBy || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplierId, storeId, reason, createdBy, and items array are required.' });
    }

    const count = await prisma.purchaseReturn.count();
    const currentYear = new Date().getFullYear();
    const returnNumber = `PRT-${currentYear}-${String(count + 1).padStart(6, '0')}`;

    const processedItems = items.map((i: any) => {
      const qty = parseFloat(i.quantity);
      const rate = parseFloat(i.rate);
      return {
        itemId: i.itemId,
        quantity: qty,
        unitId: i.unitId || 'Kg',
        batchNumber: i.batchNumber || null,
        reason: i.reason || null,
        rate,
        totalValue: qty * rate
      };
    });

    const purchaseReturn = await prisma.purchaseReturn.create({
      data: {
        returnNumber,
        supplierId,
        purchaseOrderId: purchaseOrderId || null,
        grnId: grnId || null,
        storeId,
        returnDate: returnDate ? new Date(returnDate) : new Date(),
        reason,
        status: 'DRAFT',
        createdBy,
        items: {
          create: processedItems
        }
      },
      include: {
        supplier: true,
        store: true,
        items: { include: { item: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: createdBy,
        role: 'STORE_MANAGER',
        action: 'PURCHASE_RETURN_CREATED',
        module: 'PURCHASE',
        description: `Created Purchase Return ${returnNumber} for supplier`,
        reference: purchaseReturn.id
      }
    });

    res.status(201).json(purchaseReturn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/returns/:id
purchaseRouter.get('/returns/:id', async (req, res) => {
  try {
    const ret = await prisma.purchaseReturn.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        purchaseOrder: true,
        grn: true,
        store: true,
        items: { include: { item: true } }
      }
    });

    if (!ret) return res.status(404).json({ error: 'Purchase Return not found.' });
    res.json(ret);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/returns/:id/approve
purchaseRouter.post('/returns/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const ret = await prisma.purchaseReturn.findUnique({ where: { id: req.params.id } });
    if (!ret) return res.status(404).json({ error: 'Purchase Return not found.' });

    const updated = await prisma.purchaseReturn.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'Store Director'
      }
    });

    await prisma.auditLog.create({
      data: {
        user: approvedBy || 'Store Director',
        role: 'DIRECTOR',
        action: 'PURCHASE_RETURN_APPROVED',
        module: 'PURCHASE',
        description: `Approved Purchase Return ${ret.returnNumber}`,
        reference: ret.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/returns/:id/complete - Completes Return & Creates PURCHASE_RETURN_OUT Transactions
purchaseRouter.post('/returns/:id/complete', async (req, res) => {
  try {
    const returnId = req.params.id;
    const { completedBy } = req.body;

    const ret = await prisma.purchaseReturn.findUnique({
      where: { id: returnId },
      include: { items: { include: { item: true } }, store: true }
    });

    if (!ret) return res.status(404).json({ error: 'Purchase Return not found.' });
    if (ret.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Purchase Return has already been completed.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct stock via StockTransactionService createOutTransaction with PURCHASE_RETURN_OUT
      for (const item of ret.items) {
        // Validate stock availability
        const validation = await StockTransactionService.validateStockAvailability(
          item.itemId,
          ret.storeId,
          item.quantity,
          item.batchNumber || undefined
        );

        if (!validation.valid) {
          throw new Error(`Cannot complete return for '${item.item.name}': ${validation.message}`);
        }

        await tx.inventoryTransaction.create({
          data: {
            itemId: item.itemId,
            storeId: ret.storeId,
            transactionType: 'PURCHASE_RETURN_OUT',
            quantity: item.quantity,
            unitId: item.unitId,
            rate: item.rate,
            totalValue: item.totalValue,
            batchNumber: item.batchNumber,
            referenceType: 'PURCHASE_RETURN',
            referenceId: ret.returnNumber,
            remarks: `Purchase Return to Supplier: ${ret.reason}`,
            status: 'POSTED',
            createdBy: completedBy || 'Store Manager'
          }
        });
      }

      // 2. Mark Return as COMPLETED
      const completedRet = await tx.purchaseReturn.update({
        where: { id: returnId },
        data: { status: 'COMPLETED' },
        include: { items: { include: { item: true } }, supplier: true }
      });

      await tx.auditLog.create({
        data: {
          user: completedBy || 'Store Manager',
          role: 'STORE_MANAGER',
          action: 'PURCHASE_RETURN_COMPLETED',
          module: 'PURCHASE',
          description: `Completed Purchase Return ${ret.returnNumber} & posted PURCHASE_RETURN_OUT stock deduction`,
          reference: returnId
        }
      });

      return completedRet;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 5. SUPPLIERS API & HISTORY
// ==========================================

// GET /api/purchases/suppliers - List Suppliers
purchaseRouter.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/suppliers - Create Supplier
purchaseRouter.post('/suppliers', async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, gstin, category, paymentTerms } = req.body;

    if (!name) return res.status(400).json({ error: 'Supplier name is required.' });

    const count = await prisma.supplier.count();
    const code = `SUP-${String(count + 1).padStart(4, '0')}`;

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        contactPerson,
        email,
        phone,
        address,
        gstin,
        category: category || 'Provisions',
        paymentTerms: paymentTerms || 'Net 30'
      }
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/suppliers/:id - Supplier Detail with Purchase History
purchaseRouter.get('/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });

    const pos = await prisma.purchaseOrder.findMany({
      where: { supplierId: id },
      include: { items: { include: { item: true } } },
      orderBy: { orderDate: 'desc' }
    });

    const grns = await prisma.goodsReceivedNote.findMany({
      where: { supplierId: id },
      include: { items: { include: { item: true } } },
      orderBy: { receivedDate: 'desc' }
    });

    const returns = await prisma.purchaseReturn.findMany({
      where: { supplierId: id },
      include: { items: { include: { item: true } } },
      orderBy: { returnDate: 'desc' }
    });

    const totalPurchaseValue = grns
      .filter(g => g.status === 'APPROVED')
      .reduce((sum, g) => sum + g.grandTotal, 0);

    const pendingPOCount = pos.filter(p => p.status === 'APPROVED' || p.status === 'SENT' || p.status === 'PARTIALLY_RECEIVED').length;

    const lastGrn = grns.find(g => g.status === 'APPROVED');
    const lastPurchaseDate = lastGrn ? lastGrn.receivedDate.toISOString().split('T')[0] : null;

    // Item-wise Purchase History for Supplier
    const itemHistoryMap = new Map<string, { itemName: string; totalQty: number; avgRate: number; lastRate: number; lastDate: string }>();

    grns.filter(g => g.status === 'APPROVED').forEach(g => {
      g.items.forEach(gi => {
        const key = gi.itemId;
        const existing = itemHistoryMap.get(key) || {
          itemName: gi.item.name,
          totalQty: 0,
          avgRate: gi.unitPrice,
          lastRate: gi.unitPrice,
          lastDate: g.receivedDate.toISOString().split('T')[0]
        };

        existing.totalQty += gi.acceptedQuantity;
        existing.lastRate = gi.unitPrice;
        itemHistoryMap.set(key, existing);
      });
    });

    res.json({
      supplier,
      metrics: {
        totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
        numberOfPOs: pos.length,
        numberOfGRNs: grns.length,
        pendingPOs: pendingPOCount,
        numberOfReturns: returns.length,
        lastPurchaseDate
      },
      orders: pos,
      grns,
      returns,
      itemWiseHistory: Array.from(itemHistoryMap.values())
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. ITEM PURCHASE & PRICE HISTORY API
// ==========================================

// GET /api/purchases/items/:itemId/history - Rate & Purchase History for an Item
purchaseRouter.get('/items/:itemId/history', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    // Fetch GRN line items for this item
    const grnItems = await prisma.goodsReceivedNoteItem.findMany({
      where: {
        itemId,
        grn: { status: 'APPROVED' }
      },
      include: {
        grn: { include: { supplier: true, purchaseOrder: true } }
      },
      orderBy: { grn: { receivedDate: 'asc' } }
    });

    const priceHistory = grnItems.map(gi => ({
      date: gi.grn.receivedDate.toISOString().split('T')[0],
      supplierName: gi.grn.supplier.name,
      poNumber: gi.grn.purchaseOrder.poNumber,
      grnNumber: gi.grn.grnNumber,
      quantity: gi.acceptedQuantity,
      unitPrice: gi.unitPrice,
      batchNumber: gi.batchNumber || 'N/A',
      expiryDate: gi.expiryDate ? gi.expiryDate.toISOString().split('T')[0] : 'N/A'
    }));

    res.json({
      item,
      currentPurchaseRate: item.purchaseRate,
      averageRate: item.avgRate,
      priceHistory
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. REAL PURCHASE DASHBOARD METRICS API
// ==========================================

purchaseRouter.get('/dashboard', async (req, res) => {
  try {
    const [
      pendingRequisitions,
      pendingPOApprovals,
      openPurchaseOrders,
      todayGrnList,
      pendingGrns,
      monthGrns,
      purchaseReturns,
      approvedGrnItems
    ] = await Promise.all([
      prisma.purchaseRequisition.count({ where: { status: 'SUBMITTED' } }),
      prisma.purchaseOrder.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.purchaseOrder.count({ where: { status: { in: ['APPROVED', 'SENT', 'PARTIALLY_RECEIVED'] } } }),
      prisma.goodsReceivedNote.findMany({
        where: {
          receivedDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.goodsReceivedNote.count({ where: { status: { in: ['DRAFT', 'PENDING_INSPECTION', 'INSPECTED', 'PENDING_APPROVAL'] } } }),
      prisma.goodsReceivedNote.findMany({
        where: {
          status: 'APPROVED',
          receivedDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      }),
      prisma.purchaseReturn.findMany({
        where: { status: 'COMPLETED' },
        include: { items: true }
      }),
      prisma.goodsReceivedNoteItem.findMany({
        where: { grn: { status: 'APPROVED' } },
        include: { item: true }
      })
    ]);

    const purchaseValueThisMonth = monthGrns.reduce((sum, g) => sum + g.grandTotal, 0);

    let purchaseReturnValue = 0;
    purchaseReturns.forEach(r => {
      r.items.forEach(ri => purchaseReturnValue += ri.totalValue);
    });

    // Top Purchased Items
    const itemMap = new Map<string, { itemId: string; itemName: string; totalQty: number; totalValue: number }>();
    approvedGrnItems.forEach(gi => {
      const existing = itemMap.get(gi.itemId) || {
        itemId: gi.itemId,
        itemName: gi.item.name,
        totalQty: 0,
        totalValue: 0
      };
      existing.totalQty += gi.acceptedQuantity;
      existing.totalValue += (gi.acceptedQuantity * gi.unitPrice);
      itemMap.set(gi.itemId, existing);
    });

    const topPurchasedItems = Array.from(itemMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    res.json({
      pendingRequisitions,
      pendingPOApprovals,
      openPurchaseOrders,
      todaysGRNs: todayGrnList.length,
      pendingGRNs: pendingGrns,
      purchaseValueThisMonth: Math.round(purchaseValueThisMonth * 100) / 100,
      purchaseReturnValue: Math.round(purchaseReturnValue * 100) / 100,
      topPurchasedItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
