import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Lock, ArrowRight, Eye, EyeOff, RotateCcw, CheckCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { resetDemoData } from '../services/api';

export default function LoginPage() {
  const { login, switchDemoRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('alex.rivera');
  const [password, setPassword] = useState('mesh-station-node-915');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('official');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleResetDemo = () => {
    resetDemoData();
    setToastMessage('Demo dataset restored to initial state');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const demoRoles = [
    { key: 'official', name: 'Alex Rivera', roleTitle: 'Barangay Official', user: 'alex.rivera' },
    { key: 'administrator', name: 'Jordan Reyes', roleTitle: 'System Admin', user: 'jordan.reyes' },
    { key: 'researcher', name: 'Sam Taylor', roleTitle: 'Researcher', user: 'sam.taylor' }
  ];

  const handleRoleSelect = (r) => {
    setSelectedRole(r.key);
    setUsername(r.user);
    setPassword('mesh-station-node-915');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(username, password);
      if (user.role === 'researcher') {
        navigate('/research/evaluation');
      } else {
        navigate('/incidents');
      }
    } catch (err) {
      console.warn('Backend login fallback to local session:', err.message);
      switchDemoRole(selectedRole);
      if (selectedRole === 'researcher') {
        navigate('/research/evaluation');
      } else {
        navigate('/incidents');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Floating Bar: Status Pill + Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm rounded-full px-3.5 py-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300">
            Station Gateway • COM4
          </span>
        </div>

        {/* Theme Toggle Pill */}
        <button
          onClick={toggleTheme}
          type="button"
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-card flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-start mb-6">
          <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm border border-slate-800 dark:border-slate-700">
            <Radio className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            METHORE Station
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Offline LoRa Mesh Emergency Console
          </p>
        </div>

        {/* 1-Click Demo Operator Selector */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
            Select operator account
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            {demoRoles.map((r) => {
              const isSelected = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {r.roleTitle.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all shadow-sm"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
                Password
              </label>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Local Station Auth
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all shadow-sm pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 border border-transparent dark:border-slate-700"
          >
            <span>{isSubmitting ? 'Accessing Station...' : 'Sign In to Local Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">
            Persistent Offline Storage • Standalone Prototype
          </span>
        </div>
      </div>

      <footer className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-xs"
          title="Restore default local mock dataset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          Barangay San Isidro Emergency LoRa Subsystem
        </span>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
