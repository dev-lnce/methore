import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Map, 
  History, 
  Users, 
  Network, 
  FlaskConical, 
  Smartphone, 
  LogOut, 
  PanelLeftClose, 
  PanelLeft,
  ShieldCheck,
  User,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetDemoData } from '../../services/api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('methore_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('methore_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleResetDemo = () => {
    resetDemoData();
    setToastMessage('Demo dataset restored to initial state');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const role = user ? user.role : 'official';

  // Strict route filtering based on role
  const getNavItems = () => {
    const allItems = [
      {
        path: '/incidents',
        label: 'Live Incidents',
        icon: AlertTriangle,
        roles: ['official', 'administrator']
      },
      {
        path: '/map',
        label: 'Offline Map',
        icon: Map,
        roles: ['official', 'administrator', 'researcher']
      },
      {
        path: '/history',
        label: 'Incident History',
        icon: History,
        roles: ['official', 'administrator', 'researcher']
      },
      {
        path: '/admin/residents',
        label: 'Residents & Devices',
        icon: Users,
        roles: ['administrator']
      },
      {
        path: '/admin/network',
        label: 'Mesh Network',
        icon: Network,
        roles: ['administrator', 'researcher']
      },
      {
        path: '/research/evaluation',
        label: 'Evaluation Lab',
        icon: FlaskConical,
        roles: ['administrator', 'researcher']
      },
      {
        path: '/handheld',
        label: 'Handheld Simulator',
        icon: Smartphone,
        roles: ['official', 'researcher', 'administrator']
      }
    ];

    return allItems.filter(item => item.roles.includes(role));
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-slate-200 shadow-card flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                  METHORE
                </span>
                <span className="font-mono text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  915 MHz Mesh
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            type="button"
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Collapsed Hover Tooltip Pill */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-lg z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Card / Collapsed Avatar & Reset Demo Data */}
      <div className="p-3 border-t border-slate-100 flex flex-col gap-2">
        {/* Reset Demo Data Utility Button */}
        {!isCollapsed ? (
          <button
            onClick={handleResetDemo}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-dashed border-slate-200"
            title="Restore default local mock dataset (Alex Rivera, Jordan Reyes, etc.)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        ) : (
          <button
            onClick={handleResetDemo}
            type="button"
            className="w-8 h-8 mx-auto flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-dashed border-slate-200"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {!isCollapsed ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user ? user.full_name : 'Local Operator'}
                </span>
                <span className="text-[11px] font-medium text-slate-500 capitalize">
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs"
              title={`${user?.full_name || 'Operator'} (${role})`}
            >
              {user ? user.full_name.charAt(0) : 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
              type="button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Persistent Toast Confirmation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </aside>
  );
}
