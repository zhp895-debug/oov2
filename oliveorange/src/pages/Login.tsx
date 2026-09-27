import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import OliveOrangeLogo from '../components/common/OliveOrangeLogo';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  User as UserIcon,
  ChefHat,
  Store,
  Calculator,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, currentUser }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState(INITIAL_USERS[0].email);
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [selectedPresetUser, setSelectedPresetUser] = useState<User>(INITIAL_USERS[0]);

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<string>('store_manager');
  const [signupDept, setSignupDept] = useState('Central Store');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Quick Preset Selection
  const handleQuickPresetSelect = (u: User) => {
    setSelectedPresetUser(u);
    setLoginEmail(u.email);
    setErrorMsg('');
  };

  // Sign In Submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }

    // Match existing user or preset user
    const matchedUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
    } else {
      // Custom signed in user
      const customUser: User = {
        id: `usr-${Date.now()}`,
        name: loginEmail.split('@')[0].toUpperCase(),
        email: loginEmail,
        role: selectedPresetUser.role || 'store_manager',
        department: selectedPresetUser.department || 'Operations',
        status: 'active',
        lastLogin: new Date().toLocaleString()
      };
      onLoginSuccess(customUser);
    }
  };

  // Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please check again.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the OliveOrange Security Policy & Terms.');
      return;
    }

    // Create New User Account
    const newUser: User = {
      id: `usr-reg-${Date.now()}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole as any,
      department: signupDept.trim() || 'Operations',
      status: 'active',
      lastLogin: new Date().toLocaleString()
    };

    setSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  const roleBadgeIcons = {
    super_admin: <Shield className="w-4 h-4 text-purple-600" />,
    store_manager: <Store className="w-4 h-4 text-emerald-600" />,
    store_staff: <UserIcon className="w-4 h-4 text-blue-600" />,
    kitchen_manager: <ChefHat className="w-4 h-4 text-amber-600" />,
    accountant: <Calculator className="w-4 h-4 text-indigo-600" />,
    auditor: <Eye className="w-4 h-4 text-rose-600" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E260E] via-[#3D4A1E] to-[#121808] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <OliveOrangeLogo size="lg" variant="badge" showTagline={true} className="mb-4" />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-white/20 text-slate-900">
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#3D4A1E] text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#3D4A1E] text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register / Sign Up</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN FORM */}
          {mode === 'signin' && (
            <form className="space-y-4" onSubmit={handleSignInSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email / Username
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                    placeholder="e.g. chef.maharaj@oliveorange.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Security Password
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#EA580C] focus:ring-[#EA580C] border-slate-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-xs text-slate-600 font-medium">Remember Session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setErrorMsg('Please contact system administrator to reset password.')}
                  className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-[#3D4A1E] hover:bg-[#2C3616] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D4A1E] transition-all cursor-pointer"
              >
                <span>Access OliveOrange Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Role Tester Presets */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
                  Quick 1-Click Role Login (Preset Test Profiles)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INITIAL_USERS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickPresetSelect(u)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] transition-all cursor-pointer flex items-center gap-2 ${
                        selectedPresetUser.id === u.id
                          ? 'border-[#EA580C] bg-orange-50/80 font-bold text-orange-950 ring-1 ring-[#EA580C]/30'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                        {roleBadgeIcons[u.role as keyof typeof roleBadgeIcons] || <UserIcon className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-[11px]">{u.name}</div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-tight truncate">
                          {u.role.replace('_', ' ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* MODE 2: SIGN UP / REGISTER FORM */}
          {mode === 'signup' && (
            <form className="space-y-4" onSubmit={handleSignUpSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    placeholder="e.g. Chef Ramanuj Maharaj"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email Address
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    placeholder="e.g. ramanuj@oliveorange.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    System Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-semibold bg-slate-50/50 cursor-pointer"
                  >
                    <option value="store_manager">Store Manager</option>
                    <option value="kitchen_manager">Kitchen Manager / Head Chef</option>
                    <option value="store_staff">Store Staff / Receiver</option>
                    <option value="accountant">Accountant / Finance</option>
                    <option value="auditor">Stock Auditor</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Premise
                  </label>
                  <input
                    type="text"
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    placeholder="e.g. Central Godown"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#3D4A1E] outline-none font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-[#EA580C] focus:ring-[#EA580C] border-slate-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-xs text-slate-600 font-medium">
                    I agree to OliveOrange Internal Security & Compliance Policies
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-[#EA580C] hover:bg-[#c2410c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C] transition-all cursor-pointer mt-2"
              >
                <span>Create Account & Sign In</span>
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
