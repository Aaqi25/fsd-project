import React from 'react';
import { Outlet } from 'react-router-dom';
import { BrowserHeader } from './BrowserHeader';
import { SimulatorDrawer } from './SimulatorDrawer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Browser Bar & Dark Navigation Bar */}
      <BrowserHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* IoT Device Simulator Drawer */}
      <SimulatorDrawer />
    </div>
  );
};
