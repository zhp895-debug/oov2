import React, { useState } from 'react';
import { InventoryItem, ItemCategory, UnitType, Supplier } from '../types';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ExportModal } from '../components/ui/ExportModal';
import { Plus, Search, Filter, Edit3, Package, Download } from 'lucide-react';

interface ItemMasterProps {
  items: InventoryItem[];
  suppliers: Supplier[];
  onAddItem: (item: Partial<InventoryItem>) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

export const ItemMaster: React.FC<ItemMasterProps> = ({
  items,
  suppliers,
  onAddItem,
  onUpdateItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    category: 'Grains',
    subCategory: '',
    unit: 'Kg',
    brand: '',
    minStock: 10,
    maxStock: 50,
    reorderLevel: 15,
    storageLocation: 'Central Godown',
    shelfRack: 'A-01',
    primarySupplierId: suppliers[0]?.id || 'sup-1',
    primarySupplierName: suppliers[0]?.name || 'Gujarat Agro Grain Traders',
    purchaseRate: 100,
    avgRate: 100,
    batchTracking: true,
    expiryTracking: true,
    status: 'active',
    description: ''
  });

  const categories: ItemCategory[] = [
    'Grains', 'Flour', 'Pulses', 'Oil & Ghee', 'Spices & Masala', 'Vegetables', 'Fruits',
    'Dairy', 'Packaging', 'Beverages', 'Cleaning Materials', 'Kitchen Supplies', 'Other'
  ];

  const units: UnitType[] = [
    'Kg', 'Gram', 'Ltr', 'Ml', 'Pcs', 'Box', 'Bag', 'Packet', 'Tin', 'Bottle', 'Jar', 'Bundle'
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStat = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === formData.primarySupplierId);
    const itemData = {
      ...formData,
      primarySupplierName: sup ? sup.name : formData.primarySupplierName
    };

    if (editingItem) {
      onUpdateItem(editingItem.id, itemData);
    } else {
      onAddItem(itemData);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddModalOpen(true);
  };

  const openNew = () => {
    setEditingItem(null);
    setFormData({
      code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'Grains',
      subCategory: '',
      unit: 'Kg',
      brand: '',
      minStock: 10,
      maxStock: 50,
      reorderLevel: 15,
      storageLocation: 'Central Godown',
      shelfRack: 'A-01',
      primarySupplierId: suppliers[0]?.id || 'sup-1',
      primarySupplierName: suppliers[0]?.name || 'Gujarat Agro Grain Traders',
      purchaseRate: 100,
      avgRate: 100,
      batchTracking: true,
      expiryTracking: true,
      status: 'active',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-[#3D4A1E]" />
            <span>Master Item Catalog</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage raw materials, grains, spices, dairy, packaging SKUs & reorder thresholds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export Catalog</span>
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Item Name, SKU Code or Brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#3D4A1E] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">SKU Code</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Rack Location</th>
                <th className="px-4 py-3">Reorder Lvl</th>
                <th className="px-4 py-3">Rate (₹)</th>
                <th className="px-4 py-3">Batch/Exp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#3D4A1E]">{item.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-[10px] text-gray-400">Supplier: {item.primarySupplierName}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{item.category}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-mono border border-gray-200">
                      {item.shelfRack || 'A-01'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{item.reorderLevel} {item.unit}</td>
                  <td className="px-4 py-3 font-extrabold text-[#3D4A1E]">₹ {item.purchaseRate}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold text-gray-600">
                      {item.batchTracking ? 'Batch ' : ''}{item.expiryTracking ? '• Exp' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-[#3D4A1E] transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500 text-xs">
                    No items found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingItem ? `Edit Item: ${editingItem.name}` : 'Add New Inventory SKU'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Item SKU Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold text-[#3D4A1E]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Basmati Rice 1121"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Measurement Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Aashirvaad, Amul, Everest"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Primary Supplier</label>
              <select
                value={formData.primarySupplierId}
                onChange={(e) => {
                  const s = suppliers.find(sup => sup.id === e.target.value);
                  setFormData({
                    ...formData,
                    primarySupplierId: e.target.value,
                    primarySupplierName: s ? s.name : ''
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              >
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Reorder Level Quantity</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Purchase Cost Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchaseRate}
                onChange={(e) => setFormData({ ...formData, purchaseRate: Number(e.target.value), avgRate: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg font-bold text-[#3D4A1E]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.batchTracking}
                onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
                className="h-4 w-4 text-[#EA580C] focus:ring-[#EA580C] rounded border-gray-300"
              />
              <span className="font-bold text-gray-700">Enable Batch Number Tracking</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.expiryTracking}
                onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
                className="h-4 w-4 text-[#EA580C] focus:ring-[#EA580C] rounded border-gray-300"
              />
              <span className="font-bold text-gray-700">Enable Expiry Date Tracking</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Save Item Master
            </button>
          </div>
        </form>
      </Modal>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Master Item Catalog"
        data={filteredItems}
        filename="OliveOrange_Master_Items"
      />
    </div>
  );
};
