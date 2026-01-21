import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Static Background */}
      <div className="meet-bg" />

      {/* Main Container - Responsive Width */}
      <div className="relative z-10 flex flex-col h-screen max-w-md mx-auto md:max-w-7xl bg-white/40 shadow-2xl shadow-slate-900/10 md:bg-white/30 md:border-x md:border-white/50 transition-all duration-300">
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
           {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;