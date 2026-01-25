import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-full relative overflow-hidden text-slate-900 bg-[#f8fafc] flex flex-col">
      {/* Background */}
      <div className="meet-bg" />

      {/* Content Container - Flex Col */}
      <div className="relative z-10 w-full h-full flex flex-col">
         {children}
      </div>
    </div>
  );
};

export default Layout;