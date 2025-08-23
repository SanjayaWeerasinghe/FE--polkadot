// components/ModernFooter.js - Without blockchain connection status
import React from 'react';
import { Shield, CheckCircle, Github, ExternalLink, Heart } from 'lucide-react';

const ModernFooter = ({ 
  showTechStack = true,
  showFeatures = true,
  showLinks = true,
  compact = false 
}) => {
  const techStack = [
    { name: 'Substrate', url: 'https://substrate.io' },
    { name: 'Polkadot.js', url: 'https://polkadot.js.org' },
    { name: 'React', url: 'https://reactjs.org' },
    { name: 'Tailwind', url: 'https://tailwindcss.com' }
  ];

  const features = [
    { name: 'Cryptographic Signatures', icon: Shield },
    { name: 'Multi-party Verification', icon: CheckCircle },
    { name: 'Immutable Storage', icon: Shield }
  ];

  const links = [
    { name: 'Documentation', url: '#', icon: ExternalLink },
    { name: 'GitHub', url: '#', icon: Github },
    { name: 'Support', url: '#', icon: ExternalLink }
  ];

  if (compact) {
    return (
      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">BlockchainDNC</span>
            </div>
            
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2024 Digital Notarized Contracts. Powered by Substrate.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">BlockchainDNC</h3>
                <p className="text-xs text-gray-500">Digital Notarized Contracts</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Secure, transparent, and immutable contract management powered by blockchain technology. 
              Experience the future of digital agreements with cryptographic verification.
            </p>
            
            {/* Social Links */}
            {showLinks && (
              <div className="flex space-x-3">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors group"
                      title={link.name}
                    >
                      <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Features */}
          {showFeatures && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-3">
                {features.map((feature) => {
                  return (
                    <li key={feature.name} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{feature.name}</span>
                    </li>
                  );
                })}
              </ul>
              
              {/* Security Badge */}
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Enterprise Security</span>
                </div>
                <p className="text-xs text-green-600">
                  256-bit encryption, cryptographic signatures, and immutable blockchain storage
                </p>
              </div>
            </div>
          )}
          
          {/* Technology Stack */}
          {showTechStack && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Built With</h3>
              <div className="space-y-3">
                {techStack.map((tech) => (
                  <div key={tech.name} className="group">
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{tech.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ))}
              </div>
              
              {/* Version Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Version</span>
                  <span className="font-mono">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Network</span>
                  <span className="font-mono">Substrate</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Protocol</span>
                  <span>WebSocket</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>© 2024 Digital Notarized Contracts</span>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for decentralized future</span>
            </div>
          </div>
        </div>
        
        {/* Development Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800">Development Mode</span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              This application is running in development mode. Connect to your local Substrate node for testing.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default ModernFooter;