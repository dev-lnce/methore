import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('methore_sidebar_collapsed') === 'true';
  });

  // Listen for storage changes in case sidebar toggle is clicked
  useEffect(() => {
    const handleStorage = () => {
      setIsCollapsed(localStorage.getItem('methore_sidebar_collapsed') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 300);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0B0F17] font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white">
      {/* Mobile Top & Bottom Nav (< md) */}
      <MobileNav />

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Main Viewport Content Area with exact matching transition padding */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out pb-20 md:pb-8 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
