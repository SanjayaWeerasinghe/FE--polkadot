// components/ModernNavbar.js - Final Version for Your Blockchain DNC System
import React, { useState, useRef, useEffect } from 'react';
import { FileText, PenTool, Eye, Wallet, Shield, Globe, ChevronDown, LogOut, RefreshCw, User, Key, Settings } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

const ModernNavbar = ({ currentPage, onNavigate, account, onStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { accounts, connectWallet, switchAccount, disconnectWithGuidance, connecting, disconnecting } = useWallet();
  const { user, isAuthenticated, isVerified, logout } = useAuth();
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const navItems = [
    { id: 'menu', label: 'Dashboard', icon: Globe },
    { id: 'initiate', label: 'Create Contract', icon: FileText },
    { id: 'sign', label: 'Sign Contract', icon: PenTool },
    { id: 'view', label: 'My Contracts', icon: Eye }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWalletDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle wallet switch
  const handleSwitchAccount = async (newAccount) => {
    try {
      await switchAccount(newAccount);
      setIsWalletDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch account:', error);
    }
  };

  // Handle disconnect with guidance
  const handleDisconnect = async () => {
    try {
      setIsWalletDropdownOpen(false);
      await disconnectWithGuidance(onStatus);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      if (onStatus) {
        onStatus('❌ Failed to disconnect wallet', 'error');
      }
    }
  };

  // Handle connect wallet
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      await logout();
      if (onStatus) {
        onStatus('Successfully logged out', 'success');
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      if (onStatus) {
        onStatus('Failed to logout', 'error');
      }
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  BlockchainDNC
                </h1>
                <p className="text-xs text-gray-500">Digital Notarized Contracts</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User and Wallet Status */}
          <div className="flex items-center space-x-4">
            {/* User Authentication Status */}
            {isAuthenticated && isVerified ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-3 py-2 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-purple-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-2 py-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('publicKeys');
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <Key className="w-4 h-4 text-gray-500" />
                        <span>Manage Keys</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {account ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  disabled={connecting || disconnecting}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-2 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {account.meta?.name || 'Account'}
                    </span>
                    <span className="text-xs text-green-600 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-green-600 transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Wallet Dropdown */}
                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    {/* Current Account Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{account.meta?.name || 'Current Account'}</p>
                          <p className="text-xs text-gray-500 font-mono break-all">{account.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account List */}
                    {accounts.length > 1 && (
                      <>
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Switch Account</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {accounts.filter(acc => acc.address !== account.address).map((acc) => (
                            <button
                              key={acc.address}
                              onClick={() => handleSwitchAccount(acc)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{acc.meta?.name || 'Account'}</p>
                                <p className="text-xs text-gray-500 font-mono">
                                  {acc.address.slice(0, 10)}...{acc.address.slice(-10)}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 mt-2"></div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="px-2 py-2 space-y-1">
                      <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${connecting ? 'animate-spin' : ''}`} />
                        <span>{connecting ? 'Refreshing...' : 'Refresh Accounts'}</span>
                      </button>
                      
                      <button
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{disconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={connecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 text-sm"
              >
                {connecting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              {/* Mobile User Authentication */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated && isVerified ? (
                  <>
                    {/* Current User Info */}
                    <div className="px-3 py-2 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Actions */}
                    <div className="space-y-1 mb-2">
                      <button
                        onClick={() => {
                          onNavigate('publicKeys');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <Key className="w-4 h-4 text-gray-500" />
                        <span>Manage Keys</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 mb-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Mobile Wallet Management */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {account ? (
                  <>
                    {/* Current Account Info */}
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{account.meta?.name || 'Current Account'}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {account.address.slice(0, 8)}...{account.address.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Switch Account Options */}
                    {accounts.length > 1 && (
                      <>
                        <div className="px-3 py-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Switch Account</p>
                        </div>
                        {accounts.filter(acc => acc.address !== account.address).map((acc) => (
                          <button
                            key={acc.address}
                            onClick={() => {
                              handleSwitchAccount(acc);
                              setIsMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{acc.meta?.name || 'Account'}</p>
                              <p className="text-xs text-gray-500 font-mono">
                                {acc.address.slice(0, 8)}...{acc.address.slice(-8)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    
                    {/* Mobile Wallet Actions */}
                    <div className="space-y-1 mt-2">
                      <button
                        onClick={() => {
                          handleConnect();
                          setIsMenuOpen(false);
                        }}
                        disabled={connecting}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${connecting ? 'animate-spin' : ''}`} />
                        <span>{connecting ? 'Refreshing...' : 'Refresh Accounts'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleDisconnect();
                        }}
                        disabled={disconnecting}
                        className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{disconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleConnect();
                      setIsMenuOpen(false);
                    }}
                    disabled={connecting}
                    className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {connecting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ModernNavbar;