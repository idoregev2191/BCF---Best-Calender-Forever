import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      {/* Background */}
      <div className="meet-bg" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-screen flex flex-col">
         {children}
      </div>
    </div>
  );
};

export default Layout;