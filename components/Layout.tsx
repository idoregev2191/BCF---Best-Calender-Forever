import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      {/* Background */}
      <div className="meet-bg" />

      {/* Content - CHANGED: Removed max-w-5xl, used w-[95%] and max-w-[1800px] for a huge expansive frame */}
      <div className="relative z-10 w-[95%] max-w-[1800px] mx-auto px-2 sm:px-4 py-4 h-screen flex flex-col">
         {children}
      </div>
    </div>
  );
};

export default Layout;