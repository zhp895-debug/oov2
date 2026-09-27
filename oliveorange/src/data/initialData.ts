import {
  User,
  InventoryItem,
  Store,
  Supplier,
  Recipe,
  PurchaseRequisition,
  PurchaseOrder,
  GoodsReceivedNote,
  StoreTransfer,
  ProductionRecord,
  ConsumptionRecord,
  WastageRecord,
  StockAdjustment,
  StockAudit,
  ActivityLog,
  SystemSettings,
  StockTransaction
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Rajesh Sharma', email: 'rajesh.admin@oliveorange.com', role: 'super_admin', department: 'Executive Management', status: 'active', lastLogin: '2026-08-13 08:30 AM' },
  { id: 'usr-2', name: 'Pankaj Patel', email: 'pankaj.store@oliveorange.com', role: 'store_manager', department: 'Central Stores', status: 'active', lastLogin: '2026-08-13 07:15 AM' },
  { id: 'usr-3', name: 'Amit Kumar', email: 'amit.staff@oliveorange.com', role: 'store_staff', department: 'Dry Store', status: 'active', lastLogin: '2026-08-12 04:20 PM' },
  { id: 'usr-4', name: 'Master Chef Maharaj', email: 'chef.maharaj@oliveorange.com', role: 'kitchen_manager', department: 'Main Kitchen', status: 'active', lastLogin: '2026-08-13 06:45 AM' },
  { id: 'usr-5', name: 'Suresh Mehta', email: 'suresh.accounts@oliveorange.com', role: 'accountant', department: 'Finance & Accounts', status: 'active', lastLogin: '2026-08-12 05:10 PM' },
  { id: 'usr-6', name: 'Anil Verma', email: 'anil.auditor@oliveorange.com', role: 'auditor', department: 'Internal Audit', status: 'active', lastLogin: '2026-08-11 11:00 AM' }
];

export const INITIAL_STORES: Store[] = [
  { id: 'str-1', code: 'MAIN-01', name: 'Main Central Store', type: 'main', location: 'Ground Floor Warehouse A', managerName: 'Pankaj Patel', contactNumber: '+91 98765 43210', status: 'active' },
  { id: 'str-2', code: 'DRY-01', name: 'Dry Provisions Store', type: 'dry', location: 'Ground Floor Bay B', managerName: 'Amit Kumar', contactNumber: '+91 98765 43211', status: 'active' },
  { id: 'str-3', code: 'COLD-01', name: 'Cold Storage Room', type: 'cold', location: 'Basement Chill Facility (-4°C to 4°C)', managerName: 'Sanjay Shah', contactNumber: '+91 98765 43212', status: 'active' },
  { id: 'str-4', code: 'VEG-01', name: 'Fresh Vegetable Store', type: 'vegetable', location: 'Kitchen Dock Area', managerName: 'Ramesh Patel', contactNumber: '+91 98765 43213', status: 'active' },
  { id: 'str-5', code: 'KIT-01', name: 'Main Kitchen Pantry', type: 'kitchen', location: '1st Floor Main Kitchen Prep', managerName: 'Master Chef Maharaj', contactNumber: '+91 98765 43214', status: 'active' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', code: 'SUP-AGRO-01', name: 'Gujarat Agro Grain Traders', contactPerson: 'Bhavesh Shah', phone: '+91 98250 11223', email: 'orders@gujaratagro.com', address: 'APMC Market Yard, Unjha, Gujarat', gstin: '24AAAAA0000A1Z5', paymentTerms: 'Net 15 Days', suppliedCategories: ['Grains', 'Pulses', 'Flour'], outstandingAmount: 142500, rating: 4.8, status: 'active' },
  { id: 'sup-2', code: 'SUP-AMUL-01', name: 'Amul Dairy Distributors', contactPerson: 'Ketan Parikh', phone: '+91 98251 33445', email: 'supply@amuldairy.com', address: 'Anand Milk Union Federation, Anand', gstin: '24AAABA1234F1Z2', paymentTerms: 'COD', suppliedCategories: ['Dairy'], outstandingAmount: 48600, rating: 4.9, status: 'active' },
  { id: 'sup-3', code: 'SUP-SPICE-01', name: 'Royal Spice & Condiment Corp', contactPerson: 'Manish Vora', phone: '+91 98252 55667', email: 'sales@royalspices.co.in', address: 'Spices Market, Khari Baoli, Ahmedabad', gstin: '24AACCR5678B1Z9', paymentTerms: 'Net 30 Days', suppliedCategories: ['Spices'], outstandingAmount: 85200, rating: 4.7, status: 'active' },
  { id: 'sup-4', code: 'SUP-VEG-01', name: 'Fresh Farm Produce Co-Op', contactPerson: 'Lallubhai Patel', phone: '+91 98253 77889', email: 'fresh@farmproduce.org', address: 'Chhatral Farm Supply Hub, Gandhinagar', gstin: '24AABFF9988C1Z3', paymentTerms: '7 Days', suppliedCategories: ['Vegetables', 'Fruits'], outstandingAmount: 32100, rating: 4.6, status: 'active' },
  { id: 'sup-5', code: 'SUP-OIL-01', name: 'Fortune Oil & Refineries', contactPerson: 'Sanjay Trivedi', phone: '+91 98254 99001', email: 'institutional@fortuneoils.com', address: 'Adani Wilmar House, Mithakhali, Ahmedabad', gstin: '24AAACF1122D1Z0', paymentTerms: 'Net 15 Days', suppliedCategories: ['Oil'], outstandingAmount: 195000, rating: 4.9, status: 'active' },
  { id: 'sup-6', code: 'SUP-PACK-01', name: 'EcoPack Eco-Friendly Packaging', contactPerson: 'Dhaval Jhaveri', phone: '+91 98255 22334', email: 'info@ecopack.co.in', address: 'GIDC Industrial Estate, Changodar', gstin: '24AAAGE3344E1Z1', paymentTerms: 'Net 30 Days', suppliedCategories: ['Packaging'], outstandingAmount: 28400, rating: 4.5, status: 'active' },
  { id: 'sup-7', code: 'SUP-CLEAN-01', name: 'CleanTech Institutional Hygiene', contactPerson: 'Harish Joshi', phone: '+91 98256 44556', email: 'orders@cleantechhygiene.com', address: 'GIDC Naroda, Ahmedabad', gstin: '24AAACC7788G1Z8', paymentTerms: 'Net 30 Days', suppliedCategories: ['Cleaning Materials', 'Kitchen Supplies'], outstandingAmount: 18900, rating: 4.4, status: 'active' }
];

// Helper to generate seed items
const rawItemDefs = [
  // Grains & Flour
  { code: 'PRM-GRN-001', name: 'Basmati Rice Premium (1121)', cat: 'Grains', unit: 'Kg', brand: 'Royal Harvest', min: 200, max: 2000, reorder: 500, loc: 'Main Store', rack: 'A-01', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 110 },
  { code: 'PRM-GRN-002', name: 'Sona Masoori Rice', cat: 'Grains', unit: 'Kg', brand: 'Annapurna', min: 150, max: 1500, reorder: 400, loc: 'Main Store', rack: 'A-02', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 62 },
  { code: 'PRM-FLR-001', name: 'Sharbati Whole Wheat Atta', cat: 'Flour', unit: 'Kg', brand: 'Aashirvaad Select', min: 300, max: 3000, reorder: 800, loc: 'Dry Store', rack: 'B-01', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 46 },
  { code: 'PRM-FLR-002', name: 'Besan (Gram Flour)', cat: 'Flour', unit: 'Kg', brand: 'Fortune Rajdhani', min: 100, max: 800, reorder: 250, loc: 'Dry Store', rack: 'B-02', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 85 },
  { code: 'PRM-FLR-003', name: 'Maida (Refined Wheat Flour)', cat: 'Flour', unit: 'Kg', brand: 'Rajdhani Fine', min: 100, max: 1000, reorder: 300, loc: 'Dry Store', rack: 'B-03', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 38 },
  { code: 'PRM-FLR-004', name: 'Sooji (Semolina Fine)', cat: 'Flour', unit: 'Kg', brand: 'Rajdhani', min: 50, max: 400, reorder: 100, loc: 'Dry Store', rack: 'B-04', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 42 },
  
  // Pulses
  { code: 'PRM-PLS-001', name: 'Toor Dal Premium (Tuver)', cat: 'Pulses', unit: 'Kg', brand: 'Laxmi Brand', min: 150, max: 1200, reorder: 350, loc: 'Main Store', rack: 'C-01', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 145 },
  { code: 'PRM-PLS-002', name: 'Moong Dal Washed', cat: 'Pulses', unit: 'Kg', brand: 'Laxmi Brand', min: 100, max: 800, reorder: 200, loc: 'Main Store', rack: 'C-02', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 118 },
  { code: 'PRM-PLS-003', name: 'Chana Dal (Bengal Gram)', cat: 'Pulses', unit: 'Kg', brand: 'Elephant Brand', min: 100, max: 800, reorder: 200, loc: 'Main Store', rack: 'C-03', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 88 },
  { code: 'PRM-PLS-004', name: 'Kabuli Chana (Giant Chickpeas)', cat: 'Pulses', unit: 'Kg', brand: 'Royal Select', min: 80, max: 600, reorder: 150, loc: 'Main Store', rack: 'C-04', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 132 },
  { code: 'PRM-PLS-005', name: 'Urad Dal Chilka', cat: 'Pulses', unit: 'Kg', brand: 'Laxmi Brand', min: 60, max: 500, reorder: 120, loc: 'Main Store', rack: 'C-05', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 125 },

  // Oil & Ghee
  { code: 'PRM-OIL-001', name: 'Refined Sunflower Oil (15L Tin)', cat: 'Oil', unit: 'Tin', brand: 'Fortune Sunlite', min: 20, max: 150, reorder: 40, loc: 'Dry Store', rack: 'D-01', supId: 'sup-5', supName: 'Fortune Oil & Refineries', rate: 2150 },
  { code: 'PRM-OIL-002', name: 'Pure Cow Desi Ghee (15L Tin)', cat: 'Oil', unit: 'Tin', brand: 'Amul Pure Ghee', min: 10, max: 60, reorder: 20, loc: 'Cold Storage', rack: 'D-02', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 8900 },
  { code: 'PRM-OIL-003', name: 'Filtered Groundnut Oil (15L Tin)', cat: 'Oil', unit: 'Tin', brand: 'Gulab Groundnut', min: 15, max: 80, reorder: 25, loc: 'Dry Store', rack: 'D-03', supId: 'sup-5', supName: 'Fortune Oil & Refineries', rate: 2450 },

  // Dairy
  { code: 'PRM-DRY-001', name: 'Fresh Paneer Block (Vacuum Pack)', cat: 'Dairy', unit: 'Kg', brand: 'Amul Fresh', min: 40, max: 250, reorder: 80, loc: 'Cold Storage', rack: 'E-01', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 360 },
  { code: 'PRM-DRY-002', name: 'Fresh Full Cream Milk', cat: 'Dairy', unit: 'Ltr', brand: 'Amul Gold', min: 100, max: 500, reorder: 200, loc: 'Cold Storage', rack: 'E-02', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 66 },
  { code: 'PRM-DRY-003', name: 'Amul Pasteurized Butter (500g)', cat: 'Dairy', unit: 'Packet', brand: 'Amul', min: 50, max: 300, reorder: 100, loc: 'Cold Storage', rack: 'E-03', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 275 },
  { code: 'PRM-DRY-004', name: 'Fresh Curd / Dahi (Pouch)', cat: 'Dairy', unit: 'Kg', brand: 'Amul Masti', min: 50, max: 300, reorder: 100, loc: 'Cold Storage', rack: 'E-04', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 65 },
  { code: 'PRM-DRY-005', name: 'Khoya / Mawa (Sweet Prep)', cat: 'Dairy', unit: 'Kg', brand: 'Amul Dairy', min: 15, max: 100, reorder: 30, loc: 'Cold Storage', rack: 'E-05', supId: 'sup-2', supName: 'Amul Dairy Distributors', rate: 380 },

  // Spices & Condiments
  { code: 'PRM-SPI-001', name: 'Garam Masala Powder (1kg Pkt)', cat: 'Spices', unit: 'Packet', brand: 'Everest Super', min: 10, max: 80, reorder: 25, loc: 'Dry Store', rack: 'F-01', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 680 },
  { code: 'PRM-SPI-002', name: 'Kashmiri Red Chilli Powder (1kg)', cat: 'Spices', unit: 'Packet', brand: 'MDH Kashmiri', min: 15, max: 100, reorder: 30, loc: 'Dry Store', rack: 'F-02', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 520 },
  { code: 'PRM-SPI-003', name: 'Turmeric Powder Haldi (1kg)', cat: 'Spices', unit: 'Packet', brand: 'Everest Haldi', min: 15, max: 100, reorder: 30, loc: 'Dry Store', rack: 'F-03', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 240 },
  { code: 'PRM-SPI-004', name: 'Coriander Cumin Powder Dhana Jeera', cat: 'Spices', unit: 'Packet', brand: 'Everest', min: 20, max: 120, reorder: 40, loc: 'Dry Store', rack: 'F-04', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 290 },
  { code: 'PRM-SPI-005', name: 'Cumin Seeds Whole (Jeera)', cat: 'Spices', unit: 'Kg', brand: 'Unjha Premium', min: 20, max: 100, reorder: 35, loc: 'Dry Store', rack: 'F-05', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 420 },
  { code: 'PRM-SPI-006', name: 'Mustard Seeds (Rai)', cat: 'Spices', unit: 'Kg', brand: 'Royal Spice', min: 10, max: 60, reorder: 20, loc: 'Dry Store', rack: 'F-06', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 110 },
  { code: 'PRM-SPI-007', name: 'Asafoetida (Hing Powder 100g)', cat: 'Spices', unit: 'Bottle', brand: 'LGG Hing', min: 15, max: 80, reorder: 25, loc: 'Dry Store', rack: 'F-07', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 185 },
  { code: 'PRM-SPI-008', name: 'Iodized Salt (50kg Bag)', cat: 'Spices', unit: 'Bag', brand: 'Tata Salt', min: 5, max: 30, reorder: 10, loc: 'Dry Store', rack: 'F-08', supId: 'sup-3', supName: 'Royal Spice & Condiment Corp', rate: 1150 },
  { code: 'PRM-SPI-009', name: 'Refined White Sugar (50kg Bag)', cat: 'Spices', unit: 'Bag', brand: 'M30 Grade', min: 10, max: 50, reorder: 15, loc: 'Dry Store', rack: 'F-09', supId: 'sup-1', supName: 'Gujarat Agro Grain Traders', rate: 2100 },

  // Vegetables & Fruits
  { code: 'PRM-VEG-001', name: 'Fresh Potatoes (A Grade)', cat: 'Vegetables', unit: 'Kg', brand: 'Deesa Farm', min: 200, max: 1500, reorder: 400, loc: 'Vegetable Store', rack: 'V-01', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 24 },
  { code: 'PRM-VEG-002', name: 'Fresh Red Onions', cat: 'Vegetables', unit: 'Kg', brand: 'Nasik Red', min: 150, max: 1000, reorder: 300, loc: 'Vegetable Store', rack: 'V-02', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 32 },
  { code: 'PRM-VEG-003', name: 'Fresh Tomatoes (Ripe Red)', cat: 'Vegetables', unit: 'Kg', brand: 'Hybrid Local', min: 100, max: 600, reorder: 200, loc: 'Vegetable Store', rack: 'V-03', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 28 },
  { code: 'PRM-VEG-004', name: 'Green Chilli Spicy', cat: 'Vegetables', unit: 'Kg', brand: 'Fresh Farm', min: 10, max: 60, reorder: 20, loc: 'Vegetable Store', rack: 'V-04', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 65 },
  { code: 'PRM-VEG-005', name: 'Fresh Ginger (Adrak)', cat: 'Vegetables', unit: 'Kg', brand: 'Fresh Farm', min: 10, max: 50, reorder: 15, loc: 'Vegetable Store', rack: 'V-05', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 120 },
  { code: 'PRM-VEG-006', name: 'Fresh Coriander Leaves (Kothmir)', cat: 'Vegetables', unit: 'Bundle', brand: 'Fresh Farm', min: 30, max: 200, reorder: 50, loc: 'Vegetable Store', rack: 'V-06', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 15 },
  { code: 'PRM-VEG-007', name: 'Cauliflower (Phool Gobhi)', cat: 'Vegetables', unit: 'Kg', brand: 'Fresh Farm', min: 30, max: 150, reorder: 50, loc: 'Vegetable Store', rack: 'V-07', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 35 },
  { code: 'PRM-VEG-008', name: 'Green Peas Frozen (5kg Pkt)', cat: 'Vegetables', unit: 'Packet', brand: 'Safal Green', min: 10, max: 60, reorder: 20, loc: 'Cold Storage', rack: 'V-08', supId: 'sup-4', supName: 'Fresh Farm Produce Co-Op', rate: 620 },

  // Packaging & Supplies
  { code: 'PRM-PCK-001', name: '3-Compartment Meal Tray (100 Pcs)', cat: 'Packaging', unit: 'Box', brand: 'EcoPack', min: 20, max: 100, reorder: 30, loc: 'Dry Store', rack: 'P-01', supId: 'sup-6', supName: 'EcoPack Eco-Friendly Packaging', rate: 850 },
  { code: 'PRM-PCK-002', name: 'Aluminium Foil Roll (1kg heavy)', cat: 'Packaging', unit: 'Pcs', brand: 'Hindalco Fresh', min: 15, max: 80, reorder: 25, loc: 'Dry Store', rack: 'P-02', supId: 'sup-6', supName: 'EcoPack Eco-Friendly Packaging', rate: 340 },
  { code: 'PRM-PCK-003', name: 'Biodegradable Paper Napkins (1000s)', cat: 'Packaging', unit: 'Box', brand: 'EcoSoft', min: 10, max: 50, reorder: 15, loc: 'Dry Store', rack: 'P-03', supId: 'sup-6', supName: 'EcoPack Eco-Friendly Packaging', rate: 420 },

  // Cleaning
  { code: 'PRM-CLN-001', name: 'Institutional Dishwashing Liquid (5L Can)', cat: 'Cleaning Materials', unit: 'Bottle', brand: 'CleanTech Max', min: 5, max: 30, reorder: 10, loc: 'Main Store', rack: 'X-01', supId: 'sup-7', supName: 'CleanTech Institutional Hygiene', rate: 650 },
  { code: 'PRM-CLN-002', name: 'Surface Sanitizer Food Grade (5L)', cat: 'Cleaning Materials', unit: 'Bottle', brand: 'CleanTech Safe', min: 5, max: 25, reorder: 8, loc: 'Main Store', rack: 'X-02', supId: 'sup-7', supName: 'CleanTech Institutional Hygiene', rate: 820 }
];

export const INITIAL_ITEMS: InventoryItem[] = rawItemDefs.map((def, idx) => ({
  id: `itm-${idx + 1}`,
  code: def.code,
  name: def.name,
  category: def.cat as any,
  unit: def.unit as any,
  brand: def.brand,
  minStock: def.min,
  maxStock: def.max,
  reorderLevel: def.reorder,
  storageLocation: def.loc,
  shelfRack: def.rack,
  primarySupplierId: def.supId,
  primarySupplierName: def.supName,
  purchaseRate: def.rate,
  avgRate: def.rate,
  batchTracking: true,
  expiryTracking: true,
  status: 'active',
  createdDate: '2026-01-10',
  updatedDate: '2026-08-10'
}));

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rcp-1',
    code: 'RCP-SAM-01',
    name: 'OliveOrange Special Punjabi Samosa',
    category: 'Snacks & Starters',
    portionSize: '1 Batch (100 Pcs)',
    yieldQuantity: 100,
    yieldUnit: 'Pcs',
    preparationTimeMinutes: 45,
    standardWastagePercent: 2,
    ingredients: [
      { itemId: 'itm-5', itemCode: 'PRM-FLR-003', itemName: 'Maida (Refined Wheat Flour)', category: 'Flour', quantity: 5, unit: 'Kg', costPerUnit: 38, totalCost: 190 },
      { itemId: 'itm-20', itemCode: 'PRM-VEG-001', itemName: 'Fresh Potatoes (A Grade)', category: 'Vegetables', quantity: 8, unit: 'Kg', costPerUnit: 24, totalCost: 192 },
      { itemId: 'itm-12', itemCode: 'PRM-OIL-001', itemName: 'Refined Sunflower Oil (15L Tin)', category: 'Oil', quantity: 0.15, unit: 'Tin', costPerUnit: 2150, totalCost: 322.5 },
      { itemId: 'itm-15', itemCode: 'PRM-SPI-001', itemName: 'Garam Masala Powder (1kg Pkt)', category: 'Spices', quantity: 0.1, unit: 'Packet', costPerUnit: 680, totalCost: 68 },
      { itemId: 'itm-27', itemCode: 'PRM-VEG-008', itemName: 'Green Peas Frozen (5kg Pkt)', category: 'Vegetables', quantity: 0.2, unit: 'Packet', costPerUnit: 620, totalCost: 124 },
      { itemId: 'itm-23', itemCode: 'PRM-VEG-004', itemName: 'Green Chilli Spicy', category: 'Vegetables', quantity: 0.25, unit: 'Kg', costPerUnit: 65, totalCost: 16.25 }
    ],
    totalCost: 912.75,
    costPerYieldUnit: 9.13,
    suggestedSellingPrice: 20.00,
    instructions: 'Prepare dough with Maida & oil. Boil potatoes with spices & green peas. Stuff, fold samosa triangles and deep fry in Fortune Sunflower oil till golden crisp.',
    status: 'active'
  },
  {
    id: 'rcp-2',
    code: 'RCP-THL-01',
    name: 'OliveOrange Executive Gujrati Thali',
    category: 'Main Course Meals',
    portionSize: '50 Thalis',
    yieldQuantity: 50,
    yieldUnit: 'Portion' as any,
    preparationTimeMinutes: 90,
    standardWastagePercent: 3,
    ingredients: [
      { itemId: 'itm-1', itemCode: 'PRM-GRN-001', itemName: 'Basmati Rice Premium (1121)', category: 'Grains', quantity: 4, unit: 'Kg', costPerUnit: 110, totalCost: 440 },
      { itemId: 'itm-3', itemCode: 'PRM-FLR-001', itemName: 'Sharbati Whole Wheat Atta', category: 'Flour', quantity: 5, unit: 'Kg', costPerUnit: 46, totalCost: 230 },
      { itemId: 'itm-7', itemCode: 'PRM-PLS-001', itemName: 'Toor Dal Premium (Tuver)', category: 'Pulses', quantity: 2.5, unit: 'Kg', costPerUnit: 145, totalCost: 362.5 },
      { itemId: 'itm-13', itemCode: 'PRM-OIL-002', itemName: 'Pure Cow Desi Ghee (15L Tin)', category: 'Oil', quantity: 0.05, unit: 'Tin', costPerUnit: 8900, totalCost: 445 },
      { itemId: 'itm-14', itemCode: 'PRM-DRY-001', itemName: 'Fresh Paneer Block (Vacuum Pack)', category: 'Dairy', quantity: 3, unit: 'Kg', costPerUnit: 360, totalCost: 1080 },
      { itemId: 'itm-22', itemCode: 'PRM-VEG-003', itemName: 'Fresh Tomatoes (Ripe Red)', category: 'Vegetables', quantity: 4, unit: 'Kg', costPerUnit: 28, totalCost: 112 },
      { itemId: 'itm-21', itemCode: 'PRM-VEG-002', itemName: 'Fresh Red Onions', category: 'Vegetables', quantity: 3, unit: 'Kg', costPerUnit: 32, totalCost: 96 }
    ],
    totalCost: 2765.50,
    costPerYieldUnit: 55.31,
    suggestedSellingPrice: 180.00,
    instructions: 'Prepare Steamed Basmati Rice, Phulka Roti with Pure Desi Ghee, Gujrati Khatti Mithi Dal, and Paneer Butter Masala.',
    status: 'active'
  },
  {
    id: 'rcp-3',
    code: 'RCP-PBM-01',
    name: 'Paneer Butter Masala (10 Kg Batch)',
    category: 'Curries',
    portionSize: '40 Portions',
    yieldQuantity: 40,
    yieldUnit: 'Portion' as any,
    preparationTimeMinutes: 40,
    standardWastagePercent: 1.5,
    ingredients: [
      { itemId: 'itm-14', itemCode: 'PRM-DRY-001', itemName: 'Fresh Paneer Block (Vacuum Pack)', category: 'Dairy', quantity: 6, unit: 'Kg', costPerUnit: 360, totalCost: 2160 },
      { itemId: 'itm-16', itemCode: 'PRM-DRY-003', itemName: 'Amul Pasteurized Butter (500g)', category: 'Dairy', quantity: 2, unit: 'Packet', costPerUnit: 275, totalCost: 550 },
      { itemId: 'itm-22', itemCode: 'PRM-VEG-003', itemName: 'Fresh Tomatoes (Ripe Red)', category: 'Vegetables', quantity: 5, unit: 'Kg', costPerUnit: 28, totalCost: 140 },
      { itemId: 'itm-15', itemCode: 'PRM-SPI-001', itemName: 'Garam Masala Powder (1kg Pkt)', category: 'Spices', quantity: 0.1, unit: 'Packet', costPerUnit: 680, totalCost: 68 },
      { itemId: 'itm-16', itemCode: 'PRM-SPI-002', itemName: 'Kashmiri Red Chilli Powder (1kg)', category: 'Spices', quantity: 0.15, unit: 'Packet', costPerUnit: 520, totalCost: 78 }
    ],
    totalCost: 2996.00,
    costPerYieldUnit: 74.90,
    suggestedSellingPrice: 220.00,
    instructions: 'Saute rich tomato gravy in Amul Butter, add cubed fresh paneer, simmer with cream & fragrant garam masala.',
    status: 'active'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-0801',
    poDate: '2026-08-10',
    expectedDeliveryDate: '2026-08-14',
    supplierId: 'sup-1',
    supplierName: 'Gujarat Agro Grain Traders',
    storeId: 'str-1',
    storeName: 'Main Central Store',
    items: [
      { itemId: 'itm-1', itemCode: 'PRM-GRN-001', itemName: 'Basmati Rice Premium (1121)', unit: 'Kg', quantity: 500, receivedQty: 500, rate: 110, taxPercent: 5, discountAmount: 500, totalAmount: 57250 },
      { itemId: 'itm-7', itemCode: 'PRM-PLS-001', itemName: 'Toor Dal Premium (Tuver)', unit: 'Kg', quantity: 300, receivedQty: 300, rate: 145, taxPercent: 5, discountAmount: 300, totalAmount: 45375 }
    ],
    subTotal: 98500,
    taxTotal: 4925,
    discountTotal: 800,
    grandTotal: 102625,
    status: 'completed',
    paymentTerms: 'Net 15 Days',
    createdBy: 'Pankaj Patel',
    approvedBy: 'Rajesh Sharma'
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-0802',
    poDate: '2026-08-12',
    expectedDeliveryDate: '2026-08-15',
    supplierId: 'sup-2',
    supplierName: 'Amul Dairy Distributors',
    storeId: 'str-3',
    storeName: 'Cold Storage Room',
    items: [
      { itemId: 'itm-14', itemCode: 'PRM-DRY-001', itemName: 'Fresh Paneer Block (Vacuum Pack)', unit: 'Kg', quantity: 150, receivedQty: 0, rate: 360, taxPercent: 5, discountAmount: 0, totalAmount: 56700 },
      { itemId: 'itm-16', itemCode: 'PRM-DRY-003', itemName: 'Amul Pasteurized Butter (500g)', unit: 'Packet', quantity: 100, receivedQty: 0, rate: 275, taxPercent: 5, discountAmount: 0, totalAmount: 28875 }
    ],
    subTotal: 81500,
    taxTotal: 4075,
    discountTotal: 0,
    grandTotal: 85575,
    status: 'approved',
    paymentTerms: 'COD',
    createdBy: 'Pankaj Patel',
    approvedBy: 'Suresh Mehta'
  }
];

export const INITIAL_GRNS: GoodsReceivedNote[] = [
  {
    id: 'grn-101',
    grnNumber: 'GRN-2026-0501',
    grnDate: '2026-08-11',
    poNumber: 'PO-2026-0801',
    poId: 'po-101',
    supplierId: 'sup-1',
    supplierName: 'Gujarat Agro Grain Traders',
    invoiceNumber: 'INV-GAGT-9842',
    invoiceDate: '2026-08-10',
    storeId: 'str-1',
    storeName: 'Main Central Store',
    items: [
      { itemId: 'itm-1', itemCode: 'PRM-GRN-001', itemName: 'Basmati Rice Premium (1121)', unit: 'Kg', orderedQty: 500, receivedQty: 500, acceptedQty: 500, rejectedQty: 0, rate: 110, taxPercent: 5, totalAmount: 57750, batchNumber: 'BATCH-BR-0811', expiryDate: '2027-08-10', qualityPassed: true, remarks: 'Moisture content < 11%, Grain length 8.2mm OK' },
      { itemId: 'itm-7', itemCode: 'PRM-PLS-001', itemName: 'Toor Dal Premium (Tuver)', unit: 'Kg', orderedQty: 300, receivedQty: 300, acceptedQty: 300, rejectedQty: 0, rate: 145, taxPercent: 5, totalAmount: 45675, batchNumber: 'BATCH-TD-0811', expiryDate: '2027-02-10', qualityPassed: true, remarks: 'Uniform yellow color, zero infestation' }
    ],
    totalAcceptedValue: 103425,
    qualityCheckedBy: 'Amit Kumar',
    status: 'approved',
    approvedBy: 'Pankaj Patel',
    createdAt: '2026-08-11 11:30 AM'
  }
];

export const INITIAL_TRANSFERS: StoreTransfer[] = [
  {
    id: 'trf-101',
    transferNumber: 'TRF-2026-0101',
    transferDate: '2026-08-12',
    fromStoreId: 'str-1',
    fromStoreName: 'Main Central Store',
    toStoreId: 'str-5',
    toStoreName: 'Main Kitchen Pantry',
    requestedBy: 'Master Chef Maharaj',
    approvedBy: 'Pankaj Patel',
    dispatchedBy: 'Amit Kumar',
    receivedBy: 'Master Chef Maharaj',
    items: [
      { itemId: 'itm-1', itemCode: 'PRM-GRN-001', itemName: 'Basmati Rice Premium (1121)', unit: 'Kg', requestedQty: 100, transferredQty: 100, receivedQty: 100, batchNumber: 'BATCH-BR-0811', rate: 110, totalValue: 11000 },
      { itemId: 'itm-3', itemCode: 'PRM-FLR-001', itemName: 'Sharbati Whole Wheat Atta', unit: 'Kg', requestedQty: 150, transferredQty: 150, receivedQty: 150, batchNumber: 'BATCH-AT-0801', rate: 46, totalValue: 6900 }
    ],
    totalValue: 17900,
    status: 'received',
    notes: 'Daily kitchen stock replenishment for lunch service',
    createdAt: '2026-08-12 07:00 AM'
  }
];

export const INITIAL_PRODUCTION: ProductionRecord[] = [
  {
    id: 'prd-101',
    productionNumber: 'PRD-2026-0042',
    productionDate: '2026-08-12',
    kitchenStoreId: 'str-5',
    kitchenStoreName: 'Main Kitchen Pantry',
    producedItems: [
      { recipeId: 'rcp-1', recipeCode: 'RCP-SAM-01', recipeName: 'OliveOrange Special Punjabi Samosa', producedQuantity: 500, yieldUnit: 'Pcs', unitCost: 9.13, totalProductionValue: 4565 }
    ],
    rawMaterialUsage: [
      { itemId: 'itm-5', itemCode: 'PRM-FLR-003', itemName: 'Maida (Refined Wheat Flour)', unit: 'Kg', expectedQty: 25, actualQty: 25.5, varianceQty: 0.5, rate: 38, varianceValue: 19 },
      { itemId: 'itm-20', itemCode: 'PRM-VEG-001', itemName: 'Fresh Potatoes (A Grade)', unit: 'Kg', expectedQty: 40, actualQty: 41, varianceQty: 1.0, rate: 24, varianceValue: 24 }
    ],
    totalExpectedCost: 4563.75,
    totalActualCost: 4606.75,
    varianceTotalValue: 43.00,
    recordedBy: 'Master Chef Maharaj',
    status: 'completed',
    notes: 'Morning tea service batch production',
    createdAt: '2026-08-12 10:30 AM'
  }
];

export const INITIAL_WASTAGE: WastageRecord[] = [
  {
    id: 'wst-101',
    wastageNumber: 'WST-2026-0019',
    date: '2026-08-11',
    storeId: 'str-4',
    storeName: 'Fresh Vegetable Store',
    department: 'Kitchen',
    items: [
      { itemId: 'itm-22', itemCode: 'PRM-VEG-003', itemName: 'Fresh Tomatoes (Ripe Red)', unit: 'Kg', quantity: 15, rate: 28, totalValue: 420, reason: 'Spoilage', notes: 'Overripe due to humidity in transit' }
    ],
    totalValue: 420,
    requiresApproval: false,
    status: 'approved',
    recordedBy: 'Ramesh Patel',
    approvedBy: 'Pankaj Patel',
    createdAt: '2026-08-11 04:00 PM'
  }
];

export const INITIAL_AUDITS: StockAudit[] = [
  {
    id: 'aud-101',
    auditNumber: 'AUD-2026-0004',
    startDate: '2026-08-01',
    completionDate: '2026-08-01',
    storeId: 'str-2',
    storeName: 'Dry Provisions Store',
    auditorName: 'Anil Verma',
    items: [
      { itemId: 'itm-3', itemCode: 'PRM-FLR-001', itemName: 'Sharbati Whole Wheat Atta', category: 'Flour', unit: 'Kg', systemQty: 850, physicalQty: 845, varianceQty: -5, rate: 46, varianceValue: -230, notes: 'Spill during bag movement' },
      { itemId: 'itm-4', itemCode: 'PRM-FLR-002', itemName: 'Besan (Gram Flour)', category: 'Flour', unit: 'Kg', systemQty: 320, physicalQty: 320, varianceQty: 0, rate: 85, varianceValue: 0 }
    ],
    totalSystemValue: 66300,
    totalPhysicalValue: 66070,
    totalVarianceValue: -230,
    status: 'finalized',
    approvedBy: 'Rajesh Sharma',
    notes: 'Monthly routine stock count - minor variance approved',
    createdAt: '2026-08-01 02:00 PM'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-1', timestamp: '2026-08-13 08:30:15', user: 'Rajesh Sharma', role: 'super_admin', action: 'LOGIN', module: 'Auth', description: 'User logged into OliveOrange Stock Management System' },
  { id: 'log-2', timestamp: '2026-08-12 10:30:00', user: 'Master Chef Maharaj', role: 'kitchen_manager', action: 'PRODUCTION', module: 'Production', description: 'Recorded production batch PRD-2026-0042 (500 Samosas)' },
  { id: 'log-3', timestamp: '2026-08-11 11:30:20', user: 'Pankaj Patel', role: 'store_manager', action: 'GRN', module: 'Purchase', description: 'Approved Goods Received Note GRN-2026-0501 from Gujarat Agro' },
  { id: 'log-4', timestamp: '2026-08-10 03:15:10', user: 'Suresh Mehta', role: 'accountant', action: 'APPROVE', module: 'Purchase', description: 'Approved Purchase Order PO-2026-0801 value ₹1,02,625' }
];

export const INITIAL_SETTINGS: SystemSettings = {
  restaurantName: 'OliveOrange Restaurant & Catering',
  restaurantCode: 'OLO-AHM-01',
  wastageApprovalThreshold: 5000,
  lowStockAlertMultiplier: 1.0,
  expiryWarningDays: 15,
  allowNegativeStock: false,
  fifoEnabled: true,
  currencySymbol: '₹'
};
