import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  ChefHat,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  Building2,
  Plus,
  ArrowRight,
  User,
  X,
  Compass
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';
import { Store, User as UserType } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onStartTour: () => void;
  onOpenNewItem?: () => void;
  onOpenNewPO?: () => void;
  onOpenNewReq?: () => void;
  stores: Store[];
  selectedStoreId: string;
  onStoreChange: (id: string) => void;
  currentUser?: UserType | null;
  onOpenLoginModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onStartTour,
  onOpenNewItem,
  onOpenNewPO,
  onOpenNewReq,
  stores,
  selectedStoreId,
  onStoreChange,
  currentUser,
  onOpenLoginModal
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    {
      id: 'tour',
      title: 'Start Interactive App Tour',
      subtitle: 'Walk through all 8 modules & workflow tips',
      icon: Sparkles,
      color: '#EA580C',
      category: 'Guides & Onboarding',
      action: () => {
        onClose();
        onStartTour();
      }
    },
    {
      id: 'dash',
      title: 'Go to Dashboard',
      subtitle: 'Real-time KPIs, low stock alerts & ledgers',
      icon: LayoutDashboard,
      color: '#3D4A1E',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('dashboard');
      }
    },
    {
      id: 'item-master',
      title: 'Go to Item Master Catalog',
      subtitle: 'Manage ingredients, par levels & supplier mappings',
      icon: Package,
      color: '#EA580C',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('item-master');
      }
    },
    {
      id: 'inventory',
      title: 'Go to Inventory Balances & FIFO Batches',
      subtitle: 'Batch lot numbers, expiry alerts & stock transfers',
      icon: Boxes,
      color: '#3D4A1E',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('inventory');
      }
    },
    {
      id: 'purchasing',
      title: 'Go to Procurement & Purchase Orders',
      subtitle: 'Generate POs, approve quotations & record GRN',
      icon: ShoppingCart,
      color: '#EA580C',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('purchasing');
      }
    },
    {
      id: 'kitchen',
      title: 'Go to Kitchen Requisitions & Wastage',
      subtitle: 'Chef indents, daily stock issues & meal tracking',
      icon: ChefHat,
      color: '#3D4A1E',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('kitchen');
      }
    },
    {
      id: 'recipe-bom',
      title: 'Go to Recipe & BOM Production',
      subtitle: 'Food costing, batch production simulation & consumption',
      icon: BookOpen,
      color: '#EA580C',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('recipe-bom');
      }
    },
    {
      id: 'stock-audit',
      title: 'Go to Physical Stock Audit',
      subtitle: 'Cycle counts, variance reports & reconciliation',
      icon: ClipboardCheck,
      color: '#3D4A1E',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('stock-audit');
      }
    },
    {
      id: 'reports',
      title: 'Go to Financial Reports & Analytics',
      subtitle: 'Valuation summaries, ABC analysis & wastage trends',
      icon: BarChart3,
      color: '#EA580C',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('reports');
      }
    },
    {
      id: 'settings',
      title: 'Go to System Settings & Stores',
      subtitle: 'Configure stores, staff permissions & integrations',
      icon: SettingsIcon,
      color: '#3D4A1E',
      category: 'Navigation',
      action: () => {
        onClose();
        onNavigateTab('settings');
      }
    },
    {
      id: 'new-indent',
      title: 'Create New Kitchen Indent',
      subtitle: 'Chef requisition for breakfast, lunch or banquet',
      icon: Plus,
      color: '#EA580C',
      category: 'Quick Actions',
      action: () => {
        onClose();
        onNavigateTab('kitchen');
        if (onOpenNewReq) onOpenNewReq();
      }
    },
    {
      id: 'new-item',
      title: 'Add New Master SKU Item',
      subtitle: 'Register new raw ingredient or packaging material',
      icon: Plus,
      color: '#3D4A1E',
      category: 'Quick Actions',
      action: () => {
        onClose();
        onNavigateTab('item-master');
        if (onOpenNewItem) onOpenNewItem();
      }
    },
    {
      id: 'new-po',
      title: 'Create Purchase Order (PO)',
      subtitle: 'Send procurement order to approved supplier',
      icon: Plus,
      color: '#EA580C',
      category: 'Quick Actions',
      action: () => {
        onClose();
        onNavigateTab('purchasing');
        if (onOpenNewPO) onOpenNewPO();
      }
    },
    {
      id: 'switch-user',
      title: 'Switch User Role / Sign In',
      subtitle: `Currently logged in as: ${currentUser?.name || 'Guest'} (${currentUser?.role || 'user'})`,
      icon: User,
      color: '#3D4A1E',
      category: 'Account & Security',
      action: () => {
        onClose();
        if (onOpenLoginModal) onOpenLoginModal();
      }
    }
  ];

  const filtered = actions.filter(
    a =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    },
    [isOpen, filtered, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 flex flex-col max-h-[80vh]"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/60">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command, search modules, or take tour... (⌘K / Esc)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold text-stone-800 placeholder-stone-400 outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Store Filter Pills */}
          <div className="px-4 py-2 bg-stone-100/50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] mr-1 shrink-0 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#3D4A1E]" /> Scope:
            </span>
            <button
              onClick={() => onStoreChange('ALL')}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 ${
                selectedStoreId === 'ALL'
                  ? 'bg-[#3D4A1E] text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              All Premises
            </button>
            {stores.map(s => (
              <button
                key={s.id}
                onClick={() => onStoreChange(s.id)}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedStoreId === s.id
                    ? 'bg-[#3D4A1E] text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Action List */}
          <div className="overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No matching actions or modules found for "{query}"
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border border-amber-300/80 shadow-xs'
                        : 'hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {item.title}
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-stone-100 text-stone-500 uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-[#EA580C] translate-x-1' : 'text-stone-300 opacity-0'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Use <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-mono shadow-2xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-mono shadow-2xs">↓</kbd> to navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-mono shadow-2xs">↵</kbd> to select</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              className="text-[#EA580C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Launch App Tour</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
