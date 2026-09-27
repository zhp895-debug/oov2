import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Package,
  Boxes,
  ChefHat,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Building2,
  Search,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import OliveOrangeLogo from './OliveOrangeLogo';
import { NavTab } from '../layout/Sidebar';

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tab?: NavTab;
  highlightSelector?: string;
  icon: React.ElementType;
  accentColor: string;
  tips?: string[];
  badgeText?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to OliveOrange ERP',
    subtitle: 'Unified Stock & Kitchen Enterprise Management',
    description:
      'Welcome to OliveOrange Technologies! Designed around the motto "Every Problem Has a Solution," this system unifies warehouse stock, multi-store logistics, supplier purchasing, chef recipes, and audit control into a real-time experience.',
    tab: 'dashboard',
    highlightSelector: '[data-tour="brand-header"]',
    icon: Sparkles,
    accentColor: '#EA580C',
    badgeText: 'Overview',
    tips: [
      'Multi-role access: Super Admin, Store Manager, Executive Chef & Auditor',
      'Real-time inventory valuation & low-stock safety buffers',
      'End-to-end trace from Purchase Order to Plate'
    ]
  },
  {
    id: 'store-scope',
    title: 'Multi-Store & Godown Scope',
    subtitle: 'Filter Balances by Specific Godown or Global Network',
    description:
      'Switch between Central Godown, Kitchen Dry Stores, Cold Storage, and Outlets instantly. All KPI cards, transaction ledgers, and critical alerts update dynamically based on the selected store scope.',
    tab: 'dashboard',
    highlightSelector: '[data-tour="store-selector"]',
    icon: Building2,
    accentColor: '#3D4A1E',
    badgeText: 'Multi-Location',
    tips: [
      'Select "All Premises" for an enterprise consolidated view',
      'Switch to "Main Kitchen" to audit chef-ready ingredients'
    ]
  },
  {
    id: 'item-master',
    title: 'Master Item Catalog (BOM & SKUs)',
    subtitle: 'Centralized Product Definitions, Par Levels & Vendors',
    description:
      'Define ingredients, raw spices, packaging, and produce with automatic SKU generation, primary supplier mapping, minimum/maximum safety thresholds, and shelf location tagging.',
    tab: 'item-master',
    highlightSelector: '[data-tour="nav-item-master"]',
    icon: Package,
    accentColor: '#EA580C',
    tips: [
      'Set automated Reorder Levels to trigger timely purchase warnings',
      'Configure Batch and Expiry date tracking per SKU'
    ]
  },
  {
    id: 'inventory-batches',
    title: 'Real-Time Inventory & FIFO Batches',
    subtitle: 'Batch Lot Tracking, Expiry Monitoring & Stock Transfers',
    description:
      'Monitor exact on-hand balances across all warehouses. Track batch numbers, manufacturing dates, and expiring stock with automated FIFO valuation and inter-store transfer slips.',
    tab: 'inventory',
    highlightSelector: '[data-tour="nav-inventory"]',
    icon: Boxes,
    accentColor: '#3D4A1E',
    tips: [
      'Color-coded expiry indicators alert you 15-30 days before obsolescence',
      'Perform instant inter-store stock transfers with digital issue slips'
    ]
  },
  {
    id: 'purchasing',
    title: 'Procurement & Purchase Orders',
    subtitle: 'Vendor Quotations, Purchase Orders & Goods Receipt Notes (GRN)',
    description:
      'Streamline the procurement pipeline from draft Purchase Requisitions to vendor PO generation and GRN inspection with automated stock intake upon approval.',
    tab: 'purchasing',
    highlightSelector: '[data-tour="nav-purchasing"]',
    icon: Zap,
    accentColor: '#EA580C',
    tips: [
      '1-Click PO status progression: Draft ➔ Sent ➔ Received ➔ Inspected',
      'Automated rate calculation with GST and tax breakdowns'
    ]
  },
  {
    id: 'kitchen-requisitions',
    title: 'Kitchen Indents & Requisitions',
    subtitle: 'Chef Material Requests & Daily Kitchen Store Transfers',
    description:
      'Chefs create meal-specific indents (Breakfast, Lunch, Dinner, Banquet) from the Central Store. Storekeepers review and approve transfers, automatically adjusting physical store balances.',
    tab: 'kitchen',
    highlightSelector: '[data-tour="nav-kitchen"]',
    icon: ChefHat,
    accentColor: '#3D4A1E',
    tips: [
      'Track kitchen-specific wastage logs with disposal root-cause logging',
      'Direct synchronization between requested portions and ingredient picklists'
    ]
  },
  {
    id: 'recipe-bom',
    title: 'Standard Recipe & BOM Production',
    subtitle: 'Automated Recipe Costing & Batch Kitchen Consumption',
    description:
      'Build standard master recipes with accurate yields and ingredient ratios. When you execute a batch production run, the system automatically deducts proportional raw materials from the kitchen store.',
    tab: 'recipe-bom',
    highlightSelector: '[data-tour="nav-recipe-bom"]',
    icon: BookOpen,
    accentColor: '#EA580C',
    tips: [
      'Calculates real-time Food Cost % per serving',
      'Simulate 50, 100, or 500 portions and preview ingredient demand before cooking'
    ]
  },
  {
    id: 'stock-audit',
    title: 'Physical Stock Audits & Variance Control',
    subtitle: 'Cycle Counts, Variance Ledgers & Auto-Adjustment',
    description:
      'Perform periodic stock counts. The system calculates physical vs book variances, calculates net financial impact, and posts auto-reconciling adjustments with full audit logs.',
    tab: 'stock-audit',
    highlightSelector: '[data-tour="nav-stock-audit"]',
    icon: ClipboardCheck,
    accentColor: '#3D4A1E',
    tips: [
      'Tracks positive surpluses and negative leakages per item',
      'Auditor signatures and timestamped verification entries'
    ]
  },
  {
    id: 'reports-analytics',
    title: 'Financial Reports & Executive Analytics',
    subtitle: 'Stock Valuation, ABC Classification & Consumption Trends',
    description:
      'Generate comprehensive valuation summaries, ABC Pareto classifications, daily consumption velocity graphs, and wastage breakdown charts ready for PDF/Excel export.',
    tab: 'reports',
    highlightSelector: '[data-tour="nav-reports"]',
    icon: BarChart3,
    accentColor: '#EA580C',
    tips: [
      'Export detailed reports in CSV, PDF, and Print formats',
      'Fast analytics on top consumed spices, dairy, and grains'
    ]
  },
  {
    id: 'finish',
    title: "You're All Set!",
    subtitle: 'Ready to Experience OliveOrange ERP',
    description:
      'You are now ready to manage your food service inventory with complete clarity. You can replay this interactive tour anytime using the Tour button in the header or the help menu.',
    tab: 'dashboard',
    highlightSelector: '[data-tour="quick-action"]',
    icon: CheckCircle2,
    accentColor: '#3D4A1E',
    badgeText: 'Tour Complete',
    tips: [
      'Pro Tip: Use ⌘K or the top Search Bar for quick navigation',
      'Switch user roles in the top-right corner to test chef vs admin workflows',
      'Remember: "Every Problem Has a Solution"'
    ]
  }
];

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  currentTab: NavTab;
}

export const AppTour: React.FC<AppTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const step = TOUR_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  // Sync tab with step
  useEffect(() => {
    if (isOpen && step.tab && step.tab !== currentTab) {
      onNavigateTab(step.tab);
    }
  }, [isOpen, currentStepIndex, step.tab, currentTab, onNavigateTab]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (currentStepIndex < TOUR_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      }
    }
  }, [isOpen, currentStepIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentStepIndex(0);
    if (TOUR_STEPS[0].tab) {
      onNavigateTab(TOUR_STEPS[0].tab);
    }
  };

  const handleFinish = () => {
    setIsCompleted(false);
    onClose();
    localStorage.setItem('oliveorange_tour_completed', 'true');
  };

  if (!isOpen) return null;

  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Soft Dimmed Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 flex flex-col max-h-[92vh]"
        >
          {/* Top Decorative Gradient Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#3D4A1E]" />

          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <OliveOrangeLogo size={30} variant="compact" theme="light" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#3D4A1E]">
                    Interactive Tour
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-[#EA580C]">
                    {step.badgeText || `Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}`}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  OliveOrange Technologies ERP Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                title="Restart Tour from Beginning"
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                title="Exit Tour (Esc)"
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Step Navigator Pills */}
          <div className="px-6 pt-3 pb-1 bg-stone-50/30 border-b border-stone-100 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
            {TOUR_STEPS.map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  title={`${idx + 1}. ${s.title}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#3D4A1E] text-white shadow-xs scale-105'
                      : isPast
                      ? 'bg-amber-100/70 text-[#3D4A1E] hover:bg-amber-200/80'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200/70'
                  }`}
                >
                  <span className="text-[10px] opacity-80">{idx + 1}</span>
                  <span className="hidden md:inline text-[11px] font-medium max-w-[80px] truncate">
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Body */}
          <div className="px-6 py-6 overflow-y-auto space-y-5">
            {/* Step Header Card */}
            <div className="flex items-start gap-4">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-950/10"
                style={{ backgroundColor: step.accentColor }}
              >
                <StepIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-[#EA580C] mt-0.5">
                  {step.subtitle}
                </p>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Key Features & Pro-Tips Box */}
            {step.tips && step.tips.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3D4A1E]">
                  <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
                  <span>Key Workflow Highlights:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {step.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Context Pill */}
            {step.tab && (
              <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-100/70 px-3.5 py-2 rounded-lg border border-stone-200/70">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-700">Live Active View:</span>
                  <span className="px-2 py-0.5 rounded bg-white font-mono text-[11px] font-bold text-[#3D4A1E] shadow-2xs border border-stone-200">
                    /{step.tab}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  Tab synced in background
                </span>
              </div>
            )}
          </div>

          {/* Footer Controls & Progress Bar */}
          <div className="p-5 border-t border-stone-100 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Progress Percentage */}
            <div className="w-full sm:w-48 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                <span>Progress</span>
                <span className="text-[#EA580C] font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#EA580C] to-[#3D4A1E]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Skip Tour
              </button>

              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {currentStepIndex < TOUR_STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#3D4A1E] hover:bg-[#2F3917] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-stone-800/10 hover:shadow-lg"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#EA580C] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-orange-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Explore</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppTour;
