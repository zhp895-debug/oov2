import React, { useState } from 'react';
import { Store } from '../types';
import { Modal } from '../components/ui/Modal';
import {
  Settings as SettingsIcon,
  Building2,
  Plus,
  ShieldCheck,
  Bell,
  UserCheck,
  Sparkles,
  Compass,
  RotateCcw,
  Keyboard,
  HelpCircle
} from 'lucide-react';

interface SettingsProps {
  stores: Store[];
  onAddStore: (store: Partial<Store>) => void;
  onStartTour?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ stores, onAddStore, onStartTour }) => {
  const [isNewStoreOpen, setIsNewStoreOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeCode, setStoreCode] = useState(`STR-${Math.floor(100 + Math.random() * 900)}`);
  const [storeType, setStoreType] = useState<Store['type']>('KITCHEN');
  const [inCharge, setInCharge] = useState('Assistant Cook');
  const [location, setLocation] = useState('Ground Floor');

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStore({
      code: storeCode,
      name: storeName,
      type: storeType,
      inCharge,
      location,
      isMainStore: false
    });
    setIsNewStoreOpen(false);
    setStoreName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#3D4A1E]" />
            <span>Enterprise Settings & Store Control</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure multi-store godowns, kitchen locations, user permissions & guided onboarding
          </p>
        </div>

        <button
          onClick={() => setIsNewStoreOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#EA580C]" />
          <span>Add New Store / Kitchen</span>
        </button>
      </div>

      {/* App Tour & Onboarding Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 p-6 rounded-2xl border border-amber-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              <h3 className="text-sm font-bold text-[#3D4A1E]">
                Interactive App Tour & Guided Workflow
              </h3>
            </div>
            <p className="text-xs text-stone-600 max-w-xl">
              Walk through all 8 core ERP modules with real-time screen syncing, multi-store scope explanations, and chef production guidelines.
            </p>
          </div>

          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Guided App Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Stores List Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider px-1">
          Configured Warehouse & Kitchen Locations ({stores.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#3D4A1E]">{s.code}</span>
                  {s.isMainStore ? (
                    <span className="px-2 py-0.5 bg-[#EA580C] text-white rounded text-[10px] font-bold uppercase">Main Central Store</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-bold uppercase">{s.type}</span>
                  )}
                </div>

                <h4 className="font-bold text-stone-900 text-sm mb-1">{s.name}</h4>
                <p className="text-xs text-stone-500 mb-3">In-Charge: {s.inCharge}</p>

                <div className="text-xs text-stone-600 border-t border-stone-100 pt-2">
                  Location: <strong className="text-stone-800">{s.location}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Rules & Keyboard Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System Rules */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3D4A1E]" />
            <span>System Security & Inventory Control Rules</span>
          </h3>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 mb-0.5">Mandatory Reason Logging</div>
              <p className="text-stone-500">All physical stock adjustments and wastage logs require a compulsory reason field.</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-900 mb-0.5">FEFO Batch Expiry Enforcement</div>
              <p className="text-stone-500">Items with batch & expiry tracking automatically prioritize First-Expiring-First-Out (FEFO) store dispatch.</p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#EA580C]" />
            <span>Keyboard Shortcuts & Power Controls</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-700 font-medium">Quick Command Palette & Search</span>
              <kbd className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono font-bold text-[11px] text-[#3D4A1E] shadow-2xs">
                ⌘K / Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-700 font-medium">Advance App Tour Step</span>
              <kbd className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono font-bold text-[11px] text-[#3D4A1E] shadow-2xs">
                Right Arrow / Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-700 font-medium">Exit Tour or Close Active Modal</span>
              <kbd className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono font-bold text-[11px] text-[#3D4A1E] shadow-2xs">
                Escape
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* New Store Modal */}
      <Modal
        isOpen={isNewStoreOpen}
        onClose={() => setIsNewStoreOpen(false)}
        title="Add New Store or Kitchen Location"
        subtitle="Configure new warehouse section for inventory segregation"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Store Code</label>
            <input
              type="text"
              required
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold text-[#3D4A1E]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Store Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Snack Counter Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Store Type</label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value as any)}
              className="w-full p-2 border border-stone-300 rounded-lg font-medium"
            >
              <option value="CENTRAL">CENTRAL GODOWN</option>
              <option value="KITCHEN">KITCHEN</option>
              <option value="COUNTER">COUNTER / DINING</option>
              <option value="BAKERY">BAKERY / SWEETS</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">In-Charge Supervisor</label>
            <input
              type="text"
              required
              value={inCharge}
              onChange={(e) => setInCharge(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Premises Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-lg font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsNewStoreOpen(false)}
              className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              Create Store Location
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

