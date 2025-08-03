import React from 'react';
import TestSection from '../components/TestSection';

const MainMenu = ({ onNavigate, onStatus }) => {
  const menuItems = [
    {
      id: 'initiate',
      icon: '📝',
      title: 'Initiate Contract',
      description: 'Upload a document and create a new digital contract with three parties for secure notarization',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'sign',
      icon: '✍️',
      title: 'Sign Contract',
      description: 'Digitally sign an existing contract using your Polkadot wallet with cryptographic verification',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'contracts',
      icon: '📊',
      title: 'Check Your Contracts',
      description: 'View all contracts you\'re involved in and track their status and signing progress',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Test Section - Always show for debugging */}
      <TestSection onStatus={onStatus} />

      {/* Main Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-glass-lg border border-white/20 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl contract-card animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Icon with gradient background */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-lg`}>
              {item.icon}
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              {item.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm">
              {item.description}
            </p>

            {/* Call to action */}
            <div className={`mt-6 inline-flex items-center text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${item.color} group-hover:text-white transition-colors`}>
              Get Started
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-glass animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl">🔐</div>
          <div className="text-center md:text-left flex-1">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              How Digital Notarized Contracts Work
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our blockchain-based system ensures contract authenticity through three-party verification (First Party, Second Party, and Notary), 
              cryptographic signatures, and immutable storage. Every contract action is recorded on-chain for complete transparency and security.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-600">Secure</div>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">👁️</div>
              <div className="text-xs text-gray-600">Transparent</div>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">⛓️</div>
              <div className="text-xs text-gray-600">Immutable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;