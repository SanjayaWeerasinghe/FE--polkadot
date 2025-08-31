// pages/ModernDashboard.js
import React from 'react';
import { ChevronRight, FileText, PenTool, Eye, Shield, Link, Users, Upload, User, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const ModernDashboard = ({ onNavigate }) => {
  const { isAuthenticated, isVerified, user, canUsePublicKey } = useAuth();
  const { account } = useWallet();
  const features = [
    {
      id: 'initiate',
      title: 'Create Contract',
      description: 'Upload documents and initiate new digital contracts with cryptographic security',
      icon: FileText,
      gradient: 'from-[#051622] to-[#1ba098]',
      bgGradient: 'from-[#051622]/5 to-[#1ba098]/10',
      borderColor: 'var(--border-primary)',
      stats: 'Multi-party verification'
    },
    {
      id: 'sign',
      title: 'Sign Contract',
      description: 'Digitally sign existing contracts using your wallet with blockchain verification',
      icon: PenTool,
      gradient: 'from-[#1ba098] to-[#deb992]',
      bgGradient: 'from-[#1ba098]/5 to-[#deb992]/10',
      borderColor: 'var(--border-primary)',
      stats: 'Cryptographic signatures'
    },
    {
      id: 'view',
      title: 'My Contracts',
      description: 'View and manage all your contracts with real-time status tracking',
      icon: Eye,
      gradient: 'from-[#deb992] to-[#051622]',
      bgGradient: 'from-[#deb992]/5 to-[#051622]/10',
      borderColor: 'var(--border-primary)',
      stats: 'Immutable records'
    }
  ];

  const stats = [
    { label: 'Security', value: '256-bit', icon: Shield },
    { label: 'Network', value: 'Substrate', icon: Link },
    { label: 'Parties', value: '3-Party', icon: Users }
  ];

  // Get the appropriate call-to-action based on authentication state
  const getCallToAction = () => {
    if (!isAuthenticated) {
      return {
        text: 'Login to Get Started',
        action: () => onNavigate('login'),
        gradient: 'from-[#051622] to-[#1ba098]',
        icon: User
      };
    }

    if (!isVerified) {
      return {
        text: 'Verify Your Email',
        action: () => onNavigate('login'),
        gradient: 'from-[#deb992] to-[#1ba098]',
        icon: User
      };
    }

    if (!account) {
      return {
        text: 'Connect Your Wallet',
        action: () => {}, // Wallet connection handled by navbar
        gradient: 'from-[#1ba098] to-[#051622]',
        icon: Key
      };
    }

    if (account && !canUsePublicKey(account.address)) {
      return {
        text: 'Add Wallet Address',
        action: () => onNavigate('publicKeys'),
        gradient: 'from-[#1ba098] to-[#deb992]',
        icon: Key
      };
    }

    return {
      text: 'Create Your First Contract',
      action: () => onNavigate('initiate'),
      gradient: 'from-[#051622] to-[#1ba098]',
      icon: FileText
    };
  };

  const callToAction = getCallToAction();

  return (
    <div className="space-y-8" style={{color: 'var(--text-primary)'}}>
      {/* Status Banner */}
      {isAuthenticated && isVerified && (
        <div className="bg-gradient-to-r rounded-2xl p-6" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--border-primary)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--success-bg)'}}>
                <User className="w-6 h-6" style={{color: 'var(--success)'}} />
              </div>
              <div>
                <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h3>
                <div className="flex items-center space-x-4 text-sm" style={{color: 'var(--text-secondary)'}}>
                  <span>✓ Email verified</span>
                  {account ? (
                    canUsePublicKey(account.address) ? (
                      <span>✓ Wallet connected & registered</span>
                    ) : (
                      <span style={{color: 'var(--warning)'}}>⚠ Wallet not registered</span>
                    )
                  ) : (
                    <span style={{color: 'var(--warning)'}}>⚠ Wallet not connected</span>
                  )}
                </div>
              </div>
            </div>
            {account && !canUsePublicKey(account.address) && (
              <button
                onClick={() => onNavigate('publicKeys')}
                className="px-4 py-2 rounded-xl font-medium transition-colors hover:opacity-80"
                style={{backgroundColor: 'var(--success)', color: 'var(--text-primary)', borderColor: 'var(--border-primary)', border: '1px solid'}}
              >
                Add Wallet Address
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden glass-card-dark rounded-3xl p-8 md:p-12">
        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(to right, var(--text-primary), var(--success), var(--border-primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Digitally Notarized Contracts
              </span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              Secure, transparent, and immutable contract management powered by blockchain technology. 
              Experience the future of digital agreements.
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center space-x-3 backdrop-blur-sm rounded-2xl px-6 py-3" style={{backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)'}}>
                    <Icon className="w-5 h-5" style={{color: 'var(--success)'}} />
                    <div className="text-left">
                      <div className="font-bold" style={{color: 'var(--text-primary)'}}>{stat.value}</div>
                      <div className="text-sm" style={{color: 'var(--text-tertiary)'}}>{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={callToAction.action}
              className="px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              style={{background: 'linear-gradient(to right, var(--accent-dark), var(--success))', color: 'var(--text-primary)', border: '1px solid var(--border-primary)'}}
            >
              <callToAction.icon className="w-5 h-5" />
              <span>{callToAction.text}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{background: 'linear-gradient(to bottom right, var(--success-bg), var(--warning-bg))'}}></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl" style={{background: 'linear-gradient(to top right, var(--warning-bg), var(--success-bg))'}}></div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="group relative overflow-hidden glass-card-dark rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              style={{border: '1px solid var(--border-primary)', background: 'linear-gradient(to bottom right, var(--bg-card), var(--bg-secondary))', animationDelay: `${index * 0.1}s`}}
              onClick={() => onNavigate(feature.id)}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, var(--accent-dark), var(--success))'}}>
                  <Icon className="w-6 h-6" style={{color: 'var(--text-primary)'}} />
                </div>
                
                <h3 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>{feature.title}</h3>
                <p className="mb-4 leading-relaxed" style={{color: 'var(--text-secondary)'}}>{feature.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{color: 'var(--text-tertiary)'}}>{feature.stats}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-200" style={{color: 'var(--text-muted)'}} />
                </div>
              </div>
              
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-20 h-20 border border-current rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border border-current rounded-full"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Section */}
      <div className="glass-card-dark rounded-3xl p-8 shadow-sm" style={{border: '1px solid var(--border-primary)'}}>
        <h2 className="text-2xl font-bold text-center mb-8" style={{color: 'var(--text-primary)'}}>How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload & Create',
              description: 'Upload your contract document and specify the three parties (First Party, Second Party, and Notary)',
              icon: Upload
            },
            {
              step: '02', 
              title: 'Sign & Verify',
              description: 'Each party signs the contract using their wallet. Every signature is cryptographically verified',
              icon: PenTool
            },
            {
              step: '03',
              title: 'Blockchain Storage',
              description: 'The contract and signatures are permanently stored on the blockchain for immutable record-keeping',
              icon: Shield
            }
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{background: 'linear-gradient(to bottom right, var(--bg-hover), var(--bg-card))'}}>
                    <Icon className="w-8 h-8" style={{color: 'var(--text-secondary)'}} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{background: 'linear-gradient(to bottom right, var(--success), var(--border-primary))', color: 'var(--text-primary)'}}>
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;