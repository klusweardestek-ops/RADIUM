
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-black z-0">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial-gradient from-transparent via-black to-black animate-spin-slow"></div>
        <div 
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-brand-blue/30 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
          style={{ animationDuration: '8s' }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-brand-purple/30 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        ></div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow ease-in-out infinite;
        }
        .bg-radial-gradient {
          background-image: radial-gradient(circle, rgba(0, 191, 255, 0.2) 0%, rgba(0,0,0,0) 50%);
        }
      `}</style>
      
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
