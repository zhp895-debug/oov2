/**
 * OliveOrange Stock Management System - Type Definitions
 */

export type RoleType = 
  | 'super_admin'
  | 'store_manager'
  | 'store_staff'
  | 'kitchen_manager'
  | 'accountant'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  department: string;
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export type ItemCategory = 
  | 'Grains'
  | 'Flour'
  | 'Pulses'
  | 'Oil'
  | 'Spices'
  | 'Oil & Ghee'
  | 'Spices & Masala'
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Packaging'
  | 'Beverages'
  | 'Cleaning Materials'
  | 'Kitchen Supplies'
  | 'Other';

export type UnitType = 
  | 'Kg'
  | 'Gram'
  | 'Ltr'
  | 'Ml'
  | 'Pcs'
  | 'Box'
  | 'Bag'
  | 'Packet'
  | 'Tin'
  | 'Bottle'
  | 'Jar'
  | 'Bundle';

export interface InventoryItem {
  id: string;
  code: string; // SKU code e.g. PRM-GRN-001
  name: string;
  category: ItemCategory;
  subCategory?: string;
  unit: UnitType;
  brand?: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  storageLocation: string; // e.g. Main Store
  shelfRack?: string; // e.g. A-12
  primarySupplierId: string;
  primarySupplierName: string;
  purchaseRate: number; // Purchase cost in ₹ per unit
  avgRate: number;
  batchTracking: boolean;
  expiryTracking: boolean;
  status: 'active' | 'inactive';
  description?: string;
  createdDate?: string;
  updatedDate?: string;
}

export type StoreType = 'main' | 'dry' | 'cold' | 'vegetable' | 'kitchen' | 'KITCHEN' | 'COUNTER' | 'BAKERY' | 'DISPENSER' | 'CENTRAL' | 'other';

export interface Store {
  id: string;
  code: string;
  name: string;
  type: StoreType;
  location: string;
  managerName?: string;
  inCharge?: string;
  contactNumber?: string;
  isMainStore?: boolean;
  status?: 'active' | 'inactive';
}

export interface BatchInfo {
  batchNumber: string;
  mfgDate?: string;
  expiryDate?: string;
  purchaseRate?: number;
  quantity: number;
  storeId?: string;
  unitRate?: number;
}

export interface StockBalance {
  id?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: ItemCategory;
  unit: UnitType;
  storeId: string;
  storeName: string;
  currentStock: number;
  availableQuantity?: number;
  allocatedStock?: number;
  availableStock?: number;
  reservedQuantity?: number;
  damagedQuantity?: number;
  purchaseRate?: number;
  avgRate: number;
  totalValuation: number;
  batches: BatchInfo[];
  lastUpdated: string;
}

export type TransactionType = 
  | 'opening_stock'
  | 'grn_receive'
  | 'transfer_in'
  | 'transfer_out'
  | 'kitchen_issue'
  | 'production_consumption'
  | 'direct_consumption'
  | 'wastage'
  | 'stock_adjustment'
  | 'purchase_return'
  | 'PURCHASE_RECEIPT'
  | 'GRN_RECEIPT'
  | 'STORE_TRANSFER_OUT'
  | 'STORE_TRANSFER_IN'
  | 'KITCHEN_CONSUMPTION'
  | 'STOCK_ADJUSTMENT'
  | 'PHYSICAL_ADJUSTMENT'
  | 'WASTAGE_LOG'
  | 'SUPPLIER_RETURN';

export interface StockTransaction {
  id: string;
  transactionNumber?: string;
  date: string;
  type: TransactionType;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  quantity: number;
  rate: number;
  totalValue?: number;
  totalAmount?: number;
  storeId?: string;
  storeName?: string;
  fromStoreId?: string;
  fromStoreName?: string;
  toStoreId?: string;
  toStoreName?: string;
  batchNumber?: string;
  expiryDate?: string;
  referenceType?: 'PO' | 'GRN' | 'TRANSFER' | 'PRODUCTION' | 'WASTAGE' | 'AUDIT' | 'MANUAL';
  referenceNumber?: string;
  reason?: string;
  performedBy: string;
  performedByRole?: RoleType;
  status?: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  paymentTerms: string; // e.g. "Net 30 Days", "COD", "7 Days"
  suppliedCategories: ItemCategory[];
  outstandingAmount: number;
  rating?: number;
  status: 'active' | 'inactive';
}

export interface PurchaseRequisitionItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  requiredQty: number;
  estimatedRate: number;
  estimatedTotal: number;
  notes?: string;
}

export interface PurchaseRequisition {
  id: string;
  requisitionNo?: string;
  reqNumber?: string;
  date: string;
  requestedBy: string;
  department?: string;
  storeId?: string;
  storeName?: string;
  fromStoreId?: string;
  fromStoreName?: string;
  toStoreId?: string;
  toStoreName?: string;
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'General';
  items: any[];
  totalEstimatedValue?: number;
  status: RequisitionStatus;
  remarks?: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  quantity?: number;
  orderedQty?: number;
  receivedQty: number;
  rate?: number;
  unitRate?: number;
  taxPercent?: number;
  discountAmount?: number;
  totalAmount?: number;
  amount?: number;
}

export type POStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'partially_received' 
  | 'completed' 
  | 'cancelled'
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'PARTIALLY_RECEIVED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate?: string;
  orderDate?: string;
  expectedDeliveryDate: string;
  supplierId: string;
  supplierName: string;
  requisitionId?: string;
  storeId?: string;
  storeName?: string;
  destinationStoreId?: string;
  destinationStoreName?: string;
  items: PurchaseOrderItem[];
  subTotal?: number;
  subtotal?: number;
  taxTotal?: number;
  gstAmount?: number;
  discountTotal?: number;
  grandTotal?: number;
  totalAmount?: number;
  status: POStatus;
  paymentTerms?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
}

export interface GRNItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rate?: number;
  unitRate?: number;
  taxPercent?: number;
  totalAmount?: number;
  batchNumber: string;
  mfgDate?: string;
  expiryDate?: string;
  qualityPassed?: boolean;
  remarks?: string;
  rejectionReason?: string;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  grnDate?: string;
  receivedDate?: string;
  poNumber: string;
  poId?: string;
  supplierId?: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate?: string;
  storeId: string;
  storeName: string;
  items: GRNItem[];
  totalAcceptedValue?: number;
  totalValue?: number;
  qualityCheckedBy?: string;
  receivedBy?: string;
  qualityPassed?: boolean;
  status?: 'draft' | 'verified' | 'approved' | 'rejected';
  approvedBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface StoreTransferItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  requestedQty: number;
  transferredQty: number;
  receivedQty: number;
  batchNumber?: string;
  expiryDate?: string;
  rate: number;
  totalValue: number;
}

export interface StoreTransfer {
  id: string;
  transferNumber: string;
  transferDate: string;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  requestedBy: string;
  approvedBy?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  items: StoreTransferItem[];
  totalValue: number;
  status: 'pending_approval' | 'approved' | 'dispatched' | 'received' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface RecipeIngredient {
  itemId: string;
  itemCode: string;
  itemName: string;
  category?: ItemCategory;
  quantity?: number;
  quantityPerPortion?: number;
  unit: UnitType;
  costPerUnit?: number;
  costPerPortion?: number;
  totalCost?: number;
}

export interface Recipe {
  id: string;
  code: string;
  name?: string;
  dishName?: string;
  category: string;
  portionSize: string; // e.g., "1 Plate (5 Pcs)" or "100 Portions"
  yieldQuantity?: number; // e.g. 100
  yieldUnit?: UnitType; // e.g. Pcs / Portions
  standardServings?: number;
  preparationTimeMinutes?: number;
  prepTimeMinutes?: number;
  standardWastagePercent?: number;
  ingredients: RecipeIngredient[];
  totalCost?: number;
  totalBOMCost?: number;
  costPerYieldUnit?: number;
  costPerServing?: number;
  suggestedSellingPrice?: number;
  sellingPrice?: number;
  instructions?: string;
  preparationNotes?: string;
  status?: 'active' | 'inactive';
}

export interface ProductionItem {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  producedQuantity: number;
  yieldUnit: UnitType;
  unitCost: number;
  totalProductionValue: number;
}

export interface ProductionRawMaterialUsage {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  expectedQty: number;
  actualQty: number;
  varianceQty: number;
  rate: number;
  varianceValue: number;
}

export interface ProductionRecord {
  id: string;
  productionNumber: string;
  productionDate: string;
  kitchenStoreId: string;
  kitchenStoreName: string;
  producedItems: ProductionItem[];
  rawMaterialUsage: ProductionRawMaterialUsage[];
  totalExpectedCost: number;
  totalActualCost: number;
  varianceTotalValue: number;
  recordedBy: string;
  status: 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ConsumptionItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  quantity: number;
  rate: number;
  totalValue: number;
}

export interface ConsumptionRecord {
  id: string;
  consumptionNumber: string;
  date: string;
  storeId: string;
  storeName: string;
  department: 'Kitchen' | 'Banquet' | 'Housekeeping' | 'Catering' | 'Staff Meal' | 'Management' | 'Other';
  reason: string;
  items: ConsumptionItem[];
  totalValue: number;
  recordedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export type WastageReason = 
  | 'Spoilage'
  | 'Expiry'
  | 'Damage'
  | 'Cooking Loss'
  | 'Excess Production'
  | 'Pest Damage'
  | 'Storage Breakdown'
  | 'Quality Failure'
  | 'Preparation Loss'
  | 'Over-Cooking'
  | 'Contamination'
  | 'Other';

export interface WastageItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  quantity: number;
  rate: number;
  totalValue: number;
  batchNumber?: string;
  expiryDate?: string;
  reason: WastageReason;
  notes?: string;
}

export interface WastageRecord {
  id: string;
  wastageNumber?: string;
  date: string;
  storeId: string;
  storeName: string;
  department?: string;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  unit?: UnitType;
  quantity?: number;
  costRate?: number;
  totalCost?: number;
  reason?: WastageReason;
  reportedBy?: string;
  items?: WastageItem[];
  totalValue?: number;
  requiresApproval?: boolean;
  status?: 'pending_approval' | 'approved' | 'rejected';
  recordedBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
  createdAt?: string;
}

export type AdjustmentReason = 
  | 'Physical Audit Correction'
  | 'Damaged Stock Write-off'
  | 'System Entry Correction'
  | 'Found Stock'
  | 'Supplier Return Adjustment'
  | 'Other';

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  storeId: string;
  storeName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: UnitType;
  systemQty: number;
  physicalQty: number;
  adjustmentQty: number; // positive or negative
  rate: number;
  totalImpactValue: number;
  reason: AdjustmentReason;
  remarks: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  adjustedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface AuditItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  category?: ItemCategory;
  unit: UnitType;
  systemQty: number;
  physicalQty: number;
  varianceQty?: number; // physical - system
  differenceQty?: number;
  rate?: number;
  unitRate?: number;
  varianceValue?: number; // varianceQty * rate
  remarks?: string;
  notes?: string;
}

export interface StockAudit {
  id: string;
  auditNumber: string;
  startDate?: string;
  completionDate?: string;
  date?: string;
  storeId: string;
  storeName: string;
  auditorName: string;
  items: AuditItem[];
  totalSystemValue?: number;
  totalPhysicalValue?: number;
  totalVarianceValue?: number;
  totalPositiveVariance?: number;
  totalNegativeVariance?: number;
  netVarianceValue?: number;
  status: 'in_progress' | 'submitted_for_approval' | 'approved' | 'finalized' | 'rejected' | 'IN_PROGRESS' | 'COMPLETED' | 'ADJUSTED' | 'POSTED';
  approvedBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface AlertItem {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'pending_approval' | 'high_variance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  itemId?: string;
  itemCode?: string;
  storeName?: string;
  date?: string;
  actionRequired?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: RoleType;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'TRANSFER' | 'GRN' | 'PRODUCTION' | 'CONSUMPTION' | 'WASTAGE' | 'AUDIT' | 'LOGIN';
  module: string;
  description: string;
  ipAddress?: string;
}

export interface SystemSettings {
  restaurantName: string;
  restaurantCode: string;
  wastageApprovalThreshold: number; // Default e.g. ₹5,000
  lowStockAlertMultiplier: number; // Default 1.0
  expiryWarningDays: number; // Default 15 days
  allowNegativeStock: boolean; // Default false
  fifoEnabled: boolean; // Default true
  currencySymbol: string; // ₹
}

export interface KPIOverview {
  totalStockValue: number;
  totalItemsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  todayPurchases: number;
  todayConsumption: number;
  todayWastage: number;
  todayTransfers: number;
  pendingApprovalsCount: number;
  stockVarianceTotal: number;
}

// Aliases for compatibility
export type KitchenRequisition = PurchaseRequisition;
export type WastageLog = WastageRecord;
export type StockAuditSession = StockAudit;
export type RequisitionStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'converted_to_po' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'ISSUED' 
  | 'REJECTED';
