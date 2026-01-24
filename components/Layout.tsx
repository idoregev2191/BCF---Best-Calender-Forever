import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-slate-900">
      {/* Background */}
      <div className="meet-bg" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 h-screen flex flex-col">
         {children}
      </div>
    </div>
  );
};

export default Layout;