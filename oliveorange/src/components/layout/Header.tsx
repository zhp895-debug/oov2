import React from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Building2,
  Plus,
  User,
  ShieldCheck,
  Sparkles,
  Command
} from 'lucide-react';
import { Store, User as UserType } from '../../types';
import OliveOrangeLogo from '../common/OliveOrangeLogo';

interface HeaderProps {
  activeTabTitle: string;
  stores: Store[];
  selectedStoreId: string;
  onStoreChange: (storeId: string) => void;
  lowStockCount: number;
  onOpenMobileSidebar: () => void;
  onQuickAction?: (action: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentUser?: UserType | null;
  onOpenLoginModal?: () => void;
  onStartTour?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  stores,
  selectedStoreId,
  onStoreChange,
  lowStockCount,
  onOpenMobileSidebar,
  onQuickAction,
  searchTerm,
  onSearchChange,
  currentUser,
  onOpenLoginModal,
  onStartTour,
  onOpenCommandPalette
}) => {
  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 z-20 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-stone-600 hover:text-stone-900 lg:hidden rounded-lg hover:bg-stone-100 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block">
            <OliveOrangeLogo size={28} variant="compact" theme="light" />
          </div>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <span className="font-bold text-stone-900 text-sm capitalize">{activeTabTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-5">
        {/* Store Selector */}
        <div
          data-tour="store-selector"
          className="hidden md:flex items-center gap-2 text-xs text-stone-600 bg-amber-50/80 border border-amber-200/90 rounded-lg px-3 py-1.5 shadow-2xs"
        >
          <Building2 className="w-3.5 h-3.5 text-[#3D4A1E]" />
          <span className="font-semibold text-stone-700">Scope:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => onStoreChange(e.target.value)}
            className="bg-transparent font-bold text-[#3D4A1E] focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL">All Premises & Stores</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Global Search Bar / Command Palette Trigger */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center cursor-pointer group"
          title="Search or press ⌘K"
        >
          <Search className="w-4 h-4 absolute left-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search stock, recipes... (⌘K)"
            value={searchTerm}
            className="pl-9 pr-12 py-1.5 bg-stone-100 hover:bg-stone-150/80 border border-stone-200/80 rounded-full text-xs w-44 sm:w-56 lg:w-64 outline-none transition-all cursor-pointer text-stone-700"
          />
          <span className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-stone-500 rounded border border-stone-200 shadow-2xs">
            ⌘K
          </span>
        </div>

        {/* App Tour Highlight Action Button */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            data-tour="app-tour-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-[#EA580C] hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 group"
            title="Start Interactive Guided Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="hidden md:inline">App Tour</span>
          </button>
        )}

        {/* User Auth Profile Badge */}
        <button
          onClick={onOpenLoginModal}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-all cursor-pointer text-left shadow-2xs"
          title="Click to Switch User / Login"
        >
          <div className="w-7 h-7 rounded-lg bg-[#3D4A1E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {currentUser ? currentUser.name.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="hidden xl:block leading-none">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-stone-900 truncate max-w-[110px]">
                {currentUser ? currentUser.name : 'Sign In'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
            </div>
            <span className="text-[10px] text-[#3D4A1E] font-bold uppercase tracking-wider">
              {currentUser ? currentUser.role.replace('_', ' ') : 'Guest'}
            </span>
          </div>
        </button>

        {/* Quick Add Indent Button */}
        {onQuickAction && (
          <button
            onClick={() => onQuickAction('new-indent')}
            className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Indent</span>
          </button>
        )}

        {/* Actions & Notifications */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            onClick={onOpenCommandPalette}
            className="relative p-2 rounded-lg hover:bg-stone-100 cursor-pointer text-stone-600 transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EA580C] rounded-full border-2 border-white animate-pulse" />
            )}
          </div>

          <div
            onClick={onStartTour}
            className="p-2 rounded-lg hover:bg-stone-100 cursor-pointer text-stone-600 hidden sm:block transition-colors"
            title="Help & Interactive Tour"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
};

