import React from 'react';

const Header = () => {
  return (
    <header className="text-center mb-12 text-white animate-fadeInUp">
      <div className="relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl transform scale-150 opacity-30"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-lg text-responsive-3xl">
            📋 Digital Notarized Contracts
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl opacity-90 leading-relaxed text-responsive-xl">
            Secure, Transparent, Immutable Contract Management
          </p>
          <div className="mt-4 flex justify-center items-center gap-6 text-sm opacity-70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Blockchain-Powered
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Cryptographically Secure
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              Multi-Party Verification
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;