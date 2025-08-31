// components/ModernContractForm.js
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, FileText, Shield, AlertCircle, CheckCircle, User, ChevronDown, UserCheck, Search, Star, Clock, RefreshCw } from 'lucide-react';
import ModernFileUpload from './FileUpload';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

// Enhanced User Option Component
const UserOption = ({ user, onSelect, onToggleFavorite, isFavorite, isSelected }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent selection when clicking favorite
    onToggleFavorite();
  };

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0`}
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: isSelected ? 'var(--success-bg)' : 'transparent'
      }}
      onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = 'transparent')}
      onClick={onSelect}
    >
      {/* Online Status */}
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{backgroundColor: user.isOnline ? 'var(--success)' : 'var(--text-muted)'}}
      ></div>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium truncate" style={{color: 'var(--text-primary)'}}>{user.name}</span>
          {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
        </div>
        <div className="text-xs truncate" style={{color: 'var(--text-secondary)'}}>{user.email}</div>
        <div className="text-xs font-mono truncate" style={{color: 'var(--text-tertiary)'}}>
          {user.primaryAddress.slice(0, 8)}...{user.primaryAddress.slice(-8)}
        </div>
      </div>
      
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="p-1 rounded-lg transition-colors flex-shrink-0 hover:opacity-80"
        style={{color: isFavorite ? 'var(--warning)' : 'var(--text-muted)'}}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

const ModernContractForm = ({ 
  onBack, 
  onSubmit, 
  account, 
  loading = false,
  initialData = {},
  onFileValidate = null // Optional file validation function
}) => {
  const { user, publicKeys } = useAuth();
  const [fileInfo, setFileInfo] = useState(null);
  const [fileValidationState, setFileValidationState] = useState({
    validating: false,
    error: null,
    exists: false
  });
  
  // Enhanced form data with party role selection
  const [formData, setFormData] = useState({
    contractName: '',
    initiatorRole: 'firstParty', // Which party role the initiator takes
    firstParty: '',
    secondParty: '',
    thirdParty: '',
    metadata: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({
    firstParty: false,
    secondParty: false,
    thirdParty: false
  });
  const [searchTerms, setSearchTerms] = useState({
    firstParty: '',
    secondParty: '',
    thirdParty: ''
  });
  const [selectedUserIndex, setSelectedUserIndex] = useState({
    firstParty: -1,
    secondParty: -1,
    thirdParty: -1
  });
  
  // Refs for keyboard navigation
  const searchInputRefs = useRef({
    firstParty: null,
    secondParty: null,
    thirdParty: null
  });
  
  // Get primary wallet address for current user
  const currentUserAddress = publicKeys.length > 0 ? publicKeys[0] : account?.address || '';
  
  // Initialize form with correct addresses based on initiator role
  useEffect(() => {
    if (currentUserAddress) {
      setFormData(prev => ({
        ...prev,
        [prev.initiatorRole]: currentUserAddress
      }));
    }
  }, [currentUserAddress, formData.initiatorRole]);
  
  // Load available users and contacts
  useEffect(() => {
    const loadUsersAndContacts = async () => {
      try {
        setUsersLoading(true);
        console.log('🔄 Loading users and contacts from backend...');
        
        // Load all users and recent contacts in parallel
        const [users, contacts] = await Promise.all([
          userService.getAllUsers(),
          userService.getUserContacts()
        ]);
        
        console.log(`📊 Loaded ${users.length} users and ${contacts.length} recent contacts`);
        setAvailableUsers(users);
        setRecentContacts(contacts.slice(0, 5)); // Show top 5 recent contacts
        
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('contractUserFavorites');
        if (savedFavorites) {
          const favoriteIds = JSON.parse(savedFavorites);
          const favorites = users.filter(user => favoriteIds.includes(user.id));
          setFavoriteUsers(favorites);
        }
        
        if (users.length === 0) {
          console.log('💭 No verified users found - only manual address entry available');
        }
      } catch (error) {
        console.error('❌ Failed to load users and contacts:', error);
        setAvailableUsers([]);
        setRecentContacts([]);
      } finally {
        setUsersLoading(false);
      }
    };
    
    loadUsersAndContacts();
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownStates({ firstParty: false, secondParty: false, thirdParty: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'contractName':
        return value.length < 3 ? 'Contract name must be at least 3 characters' : '';
      case 'firstParty':
      case 'secondParty':
      case 'thirdParty':
        if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1).replace('Party', ' party')} address is required`;
        if (value.length < 47) return 'Invalid Substrate address format';
        
        // Check for duplicate addresses
        const otherParties = [formData.firstParty, formData.secondParty, formData.thirdParty].filter(addr => addr && addr !== value);
        if (otherParties.includes(value)) {
          return 'Each party must have a unique address';
        }
        
        return '';
      default:
        return '';
    }
  };
  
  // Handle initiator role change
  const handleInitiatorRoleChange = (newRole) => {
    const oldRole = formData.initiatorRole;
    const currentAddress = formData[oldRole];
    
    setFormData(prev => ({
      ...prev,
      initiatorRole: newRole,
      [oldRole]: '', // Clear old role
      [newRole]: currentUserAddress // Set new role to current user
    }));
  };
  
  // Handle "As Me" button click
  const handleAsMe = (partyType) => {
    if (formData.initiatorRole !== partyType) {
      handleInitiatorRoleChange(partyType);
    }
  };
  
  // Handle user selection from dropdown
  const handleUserSelect = (partyType, user) => {
    handleInputChange(partyType, user.primaryAddress);
    setDropdownStates(prev => ({ ...prev, [partyType]: false }));
    setSearchTerms(prev => ({ ...prev, [partyType]: '' }));
    setSelectedUserIndex(prev => ({ ...prev, [partyType]: -1 }));
    
    // Add to recent contacts (in production, this would be an API call)
    addToRecentContacts(user);
  };
  
  // Add user to recent contacts
  const addToRecentContacts = (user) => {
    setRecentContacts(prev => {
      const filtered = prev.filter(contact => contact.id !== user.id);
      return [user, ...filtered].slice(0, 5); // Keep max 5 recent
    });
  };
  
  // Toggle user favorite status
  const toggleFavorite = (user) => {
    const isFavorite = favoriteUsers.some(fav => fav.id === user.id);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favoriteUsers.filter(fav => fav.id !== user.id);
    } else {
      newFavorites = [...favoriteUsers, user];
    }
    
    setFavoriteUsers(newFavorites);
    
    // Save to localStorage
    const favoriteIds = newFavorites.map(fav => fav.id);
    localStorage.setItem('contractUserFavorites', JSON.stringify(favoriteIds));
  };
  
  // Handle search input
  const handleSearchChange = (partyType, searchTerm) => {
    setSearchTerms(prev => ({ ...prev, [partyType]: searchTerm }));
    setSelectedUserIndex(prev => ({ ...prev, [partyType]: -1 }));
  };
  
  // Filter users based on search term
  const getFilteredUsers = (partyType) => {
    const searchTerm = searchTerms[partyType].toLowerCase();
    const allUsers = availableUsers.filter(user => user.primaryAddress !== currentUserAddress);
    
    if (!searchTerm) {
      // No search term - return categorized users
      const favorites = favoriteUsers.filter(user => user.primaryAddress !== currentUserAddress);
      const recent = recentContacts.filter(user => 
        user.primaryAddress !== currentUserAddress && 
        !favorites.some(fav => fav.id === user.id)
      );
      const others = allUsers.filter(user => 
        !favorites.some(fav => fav.id === user.id) &&
        !recent.some(rec => rec.id === user.id)
      );
      
      return { favorites, recent, others, hasSearch: false };
    }
    
    // Filter all users by search term
    const filtered = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.primaryAddress.toLowerCase().includes(searchTerm)
    );
    
    return { filtered, hasSearch: true };
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e, partyType) => {
    const { filtered, favorites, recent, others, hasSearch } = getFilteredUsers(partyType);
    const allFilteredUsers = hasSearch ? filtered : [...favorites, ...recent, ...others];
    const currentIndex = selectedUserIndex[partyType];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < allFilteredUsers.length - 1 ? currentIndex + 1 : 0;
      setSelectedUserIndex(prev => ({ ...prev, [partyType]: nextIndex }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allFilteredUsers.length - 1;
      setSelectedUserIndex(prev => ({ ...prev, [partyType]: prevIndex }));
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      e.preventDefault();
      const selectedUser = allFilteredUsers[currentIndex];
      if (selectedUser) {
        handleUserSelect(partyType, selectedUser);
      }
    } else if (e.key === 'Escape') {
      setDropdownStates(prev => ({ ...prev, [partyType]: false }));
      setSelectedUserIndex(prev => ({ ...prev, [partyType]: -1 }));
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = (partyType) => {
    const isOpening = !dropdownStates[partyType];
    setDropdownStates(prev => ({ ...prev, [partyType]: !prev[partyType] }));
    
    if (isOpening) {
      // Focus search input when opening
      setTimeout(() => {
        if (searchInputRefs.current[partyType]) {
          searchInputRefs.current[partyType].focus();
        }
      }, 100);
    } else {
      // Reset search when closing
      setSearchTerms(prev => ({ ...prev, [partyType]: '' }));
      setSelectedUserIndex(prev => ({ ...prev, [partyType]: -1 }));
    }
  };
  
  // Refresh users list
  const refreshUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('🔄 Refreshing users and contacts...');
      const [users, contacts] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserContacts()
      ]);
      setAvailableUsers(users);
      setRecentContacts(contacts.slice(0, 5));
      console.log(`✅ Refreshed ${users.length} users and ${contacts.length} contacts`);
    } catch (error) {
      console.error('❌ Failed to refresh users:', error);
    } finally {
      setUsersLoading(false);
    }
  };
  
  // Get role label
  const getRoleLabel = (partyType) => {
    const labels = {
      firstParty: 'First Party',
      secondParty: 'Second Party', 
      thirdParty: 'Third Party (Notary)'
    };
    return labels[partyType] || partyType;
  };
  
  // Get role description
  const getRoleDescription = (partyType) => {
    const descriptions = {
      firstParty: 'Primary signatory of the contract',
      secondParty: 'Counterparty who agrees to contract terms',
      thirdParty: 'Trusted witness for contract validation'
    };
    return descriptions[partyType] || '';
  };
  
  // Format address display
  const formatUserDisplay = (address) => {
    if (!address) return '';
    const user = availableUsers.find(u => u.primaryAddress === address);
    if (user) {
      return `${user.name} (${formatAddress(address)})`;
    }
    return formatAddress(address);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle file selection with validation
  const handleFileSelect = async (file) => {
    setFileInfo(file);
    setFileValidationState({ validating: false, error: null, exists: false });

    // If no validation function provided, just set the file
    if (!onFileValidate || !file?.hash) {
      return;
    }

    // Start validation
    setFileValidationState(prev => ({ ...prev, validating: true }));
    
    try {
      console.log('🔍 Validating file with hash:', file.hash);
      const validationResult = await onFileValidate(file.hash);
      
      if (validationResult && validationResult.exists) {
        const contractName = validationResult.contract?.contractName || validationResult.contract?.name || 'Unknown Contract';
        setFileValidationState({
          validating: false,
          error: `Contract already exists: "${contractName}"`,
          exists: true
        });
        setErrors(prev => ({ ...prev, file: `This file is already used in contract "${contractName}"` }));
      } else {
        setFileValidationState({
          validating: false,
          error: null,
          exists: false
        });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('❌ File validation error:', error);
      setFileValidationState({
        validating: false,
        error: `Validation failed: ${error.message}`,
        exists: false
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (!fileInfo) {
      newErrors.file = 'Please upload a contract document';
    } else if (fileValidationState.exists) {
      newErrors.file = fileValidationState.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show validation errors
      const allFields = Object.keys(formData);
      const touchedState = {};
      allFields.forEach(field => touchedState[field] = true);
      setTouched(touchedState);
      return;
    }

    // Call parent submit handler with enhanced data
    if (onSubmit) {
      await onSubmit({
        ...formData,
        fileInfo,
        initiatorAddress: currentUserAddress,
        initiatorRole: formData.initiatorRole
      });
    }
  };

  const isFormValid = !Object.values(errors).some(error => error) && 
                     fileInfo && 
                     formData.contractName &&
                     formData.firstParty &&
                     formData.secondParty &&
                     formData.thirdParty &&
                     !fileValidationState.validating &&  // Don't allow submit during validation
                     !fileValidationState.exists;        // Don't allow submit if file exists

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          disabled={loading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}
          >Create New Contract</h1>
          <p style={{color: 'var(--text-secondary)'}}>Upload documents and specify contract parties</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="glass-card-dark rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--success-bg)'}}>
                <FileText className="w-5 h-5" style={{color: 'var(--success)'}} />
              </div>
              <h2 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>Contract Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Contract Name *
                </label>
                <input
                  type="text"
                  value={formData.contractName}
                  onChange={(e) => handleInputChange('contractName', e.target.value)}
                  onBlur={() => handleBlur('contractName')}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    backgroundColor: errors.contractName ? 'var(--error-bg)' : 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    borderColor: errors.contractName ? 'var(--error)' : 'var(--border-subtle)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--success)'}
                  onBlur={(e) => !errors.contractName && (e.target.style.borderColor = 'var(--border-subtle)')}
                  placeholder="Enter a descriptive contract name"
                  disabled={loading}
                />
                {errors.contractName && (
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertCircle className="w-4 h-4" style={{color: 'var(--error)'}} />
                    <span className="text-sm" style={{color: 'var(--error)'}}>{errors.contractName}</span>
                  </div>
                )}
              </div>

              {/* Initiator Role Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                  Your Role in this Contract *
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['firstParty', 'secondParty', 'thirdParty'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleInitiatorRoleChange(role)}
                      className="p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: formData.initiatorRole === role ? 'var(--success)' : 'var(--border-secondary)',
                        backgroundColor: formData.initiatorRole === role ? 'var(--success-bg)' : 'transparent',
                        color: formData.initiatorRole === role ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => formData.initiatorRole !== role && (e.target.style.borderColor = 'var(--warning)')}
                      onMouseLeave={(e) => formData.initiatorRole !== role && (e.target.style.borderColor = 'var(--border-secondary)')}
                      disabled={loading}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">{getRoleLabel(role)}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {role === 'firstParty' ? 'Primary' : role === 'secondParty' ? 'Counter' : 'Notary'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dynamic Party Fields */}
              {['firstParty', 'secondParty', 'thirdParty'].map((partyType) => {
                const isCurrentUser = formData.initiatorRole === partyType;
                return (
                  <div key={partyType}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold" style={{color: 'var(--text-primary)'}}>
                        {getRoleLabel(partyType)} {isCurrentUser ? '(You)' : '*'}
                      </label>
                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => handleAsMe(partyType)}
                          className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-80"
                          style={{backgroundColor: 'var(--success-bg)', color: 'var(--success)'}}
                          disabled={loading}
                        >
                          As Me
                        </button>
                      )}
                    </div>
                    
                    {isCurrentUser ? (
                      /* Current User Field */
                      <div className="relative">
                        <input
                          type="text"
                          value={formData[partyType]}
                          className="w-full px-4 py-3 border rounded-xl pr-12 font-mono text-sm"
                          style={{borderColor: 'var(--success)', backgroundColor: 'var(--success-bg)', color: 'var(--text-primary)'}}
                          disabled
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <UserCheck className="w-5 h-5" style={{color: 'var(--success)'}} />
                        </div>
                      </div>
                    ) : (
                      /* Other Party Field with Dropdown */
                      <div className="relative dropdown-container">
                        <input
                          type="text"
                          value={formData[partyType]}
                          onChange={(e) => handleInputChange(partyType, e.target.value)}
                          onBlur={() => handleBlur(partyType)}
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all font-mono text-sm pr-12"
                          style={{
                            backgroundColor: errors[partyType] ? 'var(--error-bg)' : 'var(--bg-hover)',
                            color: 'var(--text-primary)',
                            borderColor: errors[partyType] ? 'var(--error)' : 'var(--border-subtle)'
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--success)'}
                          onBlur={(e) => !errors[partyType] && (e.target.style.borderColor = 'var(--border-subtle)')}
                          placeholder="Enter address or select user"
                          disabled={loading}
                        />
                        
                        {/* Dropdown Button */}
                        <button
                          type="button"
                          onClick={() => toggleDropdown(partyType)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors hover:opacity-80"
                          style={{color: 'var(--text-tertiary)'}}
                          disabled={loading}
                        >
                          <ChevronDown className={`w-5 h-5 transition-transform ${
                            dropdownStates[partyType] ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {/* Enhanced Dropdown Menu */}
                        {dropdownStates[partyType] && (
                          <div className="absolute z-10 w-full mt-1 glass-card-dark rounded-xl shadow-lg max-h-80 overflow-hidden">
                            {/* Search Header */}
                            <div className="p-3 border-b" style={{borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-hover)'}}>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: 'var(--text-tertiary)'}} />
                                <input
                                  ref={el => searchInputRefs.current[partyType] = el}
                                  type="text"
                                  value={searchTerms[partyType]}
                                  onChange={(e) => handleSearchChange(partyType, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, partyType)}
                                  className="w-full pl-10 pr-10 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                  style={{
                                    backgroundColor: 'var(--bg-hover)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-subtle)'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = 'var(--success)'}
                                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                                  placeholder="Search users..."
                                  disabled={usersLoading}
                                />
                                <button
                                  onClick={refreshUsers}
                                  disabled={usersLoading}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 disabled:opacity-50 hover:opacity-80 transition-colors"
                                  style={{color: 'var(--text-tertiary)'}}
                                  title="Refresh users"
                                >
                                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                            </div>
                            
                            {/* User List */}
                            <div className="max-h-64 overflow-y-auto">
                              {usersLoading ? (
                                <div className="px-4 py-6 text-sm text-center flex items-center justify-center space-x-2" style={{color: 'var(--text-secondary)'}}>
                                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: 'var(--success)'}}></div>
                                  <span>Loading users...</span>
                                </div>
                              ) : (() => {
                                const { filtered, favorites, recent, others, hasSearch } = getFilteredUsers(partyType);
                                const allUsers = hasSearch ? filtered : [...favorites, ...recent, ...others];
                                
                                if (allUsers.length === 0) {
                                  return (
                                    <div className="px-4 py-6 text-sm text-white/70 text-center">
                                      {hasSearch ? (
                                        <div>
                                          <div className="mb-2">No users match "{searchTerms[partyType]}"</div>
                                          <div className="text-xs text-white/50">Try a different search term</div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div className="mb-2">No other users available</div>
                                          <div className="text-xs text-white/50">Enter address manually above</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div>
                                    {hasSearch ? (
                                      /* Search Results */
                                      filtered.map((user, index) => (
                                        <UserOption
                                          key={user.id}
                                          user={user}
                                          onSelect={() => handleUserSelect(partyType, user)}
                                          onToggleFavorite={() => toggleFavorite(user)}
                                          isFavorite={favoriteUsers.some(fav => fav.id === user.id)}
                                          isSelected={selectedUserIndex[partyType] === index}
                                        />
                                      ))
                                    ) : (
                                      /* Categorized Results */
                                      <div>
                                        {favorites.length > 0 && (
                                          <div>
                                            <div className="px-4 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider bg-white/5 border-b border-white/10">
                                              ⭐ Favorites
                                            </div>
                                            {favorites.map((user, index) => (
                                              <UserOption
                                                key={user.id}
                                                user={user}
                                                onSelect={() => handleUserSelect(partyType, user)}
                                                onToggleFavorite={() => toggleFavorite(user)}
                                                isFavorite={true}
                                                isSelected={selectedUserIndex[partyType] === index}
                                              />
                                            ))}
                                          </div>
                                        )}
                                        
                                        {recent.length > 0 && (
                                          <div>
                                            <div className="px-4 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider bg-white/5 border-b border-white/10">
                                              🕐 Recent
                                            </div>
                                            {recent.map((user, index) => (
                                              <UserOption
                                                key={user.id}
                                                user={user}
                                                onSelect={() => handleUserSelect(partyType, user)}
                                                onToggleFavorite={() => toggleFavorite(user)}
                                                isFavorite={favoriteUsers.some(fav => fav.id === user.id)}
                                                isSelected={selectedUserIndex[partyType] === (favorites.length + index)}
                                              />
                                            ))}
                                          </div>
                                        )}
                                        
                                        {others.length > 0 && (
                                          <div>
                                            {(favorites.length > 0 || recent.length > 0) && (
                                              <div className="px-4 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider bg-white/5 border-b border-white/10">
                                                👥 All Users
                                              </div>
                                            )}
                                            {others.map((user, index) => (
                                              <UserOption
                                                key={user.id}
                                                user={user}
                                                onSelect={() => handleUserSelect(partyType, user)}
                                                onToggleFavorite={() => toggleFavorite(user)}
                                                isFavorite={favoriteUsers.some(fav => fav.id === user.id)}
                                                isSelected={selectedUserIndex[partyType] === (favorites.length + recent.length + index)}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            
                            {/* Footer with keyboard shortcuts */}
                            <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-white/70">
                              <div className="flex items-center justify-between">
                                <span>🔍 Type to search • ⭐ Click star to favorite</span>
                                <span>↑↓ Navigate • ⏎ Select • Esc Close</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors[partyType] && (
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertCircle className="w-4 h-4" style={{color: 'var(--error)'}} />
                        <span className="text-sm" style={{color: 'var(--error)'}}>{errors[partyType]}</span>
                      </div>
                    )}
                    
                    <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
                      {isCurrentUser ? 
                        `Your primary wallet: ${formatAddress(currentUserAddress)}` : 
                        getRoleDescription(partyType)
                      }
                    </p>
                  </div>
                );
              })}

              {/* Additional Metadata */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Additional Metadata (Optional)
                </label>
                <textarea
                  value={formData.metadata}
                  onChange={(e) => handleInputChange('metadata', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-subtle)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--success)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  rows="3"
                  placeholder="Additional contract information, terms, or notes..."
                  disabled={loading}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-tertiary)'}}>
                  Optional details that will be stored with the contract
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                style={{background: 'linear-gradient(to right, var(--accent-dark), var(--success))', color: 'var(--text-primary)'}}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Contract...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Create Contract</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Enhanced Party Information Card */}
          <div className="rounded-2xl p-6" style={{background: 'linear-gradient(to bottom right, var(--bg-secondary), var(--success-bg))', border: '1px solid var(--border-secondary)'}}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--success-bg)'}}>
                <Users className="w-5 h-5" style={{color: 'var(--success)'}} />
              </div>
              <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Contract Parties</h3>
            </div>
            
            {/* Current Role Display */}
            <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'var(--bg-hover)'}}>
              <div className="flex items-center space-x-2 mb-1">
                <UserCheck className="w-4 h-4" style={{color: 'var(--success)'}} />
                <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
                  You are the {getRoleLabel(formData.initiatorRole)}
                </span>
              </div>
              <p className="text-xs ml-6" style={{color: 'var(--text-secondary)'}}>
                {getRoleDescription(formData.initiatorRole)}
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              {['firstParty', 'secondParty', 'thirdParty'].map((partyType) => {
                const isYou = formData.initiatorRole === partyType;
                const hasAddress = formData[partyType];
                
                return (
                  <div key={partyType} className="flex items-start space-x-3">
                    <div 
                      className="w-2 h-2 rounded-full mt-2"
                      style={{
                        backgroundColor: partyType === 'firstParty' ? 'var(--accent-primary)' :
                                       partyType === 'secondParty' ? 'var(--warning)' : 'var(--success)'
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium" style={{color: 'var(--text-primary)'}}>
                          {getRoleLabel(partyType)}
                          {isYou && ' (You)'}
                        </p>
                        {hasAddress && (
                          <CheckCircle className="w-3 h-3" style={{color: 'var(--success)'}} />
                        )}
                      </div>
                      <p className="text-xs" style={{color: 'var(--text-secondary)'}}>{getRoleDescription(partyType)}</p>
                      {hasAddress && (
                        <p className="text-xs font-mono mt-1" style={{color: 'var(--text-tertiary)'}}>
                          {formatUserDisplay(formData[partyType])}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* User Stats & Tips */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs" style={{color: 'var(--text-secondary)'}}>
                <span>👥 {availableUsers.length} registered users</span>
                <span>⭐ {favoriteUsers.length} favorites</span>
                <span>🕒 {recentContacts.length} recent</span>
              </div>
              
              <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--bg-hover)'}}>
                <p className="text-xs font-medium mb-1" style={{color: 'var(--text-primary)'}}>💡 Quick Tips:</p>
                <ul className="text-xs space-y-1" style={{color: 'var(--text-secondary)'}}>
                  <li>• Click "As Me" to switch your role in the contract</li>
                  <li>• Search users by name, email, or address</li>
                  <li>• ⭐ Star users to add them to favorites</li>
                  <li>• Recent contacts appear at the top</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - File Upload */}
        <div className="space-y-6">
          <div className="glass-card-dark rounded-2xl p-6 shadow-sm">
            <ModernFileUpload
              onFileSelect={handleFileSelect}
              fileInfo={fileInfo}
              disabled={loading || fileValidationState.validating}
              accept=".pdf,.doc,.docx,.txt"
              maxSize={10 * 1024 * 1024}
              title="Contract Document"
              description="Upload your contract document"
            />
            
            {/* File validation feedback */}
            {fileValidationState.validating && (
              <div className="mt-3 p-3 rounded-lg" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)'}}>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: 'var(--success)'}}></div>
                  <span className="text-sm text-white/70">Checking if file already exists on blockchain...</span>
                </div>
              </div>
            )}
            
            {fileValidationState.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{fileValidationState.error}</span>
                </div>
              </div>
            )}
            
            {fileInfo && !fileValidationState.validating && !fileValidationState.error && (
              <div className="mt-3 p-3 rounded-lg" style={{backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)'}}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: 'var(--success)'}} />
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>✅ File is unique and ready for contract creation</span>
                </div>
              </div>
            )}
            {errors.file && (
              <div className="flex items-center space-x-2 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">{errors.file}</span>
              </div>
            )}
          </div>

          {/* Contract Preview */}
          {fileInfo && isFormValid && (
            <div className="rounded-2xl p-6" style={{background: 'linear-gradient(to bottom right, var(--success-bg), var(--warning-bg))', border: '1px solid var(--border-primary)'}}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--success-bg)'}}>
                  <CheckCircle className="w-5 h-5" style={{color: 'var(--success)'}} />
                </div>
                <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Contract Preview</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Contract Name:</span>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{formData.contractName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Document:</span>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{fileInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>File Size:</span>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{(fileInfo.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Your Role:</span>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{getRoleLabel(formData.initiatorRole)}</p>
                  </div>
                </div>
                <div className="pt-3 border-t" style={{borderColor: 'var(--border-secondary)'}}>
                  <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Document Hash:</span>
                  <div className="text-xs font-mono mt-1 break-all p-2 rounded" style={{color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-hover)'}}>
                    {fileInfo.hash}
                  </div>
                </div>
                {formData.metadata && (
                  <div className="pt-2">
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Metadata:</span>
                    <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>{formData.metadata}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="rounded-2xl p-6" style={{background: 'var(--warning-bg)', border: '1px solid var(--border-secondary)'}}>
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
              <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Security Notice</h3>
            </div>
            <div className="space-y-2 text-sm" style={{color: 'var(--text-secondary)'}}>
              <p>• Your document will be hashed using SHA-256</p>
              <p>• Only the hash is stored on-chain, not the document</p>
              <p>• All parties must sign with their private keys</p>
              <p>• Contract data is immutable once created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernContractForm;