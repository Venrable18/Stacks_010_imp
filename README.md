# VEN Token (VT) - SIP-010 Fungible Token

A fully compliant SIP-010 fungible token deployed on the Stacks blockchain. VEN Token is a utility token with comprehensive features including minting, transferring, and metadata retrieval.

##  Token Information

| Property | Value |
|----------|-------|
| **Token Name** | VEN Token |
| **Symbol** | VT |
| **Decimals** | 18 |
| **Standard** | SIP-010 |
| **Max Supply** | 1,000,000,000,000,000 (1 Quadrillion) |
| **Clarity Version** | 3 |
| **Epoch** | 3.2 |

##  Deployment Details

### Testnet Deployment

**Network:** Stacks Testnet  
**Deployed At:** October 26, 2025  
**Deployer Address:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E`  
**RPC Endpoint:** https://api.testnet.hiro.so  

#### Contract Addresses
- **ft-trait Contract:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.ft-trait`
- **SIP_010 Token Contract:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010`

#### Deployment Costs
- **ft-trait:** 8,130 microSTX
- **SIP_010:** 22,720 microSTX
- **Total Cost:** 0.030850 STX
- **Deployment Duration:** 1 block

### Deployment Configuration

```yaml
Network: testnet
Stacks Node: https://api.testnet.hiro.so
Bitcoin Node: http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332
Clarity Version: 3
Epoch: 3.2
Anchor Block Only: true
```

## 🏗️ Contract Architecture

### Core Contracts

1. **ft-trait.clar** - SIP-010 trait definition
2. **SIP_010.clar** - Main token contract implementing the trait

### Contract Features

- ✅ **SIP-010 Compliant** - Fully implements the SIP-010 standard
- ✅ **Minting** - Contract owner can mint new tokens
- ✅ **Transfer** - Standard and custom transfer functions
- ✅ **Metadata** - Token name, symbol, decimals, and URI support
- ✅ **Security** - Input validation and authorization checks
- ✅ **Error Handling** - Comprehensive error codes and messages

## 📝 Contract Functions

### Read-Only Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `get-name` | Returns token name | `(response (string-ascii 32) uint)` |
| `get-symbol` | Returns token symbol | `(response (string-ascii 32) uint)` |
| `get-decimals` | Returns decimal places | `(response uint uint)` |
| `get-balance` | Returns balance of an address | `(response uint uint)` |
| `get-total-supply` | Returns total token supply | `(response uint uint)` |
| `get-token-uri` | Returns token metadata URI | `(response (optional (string-utf8 256)) uint)` |

### Public Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `transfer` | Transfer tokens (SIP-010) | `amount`, `sender`, `recipient` | `(response bool uint)` |
| `transfer-token` | Transfer tokens (helper) | `amount`, `recipient` | `(response bool uint)` |
| `mint` | Mint new tokens (owner only) | `amount`, `recipient` | `(response bool uint)` |

### Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 100 | `ERR_UNAUTHORIZED` | Unauthorized operation |
| 101 | `ERR_INVALID_AMOUNT` | Invalid amount (e.g., zero) |
| 102 | `ERR_NOT_TOKEN_OWNER` | Not the token owner |
| 103 | `ERR_INSUFFICIENT_BALANCE` | Insufficient balance |

##  Testing

The contract includes comprehensive test coverage with 13 test cases:

### Test Results
```
✓ SIP-010 Token Tests (11 tests) - 202ms
✓ FT Trait Tests (2 tests) - 34ms
Total: 13 tests passed
```

### Test Coverage
- ✅ Token metadata retrieval
- ✅ Balance and supply queries
- ✅ Minting functionality
- ✅ Transfer operations
- ✅ Authorization checks
- ✅ Error handling
- ✅ Edge cases

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:report
```

## 🔧 Development Setup

### Prerequisites
- [Clarinet](https://docs.hiro.so/clarinet) - Clarity development environment
- [Node.js](https://nodejs.org/) - For running tests
- [Git](https://git-scm.com/) - Version control

### Installation

```bash
# Clone the repository
git clone https://github.com/Venrable18/Stacks_010_imp.git
cd Stacks_010_imp

# Install dependencies
npm install

# Check contracts
clarinet check

# Run tests
npm test
```

### Project Structure

```
Stacks_010_imp/
├── contracts/
│   ├── ft-trait.clar          # SIP-010 trait definition
│   └── SIP_010.clar           # Main token contract
├── tests/
│   ├── SIP_010.test.ts        # Comprehensive test suite
│   └── ft-trait.test.ts       # Trait tests
├── settings/
│   ├── Devnet.toml            # Devnet configuration
│   ├── Mainnet.toml           # Mainnet configuration
│   └── Testnet.toml           # Testnet configuration
├── deployments/
│   └── default.testnet-plan.yaml  # Deployment plan
├── types/
│   └── simnet.d.ts            # TypeScript definitions
├── Clarinet.toml              # Project configuration
├── package.json               # Node.js dependencies
├── vitest.config.js           # Test configuration
└── README.md                  # This file
```

##  Security Features

- **Input Validation** - All user inputs are validated
- **Authorization Checks** - Only authorized users can perform restricted operations
- **Standard Compliance** - Follows SIP-010 security best practices
- **Principal Validation** - Ensures recipients are valid Stacks addresses
- **Amount Validation** - Prevents zero and negative amount transfers

##  Usage Examples

### Interacting with the Contract

#### Using Clarinet Console

```clarity
;; Get token information
(contract-call? .SIP_010 get-name)
(contract-call? .SIP_010 get-symbol)
(contract-call? .SIP_010 get-decimals)

;; Check balance
(contract-call? .SIP_010 get-balance 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E)

;; Mint tokens (owner only)
(contract-call? .SIP_010 mint u1000000 'ST1RECIPIENT_ADDRESS)

;; Transfer tokens
(contract-call? .SIP_010 transfer u100 tx-sender 'ST1RECIPIENT_ADDRESS)
```

#### Using Stacks.js

```javascript
import { contractCall, StandardPrincipalCV, UIntCV } from '@stacks/transactions';

// Transfer tokens
const txOptions = {
  contractAddress: 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E',
  contractName: 'SIP_010',
  functionName: 'transfer',
  functionArgs: [
    UIntCV(1000),
    StandardPrincipalCV('STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E'),
    StandardPrincipalCV('ST1RECIPIENT_ADDRESS')
  ],
  senderKey: 'your-private-key',
  network: 'testnet'
};

const transaction = await contractCall(txOptions);
```

##  Roadmap

- [ ] **Mainnet Deployment** - Deploy to Stacks mainnet
- [ ] **Web Interface** - Build user-friendly web interface
- [ ] **Token Bridge** - Cross-chain bridge functionality
- [ ] **Governance** - Community governance features
- [ ] **Staking** - Token staking mechanisms
- [ ] **Integration** - DeFi protocol integrations

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

- **Documentation:** [Stacks Documentation](https://docs.stacks.co/)
- **Discord:** [Stacks Discord](https://discord.gg/stacks)
- **Issues:** [GitHub Issues](https://github.com/Venrable18/Stacks_010_imp/issues)

##  Acknowledgments

- [Stacks Foundation](https://stacks.org/) - For the blockchain platform
- [Hiro](https://hiro.so/) - For development tools (Clarinet, API)
- [SIP-010](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md) - Fungible token standard

---
