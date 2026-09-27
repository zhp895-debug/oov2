import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  ChefHat,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Settings as SettingsIcon,
  X,
  LogOut,
  Sparkles,
  Compass
} from 'lucide-react';
import { User } from '../../types';
import OliveOrangeLogo from '../common/OliveOrangeLogo';

export type NavTab =
  | 'dashboard'
  | 'item-master'
  | 'inventory'
  | 'purchasing'
  | 'kitchen'
  | 'recipe-bom'
  | 'stock-audit'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
  onStartTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
  currentUser,
  onLogout,
  onOpenLoginModal,
  onStartTour
}) => {
  const coreModules = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, tourKey: 'nav-dashboard' },
    { id: 'item-master' as NavTab, label: 'Item Master', icon: Package, tourKey: 'nav-item-master' },
    { id: 'inventory' as NavTab, label: 'Inventory', icon: Boxes, tourKey: 'nav-inventory' },
    { id: 'purchasing' as NavTab, label: 'Purchasing', icon: ShoppingCart, tourKey: 'nav-purchasing' },
  ];

  const kitchenModules = [
    { id: 'kitchen' as NavTab, label: 'Kitchen Mgmt', icon: ChefHat, tourKey: 'nav-kitchen' },
    { id: 'recipe-bom' as NavTab, label: 'Recipe / BOM', icon: BookOpen, tourKey: 'nav-recipe-bom' },
  ];

  const adminModules = [
    { id: 'stock-audit' as NavTab, label: 'Stock Audit', icon: ClipboardCheck, tourKey: 'nav-stock-audit' },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3, tourKey: 'nav-reports' },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon, tourKey: 'nav-settings' },
  ];

  const renderNavLink = (item: { id: NavTab; label: string; icon: React.ElementType; tourKey: string }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        data-tour={item.tourKey}
        onClick={() => {
          onTabChange(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center px-5 py-2.5 text-xs transition-all text-left cursor-pointer ${
          isActive
            ? 'bg-white/10 text-white border-l-4 border-[#EA580C] font-bold shadow-2xs'
            : 'text-amber-100/75 hover:bg-white/5 font-medium'
        }`}
      >
        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-amber-200/60'}`} />
        <span className="ml-3 tracking-wide">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#3D4A1E] flex flex-col h-full shrink-0 transform transition-transform duration-200 ease-in-out border-r border-[#526328]/40 shadow-xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          data-tour="brand-header"
          className="p-4 border-b border-[#526328] flex items-center justify-between bg-[#343F1A]"
        >
          <OliveOrangeLogo size={32} variant="compact" theme="dark" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Body */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-3.5">
          <div>
            <div className="px-5 mb-1.5 text-amber-200/60 text-[9.5px] uppercase font-black tracking-widest">
              Core Modules
            </div>
            {coreModules.map(renderNavLink)}
          </div>

          <div>
            <div className="px-5 mb-1.5 text-amber-200/60 text-[9.5px] uppercase font-black tracking-widest">
              Kitchen & Production
            </div>
            {kitchenModules.map(renderNavLink)}
          </div>

          <div>
            <div className="px-5 mb-1.5 text-amber-200/60 text-[9.5px] uppercase font-black tracking-widest">
              Admin & Control
            </div>
            {adminModules.map(renderNavLink)}
          </div>

          {/* Quick Tour Banner in Sidebar */}
          {onStartTour && (
            <div className="px-3 pt-2">
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onStartTour();
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#2C3616] to-[#343F1A] border border-amber-300/30 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:rotate-12 transition-transform">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white block leading-tight">
                      Take Guided Tour
                    </span>
                    <span className="text-[9.5px] text-amber-200/70 block">
                      60-sec interactive walk
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}
        </nav>

        {/* Footer Admin Badge */}
        <div className="p-3.5 border-t border-[#526328] bg-[#2C3616]">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2.5 text-left overflow-hidden hover:opacity-90 transition-opacity cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-full bg-[#EA580C] border-2 border-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'OO'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-white font-semibold truncate">
                  {currentUser ? currentUser.name : 'Guest User'}
                </p>
                <p className="text-[9.5px] text-amber-300 font-bold truncate uppercase tracking-wider">
                  {currentUser ? currentUser.role.replace('_', ' ') : 'Sign In'}
                </p>
              </div>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-[#3D4A1E] rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
