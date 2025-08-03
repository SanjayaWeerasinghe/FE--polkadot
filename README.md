# Digital Notarized Contracts

A React-based frontend application for managing digital contracts on a Substrate blockchain. This application provides a secure, transparent, and immutable platform for three-party contract management with cryptographic verification.

## 🎯 Features

### Core Functionality
- **Contract Initiation**: Upload documents and create contracts with three parties
- **Digital Signing**: Cryptographically sign contracts using Polkadot.js wallet
- **Contract Management**: View and manage all your contracts
- **File Integrity**: SHA256 hashing ensures document authenticity
- **Multi-Party Verification**: Support for First Party, Second Party, and Notary

### Security Features
- **Blockchain-based**: Immutable storage on Substrate
- **Cryptographic Signatures**: Polkadot.js wallet integration
- **Access Control**: Only authorized parties can interact with contracts
- **Hash Verification**: Document integrity through SHA256 hashing

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── Header.js
│   ├── WalletStatus.js
│   ├── MainMenu.js
│   ├── StatusMessage.js
│   ├── LoadingSpinner.js
│   ├── FileUpload.js
│   └── ErrorBoundary.js
├── contexts/           # React Context providers
│   ├── BlockchainContext.js
│   └── WalletContext.js
├── pages/              # Main application pages
│   ├── InitiateContract.js
│   ├── SignContract.js
│   └── ViewContracts.js
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles with Tailwind
```

### Technology Stack
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Polkadot.js**: Blockchain and wallet integration
- **Substrate**: Blockchain platform

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Polkadot.js browser extension
- Running Substrate node with your contract pallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-notarized-contracts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Tailwind CSS** (if not already done)
   ```bash
   npx tailwindcss init -p
   ```

4. **Start your Substrate node**
   ```bash
   # In your Substrate project directory
   ./target/release/solochain-template-node --dev
   ```

5. **Start the React application**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

The application connects to your local Substrate node at:
- Primary: `ws://127.0.0.1:9944`
- Fallback: `ws://localhost:9944`

Make sure your node is running and accessible.

## 📱 Usage

### 1. Connect Wallet
- Install the Polkadot.js browser extension
- Create or import an account
- Click "Connect Polkadot Wallet" in the application

### 2. Initiate a Contract
- Click "Initiate Contract" from the main menu
- Upload your contract document (PDF, DOC, TXT)
- Enter contract name and three party addresses
- Sign the transaction to create the contract

### 3. Sign a Contract
- Click "Sign Contract" from the main menu
- Upload the same document used to create the contract
- The system verifies the contract exists
- Sign the document hash with your wallet
- Submit the signature to the blockchain

### 4. View Your Contracts
- Click "Check Your Contracts" from the main menu
- Load all contracts you're involved in
- View contract details and status
- Sign or deactivate contracts as needed

## 🔧 Configuration

### Blockchain Configuration
Edit `src/contexts/BlockchainContext.js` to modify:
- Blockchain endpoints
- Connection retry logic
- Error handling

### Wallet Configuration
Edit `src/contexts/WalletContext.js` to modify:
- Supported extensions
- Account management
- Signing behavior

### Styling Configuration
Edit `tailwind.config.js` to customize:
- Color schemes
- Animations
- Component styles

## 🎨 UI Components

### Reusable Components
- **Header**: Application title and branding
- **WalletStatus**: Connection status and account switcher
- **MainMenu**: Navigation cards for main features
- **StatusMessage**: Success/error message display
- **LoadingSpinner**: Loading states and progress indicators
- **FileUpload**: Drag-and-drop file upload with hash calculation
- **ErrorBoundary**: Error handling and fallback UI

### Page Components
- **InitiateContract**: Create new contracts
- **SignContract**: Sign existing contracts
- **ViewContracts**: List and manage contracts

## 🔐 Security Considerations

### File Handling
- Client-side SHA256 hash calculation
- File size limits (10MB)
- Type validation
- No file content stored on blockchain

### Wallet Integration
- Secure signature verification
- Transaction confirmation prompts
- Account validation
- Error boundary protection

### Blockchain Integration
- Connection encryption (WSS in production)
- Transaction status monitoring
- Error handling and recovery
- Access control validation

## 🛠️ Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run test suite
- `npm eject`: Eject from Create React App

### Code Style
- ES6+ JavaScript
- Functional components with hooks
- Tailwind CSS for styling
- Context API for state management

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Build and Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create a `.env` file for production:
```env
REACT_APP_BLOCKCHAIN_WS=wss://your-node-endpoint
REACT_APP_NETWORK_NAME=your-network-name
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Container**: Docker with nginx
- **CDN**: AWS CloudFront, Cloudflare

## 🧪 Testing

### Unit Tests
- Component rendering tests
- Context provider tests
- Utility function tests

### Integration Tests
- Wallet connection flow
- Blockchain interaction
- File upload and processing

### E2E Tests
- Complete user workflows
- Contract creation and signing
- Error scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow existing code patterns
- Add proper error handling
- Include appropriate tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
1. **Wallet Connection Failed**
   - Ensure Polkadot.js extension is installed
   - Check if extension is unlocked
   - Verify accounts exist in extension

2. **Blockchain Connection Failed**
   - Confirm Substrate node is running
   - Check WebSocket endpoint
   - Verify node is accessible

3. **Transaction Failed**
   - Check account balance
   - Verify pallet configuration
   - Review transaction parameters

### Getting Help
- Check the [Issues](link-to-issues) section
- Review [Documentation](link-to-docs)
- Join our [Discord](link-to-discord)

## 🔮 Roadmap

### Upcoming Features
- [ ] Contract templates
- [ ] Multi-signature support
- [ ] Document encryption
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Advanced search and filtering
- [ ] Contract analytics
- [ ] API integration

### Performance Improvements
- [ ] Lazy loading
- [ ] Caching strategies
- [ ] Bundle optimization
- [ ] Progressive Web App features

## 🙏 Acknowledgments

- Polkadot.js team for excellent developer tools
- Substrate community for blockchain framework
- React team for the amazing frontend library
- Tailwind CSS for the utility-first approach