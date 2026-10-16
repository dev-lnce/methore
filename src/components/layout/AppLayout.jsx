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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Mobile Top & Bottom Nav */}
      <MobileNav />

      {/* Desktop Collapsible Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Viewport Content Area */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out pb-20 md:pb-8 pt-4 md:pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto ${
          isCollapsed ? 'md:pl-28' : 'md:pl-72'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
