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
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      stats: 'Multi-party verification'
    },
    {
      id: 'sign',
      title: 'Sign Contract',
      description: 'Digitally sign existing contracts using your wallet with blockchain verification',
      icon: PenTool,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      stats: 'Cryptographic signatures'
    },
    {
      id: 'view',
      title: 'My Contracts',
      description: 'View and manage all your contracts with real-time status tracking',
      icon: Eye,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
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
        gradient: 'from-purple-600 to-pink-600',
        icon: User
      };
    }

    if (!isVerified) {
      return {
        text: 'Verify Your Email',
        action: () => onNavigate('login'),
        gradient: 'from-yellow-600 to-orange-600',
        icon: User
      };
    }

    if (!account) {
      return {
        text: 'Connect Your Wallet',
        action: () => {}, // Wallet connection handled by navbar
        gradient: 'from-green-600 to-teal-600',
        icon: Key
      };
    }

    if (account && !canUsePublicKey(account.address)) {
      return {
        text: 'Add Wallet Address',
        action: () => onNavigate('publicKeys'),
        gradient: 'from-blue-600 to-indigo-600',
        icon: Key
      };
    }

    return {
      text: 'Create Your First Contract',
      action: () => onNavigate('initiate'),
      gradient: 'from-blue-600 to-purple-600',
      icon: FileText
    };
  };

  const callToAction = getCallToAction();

  return (
    <div className="space-y-8">
      {/* Status Banner */}
      {isAuthenticated && isVerified && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h3>
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <span>✓ Email verified</span>
                  {account ? (
                    canUsePublicKey(account.address) ? (
                      <span>✓ Wallet connected & registered</span>
                    ) : (
                      <span className="text-yellow-700">⚠ Wallet not registered</span>
                    )
                  ) : (
                    <span className="text-yellow-700">⚠ Wallet not connected</span>
                  )}
                </div>
              </div>
            </div>
            {account && !canUsePublicKey(account.address) && (
              <button
                onClick={() => onNavigate('publicKeys')}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Add Wallet Address
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl p-8 md:p-12 border border-gray-200/50">
        <div className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Digital Notarized Contracts
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Secure, transparent, and immutable contract management powered by blockchain technology. 
              Experience the future of digital agreements.
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-200/50">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={callToAction.action}
              className={`bg-gradient-to-r ${callToAction.gradient} text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2`}
            >
              <callToAction.icon className="w-5 h-5" />
              <span>{callToAction.text}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className={`group relative overflow-hidden bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-6 border ${feature.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1`}
              onClick={() => onNavigate(feature.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{feature.stats}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
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
      <div className="bg-white rounded-3xl p-8 border border-gray-200/50 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
        
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
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;