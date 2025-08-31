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
      <footer className="border-t backdrop-blur-xl glass-card-dark" style={{borderColor: 'var(--border-primary)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--accent-dark), var(--success))'}}>
                <Shield className="w-5 h-5" style={{color: 'var(--text-primary)'}} />
              </div>
              <span className="font-bold" style={{color: 'var(--text-primary)'}}>BlockchainDNC</span>
            </div>
            
            {/* Copyright */}
            <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
              © 2024 Digitally Notarized Contracts. Powered by Substrate.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t backdrop-blur-xl" style={{borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--accent-dark), var(--success))'}}>
                <Shield className="w-6 h-6" style={{color: 'var(--text-primary)'}} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>BlockchainDNC</h3>
                <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Digitally Notarized Contracts</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group hover:opacity-80"
                      title={link.name}
                      style={{backgroundColor: 'var(--bg-hover)'}}
                    >
                      <Icon className="w-4 h-4" style={{color: 'var(--text-secondary)'}} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Features */}
          {showFeatures && (
            <div>
              <h3 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Key Features</h3>
              <ul className="space-y-3">
                {features.map((feature) => {
                  return (
                    <li key={feature.name} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--success-bg)'}}>
                        <CheckCircle className="w-3 h-3" style={{color: 'var(--success)'}} />
                      </div>
                      <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{feature.name}</span>
                    </li>
                  );
                })}
              </ul>
              
              {/* Security Badge */}
              <div className="mt-6 p-4 rounded-xl" style={{background: 'linear-gradient(to bottom right, var(--success-bg), var(--success-bg))', border: '1px solid var(--success)'}}>
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4" style={{color: 'var(--success)'}} />
                  <span className="text-sm font-semibold" style={{color: 'var(--success)'}}>Enterprise Security</span>
                </div>
                <p className="text-xs" style={{color: 'var(--success)'}}>
                  256-bit encryption, cryptographic signatures, and immutable blockchain storage
                </p>
              </div>
            </div>
          )}
          
          {/* Technology Stack */}
          {showTechStack && (
            <div>
              <h3 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Built With</h3>
              <div className="space-y-3">
                {techStack.map((tech) => (
                  <div key={tech.name} className="group">
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm transition-colors hover:opacity-80"
                      style={{color: 'var(--text-secondary)'}}
                    >
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--accent-primary)'}}></span>
                      <span>{tech.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{color: 'var(--text-tertiary)'}} />
                    </a>
                  </div>
                ))}
              </div>
              
              {/* Version Info */}
              <div className="mt-6 p-3 rounded-lg" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)'}}>
                <div className="flex items-center justify-between text-xs mb-1" style={{color: 'var(--text-tertiary)'}}>
                  <span>Version</span>
                  <span className="font-mono">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1" style={{color: 'var(--text-tertiary)'}}>
                  <span>Network</span>
                  <span className="font-mono">Substrate</span>
                </div>
                <div className="flex items-center justify-between text-xs" style={{color: 'var(--text-tertiary)'}}>
                  <span>Protocol</span>
                  <span>WebSocket</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Section */}
        <div className="border-t pt-6" style={{borderColor: 'var(--border-secondary)'}}>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm" style={{color: 'var(--text-secondary)'}}>
              <span>© 2024 Digitally Notarized Contracts</span>
              <span>•</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: 'var(--text-secondary)'}}>Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:opacity-80 transition-colors" style={{color: 'var(--text-secondary)'}}>Terms of Service</a>
            </div>
            
            <div className="flex items-center space-x-2 text-sm" style={{color: 'var(--text-secondary)'}}>
              <span>Made with</span>
              <Heart className="w-4 h-4" style={{color: 'var(--error)'}} />
              <span>for decentralized future</span>
            </div>
          </div>
        </div>
        
        {/* Development Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 rounded-xl" style={{backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning)'}}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--warning)'}}></div>
              <span className="text-sm font-medium" style={{color: 'var(--warning)'}}>Development Mode</span>
            </div>
            <p className="text-xs mt-1" style={{color: 'var(--warning)'}}>
              This application is running in development mode. Connect to your local Substrate node for testing.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default ModernFooter;