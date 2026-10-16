import React from 'react';
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
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAudioAlert } from '../../context/AudioAlertContext';

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { isMuted, toggleAudio } = useAudioAlert();
  const navigate = useNavigate();

  const role = user ? user.role : 'official';

  const getNavItems = () => {
    const all = [
      { path: '/incidents', label: 'Live', icon: AlertTriangle, roles: ['official', 'administrator'] },
      { path: '/map', label: 'Map', icon: Map, roles: ['official', 'administrator', 'researcher'] },
      { path: '/history', label: 'History', icon: History, roles: ['official', 'administrator', 'researcher'] },
      { path: '/admin/residents', label: 'Residents', icon: Users, roles: ['administrator'] },
      { path: '/admin/network', label: 'Mesh', icon: Network, roles: ['administrator', 'researcher'] },
      { path: '/research/evaluation', label: 'Lab', icon: FlaskConical, roles: ['administrator', 'researcher'] },
      { path: '/handheld', label: 'Handset', icon: Smartphone, roles: ['official', 'researcher', 'administrator'] }
    ];
    return all.filter(i => i.roles.includes(role));
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Sticky Compact Top Header on Mobile (<768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">METHORE</span>
          <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            915 MHz
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={toggleAudio}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title={isMuted ? 'Unmute Audio Alert' : 'Mute Audio Alert'}
            type="button"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* User Sign Out */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
            type="button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Thumb-friendly Bottom Navigation Bar on Mobile (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg safe-area-pb">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="mt-0.5 leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
