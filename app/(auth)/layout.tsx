import React from 'react';

interface AuthLayoutProps {
    children : React.ReactNode
}

const AuthLayout = ({ children } : AuthLayoutProps) => {
  return (
    <div className='relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50'>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-amber-400/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-yellow-300/10 rounded-full animate-float-slow"></div>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(234, 179, 8, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {children}
    </div>
  );
}

export default AuthLayout;