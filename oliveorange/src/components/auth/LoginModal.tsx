import React, { useState } from 'react';
import { User } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import { LogIn, Shield, UserCheck, CheckCircle2, Lock, ChefHat, Store, Calculator, Eye } from 'lucide-react';
import OliveOrangeLogo from '../common/OliveOrangeLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleUser, setSelectedRoleUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter an email address or select a quick profile.');
      return;
    }

    const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      onLogin(matched);
      onClose();
    } else {
      // Create ad-hoc session user
      const customUser: User = {
        id: `usr-custom-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'store_manager',
        department: 'Operations',
        status: 'active',
        lastLogin: new Date().toLocaleString()
      };
      onLogin(customUser);
      onClose();
    }
  };

  const handleQuickSelect = (user: User) => {
    onLogin(user);
    onClose();
  };

  const roleIcons = {
    super_admin: <Shield className="w-5 h-5 text-purple-600" />,
    store_manager: <Store className="w-5 h-5 text-amber-700" />,
    store_staff: <UserCheck className="w-5 h-5 text-blue-600" />,
    kitchen_manager: <ChefHat className="w-5 h-5 text-orange-600" />,
    accountant: <Calculator className="w-5 h-5 text-indigo-600" />,
    auditor: <Eye className="w-5 h-5 text-amber-600" />
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#3D4A1E] to-[#2C3616] p-6 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OliveOrangeLogo size={48} variant="icon" />
            <div>
              <h2 className="text-xl font-bold font-serif tracking-wide">
                Olive<span className="text-orange-400">Orange</span> Technologies
              </h2>
              <p className="text-xs text-amber-200 mt-0.5">Authentication & Role-Based Access Control</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-amber-100/70 italic font-medium">Every Problem Has a Solution.</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {currentUser && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#3D4A1E] shrink-0" />
                <div>
                  <p className="text-xs text-slate-700 font-medium">Currently Authenticated</p>
                  <p className="text-sm font-bold text-[#3D4A1E]">{currentUser.name} ({currentUser.role.replace('_', ' ').toUpperCase()})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="text-xs px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-xs px-3 py-1.5 bg-[#3D4A1E] hover:bg-[#2C3616] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Profile Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              1-Click Role Login (Preset Accounts)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INITIAL_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    currentUser?.id === u.id
                      ? 'border-[#EA580C] bg-orange-50/60 ring-2 ring-[#EA580C]/20'
                      : 'border-gray-200 hover:border-[#3D4A1E] hover:bg-gray-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                    {roleIcons[u.role as keyof typeof roleIcons] || <UserCheck className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{u.email}</p>
                    <p className="text-[10px] text-[#3D4A1E] font-semibold mt-1">{u.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider absolute">OR LOGIN WITH EMAIL</span>
          </div>

          {/* Custom Form Login */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. manager@oliveorange.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#3D4A1E] hover:bg-[#2C3616] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to System</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
