# UsageMe.md - FT Trait Usage Guide

A comprehensive guide on how to use the deployed ft-trait.clar contract and work with SIP-010 compliant tokens.

## 🎯 Trait Contract Information

**Trait Contract:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.ft-trait`  
**Example Implementation:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010`  
**Network:** Stacks Testnet  
**Standard:** SIP-010 Fungible Token Interface  

## 🔧 What is ft-trait?

The `ft-trait` is not a token itself, but a **trait definition** that defines the interface for SIP-010 compliant tokens. Think of it as a contract template that ensures all fungible tokens follow the same standard.

## 🏗️ Quick Start

### 1. Understanding the Trait Interface

The ft-trait defines these required functions for all SIP-010 tokens:

```clarity
(define-trait ft-trait
  (
    ;; Transfer tokens from sender to recipient
    (transfer (uint principal principal) (response bool uint))
    ;; Get the human readable name of the token
    (get-name () (response (string-ascii 32) uint))
    ;; Get the ticker symbol
    (get-symbol () (response (string-ascii 32) uint))
    ;; Get the number of decimals
    (get-decimals () (response uint uint))
    ;; Get balance of a principal
    (get-balance (principal) (response uint uint))
    ;; Get the current total supply
    (get-total-supply () (response uint uint))
    ;; Get optional token metadata URI
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)
```

### 2. Using Clarinet Console

```bash
# Start Clarinet console
clarinet console

# Import the trait
(use-trait ft-trait .ft-trait.ft-trait)
```

##  For Token Developers - Implementing the Trait

### Creating a New SIP-010 Token

```clarity
;; Import and implement the trait
(use-trait ft-trait .ft-trait.ft-trait)
(impl-trait .ft-trait.ft-trait)

;; Define your fungible token
(define-fungible-token my-token u1000000000)

;; Implement ALL required trait functions
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u100))
    (ft-transfer? my-token amount sender recipient)
  )
)

(define-read-only (get-name)
  (ok "My Token")
)

(define-read-only (get-symbol)
  (ok "MTK")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance my-token account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply my-token))
)

(define-read-only (get-token-uri)
  (ok none)
)
```

## 🛠️ For DApp Developers - Using the Trait

### Generic Token Functions

```clarity
;; Function that works with ANY SIP-010 token
(use-trait ft-trait .ft-trait.ft-trait)

(define-public (generic-transfer 
  (token-contract <ft-trait>) 
  (amount uint) 
  (sender principal) 
  (recipient principal))
  (contract-call? token-contract transfer amount sender recipient)
)

;; Get info from any SIP-010 token
(define-read-only (get-token-info (token-contract <ft-trait>))
  (let (
    (name (unwrap! (contract-call? token-contract get-name) (err u404)))
    (symbol (unwrap! (contract-call? token-contract get-symbol) (err u404)))
    (decimals (unwrap! (contract-call? token-contract get-decimals) (err u404)))
  )
  (ok { name: name, symbol: symbol, decimals: decimals }))
)

;; Example usage with VEN Token
(generic-transfer .SIP_010 u1000 tx-sender 'ST1RECIPIENT)
(get-token-info .SIP_010)
```

### Token Registry Contract

```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-map registered-tokens principal {
  name: (string-ascii 32),
  symbol: (string-ascii 32),
  decimals: uint
})

(define-public (register-token (token <ft-trait>))
  (let (
    (token-principal (contract-of token))
    (name (unwrap! (contract-call? token get-name) (err u400)))
    (symbol (unwrap! (contract-call? token get-symbol) (err u401)))
    (decimals (unwrap! (contract-call? token get-decimals) (err u402)))
  )
  (begin
    ;; Verify token implements all functions correctly
    (unwrap! (contract-call? token get-total-supply) (err u403))
    (unwrap! (contract-call? token get-token-uri) (err u404))
    
    ;; Register the token
    (map-set registered-tokens token-principal {
      name: name,
      symbol: symbol, 
      decimals: decimals
    })
    (ok token-principal)
  ))
)
```

## 🎨 Practical Examples

### Example 1: Multi-Token Wallet

```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-map user-tokens principal (list 10 principal))

(define-public (add-token-to-wallet (token <ft-trait>))
  (let (
    (token-principal (contract-of token))
    (current-tokens (default-to (list) (map-get? user-tokens tx-sender)))
  )
  (begin
    ;; Verify token is valid SIP-010
    (unwrap! (contract-call? token get-name) (err u400))
    
    ;; Add to user's token list
    (map-set user-tokens tx-sender (unwrap! (as-max-len? (append current-tokens token-principal) u10) (err u401)))
    (ok token-principal)
  ))
)

(define-read-only (get-wallet-tokens (user principal))
  (default-to (list) (map-get? user-tokens user))
)
```

### Example 2: Token Swap Contract

```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-map swap-pairs 
  { token-a: principal, token-b: principal }
  { rate: uint, active: bool }
)

(define-public (create-swap-pair 
  (token-a <ft-trait>) 
  (token-b <ft-trait>) 
  (rate uint))
  (let (
    (pair-key { 
      token-a: (contract-of token-a), 
      token-b: (contract-of token-b) 
    })
  )
  (begin
    ;; Verify both tokens are valid
    (unwrap! (contract-call? token-a get-name) (err u400))
    (unwrap! (contract-call? token-b get-name) (err u401))
    
    ;; Create swap pair
    (map-set swap-pairs pair-key { rate: rate, active: true })
    (ok pair-key)
  ))
)

(define-public (swap-tokens
  (token-a <ft-trait>)
  (token-b <ft-trait>)
  (amount-a uint))
  (let (
    (pair-key { 
      token-a: (contract-of token-a), 
      token-b: (contract-of token-b) 
    })
    (pair-info (unwrap! (map-get? swap-pairs pair-key) (err u404)))
    (amount-b (/ (* amount-a (get rate pair-info)) u100))
  )
  (begin
    ;; Transfer token A from user to contract
    (try! (contract-call? token-a transfer amount-a tx-sender (as-contract tx-sender)))
    
    ;; Transfer token B from contract to user  
    (as-contract (contract-call? token-b transfer amount-b tx-sender tx-sender))
  ))
)
```

### Example 3: Testing SIP-010 Compliance

```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-public (verify-sip010-compliance (token <ft-trait>))
  (let (
    (name-result (contract-call? token get-name))
    (symbol-result (contract-call? token get-symbol))  
    (decimals-result (contract-call? token get-decimals))
    (supply-result (contract-call? token get-total-supply))
    (balance-result (contract-call? token get-balance tx-sender))
    (uri-result (contract-call? token get-token-uri))
  )
  (begin
    ;; Verify all functions work
    (unwrap! name-result (err u400))
    (unwrap! symbol-result (err u401))
    (unwrap! decimals-result (err u402))
    (unwrap! supply-result (err u403))
    (unwrap! balance-result (err u404))
    (unwrap! uri-result (err u405))
    
    (ok "Token is fully SIP-010 compliant!")
  ))
)

;; Test with VEN Token
(verify-sip010-compliance .SIP_010)
```

## � Frontend Integration with Stacks.js

### Setup

```bash
npm install @stacks/transactions @stacks/network
```

### Generic SIP-010 Token Class

```javascript
import { 
  callReadOnlyFunction,
  makeContractCall,
  standardPrincipalCV,
  uintCV,
  StacksTestnet
} from '@stacks/transactions';

class SIP010Token {
  constructor(contractAddress, contractName, network = new StacksTestnet()) {
    this.contractAddress = contractAddress;
    this.contractName = contractName;
    this.network = network;
  }
  
  // Get token information
  async getInfo() {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.getName(),
      this.getSymbol(), 
      this.getDecimals(),
      this.getTotalSupply()
    ]);
    
    return { name, symbol, decimals, totalSupply };
  }
  
  async getName() {
    return await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-name',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress
    });
  }
  
  async getSymbol() {
    return await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName, 
      functionName: 'get-symbol',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress
    });
  }
  
  async getBalance(address) {
    return await callReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(address)],
      network: this.network,
      senderAddress: this.contractAddress
    });
  }
  
  async transfer(senderKey, amount, recipient) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'transfer',
      functionArgs: [
        uintCV(amount),
        standardPrincipalCV(this.getSenderAddress(senderKey)),
        standardPrincipalCV(recipient)
      ],
      senderKey,
      network: this.network,
      anchorMode: 1
    };
    
    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }
}

// Usage examples
const venToken = new SIP010Token(
  'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E',
  'SIP_010'
);

// Get token info
const info = await venToken.getInfo();
console.log('Token Info:', info);

// Check balance
const balance = await venToken.getBalance('ST1SOME_ADDRESS');
console.log('Balance:', balance);
```

### Multi-Token Portfolio Manager

```javascript
class TokenPortfolio {
  constructor(network = new StacksTestnet()) {
    this.network = network;
    this.tokens = new Map();
  }
  
  // Add any SIP-010 token to portfolio
  async addToken(contractAddress, contractName, alias) {
    const token = new SIP010Token(contractAddress, contractName, this.network);
    
    try {
      // Verify it's a valid SIP-010 token by calling required functions
      await token.getInfo();
      this.tokens.set(alias, token);
      return true;
    } catch (error) {
      console.error(`Token ${alias} is not SIP-010 compliant:`, error);
      return false;
    }
  }
  
  // Get portfolio summary
  async getPortfolioSummary(userAddress) {
    const summary = [];
    
    for (const [alias, token] of this.tokens.entries()) {
      try {
        const [info, balance] = await Promise.all([
          token.getInfo(),
          token.getBalance(userAddress)
        ]);
        
        summary.push({
          alias,
          contractAddress: token.contractAddress,
          contractName: token.contractName,
          ...info,
          balance
        });
      } catch (error) {
        console.error(`Error fetching data for ${alias}:`, error);
      }
    }
    
    return summary;
  }
}

// Usage
const portfolio = new TokenPortfolio();

// Add different SIP-010 tokens
await portfolio.addToken('STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E', 'SIP_010', 'VEN');
await portfolio.addToken('ST1ANOTHER_ADDRESS', 'another-token', 'OTHER');

// Get user's portfolio
const userPortfolio = await portfolio.getPortfolioSummary('ST1USER_ADDRESS');
console.log('Portfolio:', userPortfolio);
```

## 🎮 React Component Examples

### Universal Token Component

```jsx
import React, { useState, useEffect } from 'react';
import { callReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';

const TokenDisplay = ({ contractAddress, contractName, userAddress }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        
        // Fetch all SIP-010 required data
        const [name, symbol, decimals, balance, totalSupply] = await Promise.all([
          callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: 'get-name',
            functionArgs: [],
            network: 'testnet'
          }),
          callReadOnlyFunction({
            contractAddress,
            contractName, 
            functionName: 'get-symbol',
            functionArgs: [],
            network: 'testnet'
          }),
          callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: 'get-decimals', 
            functionArgs: [],
            network: 'testnet'
          }),
          callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: 'get-balance',
            functionArgs: [standardPrincipalCV(userAddress)],
            network: 'testnet'
          }),
          callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: 'get-total-supply',
            functionArgs: [],
            network: 'testnet'
          })
        ]);
        
        setTokenData({
          name: name.value,
          symbol: symbol.value,
          decimals: Number(decimals.value),
          balance: Number(balance.value),
          totalSupply: Number(totalSupply.value)
        });
        
      } catch (err) {
        setError('Token is not SIP-010 compliant or network error');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (contractAddress && contractName && userAddress) {
      fetchTokenData();
    }
  }, [contractAddress, contractName, userAddress]);
  
  if (loading) return <div>Loading token data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tokenData) return <div>No data available</div>;
  
  const formatBalance = (balance, decimals) => {
    return (balance / Math.pow(10, decimals)).toFixed(4);
  };
  
  return (
    <div className="token-card">
      <h3>{tokenData.name} ({tokenData.symbol})</h3>
      <div className="token-details">
        <p><strong>Contract:</strong> {contractAddress}.{contractName}</p>
        <p><strong>Decimals:</strong> {tokenData.decimals}</p>
        <p><strong>Your Balance:</strong> {formatBalance(tokenData.balance, tokenData.decimals)} {tokenData.symbol}</p>
        <p><strong>Total Supply:</strong> {formatBalance(tokenData.totalSupply, tokenData.decimals)} {tokenData.symbol}</p>
      </div>
    </div>
  );
};

// Usage
function App() {
  return (
    <div>
      <h1>My SIP-010 Tokens</h1>
      <TokenDisplay 
        contractAddress="STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E"
        contractName="SIP_010"
        userAddress="ST1USER_ADDRESS"
      />
    </div>
  );
}
```

### Token Validator Hook

```jsx
import { useState, useEffect } from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';

const useSIP010Validator = (contractAddress, contractName) => {
  const [isValid, setIsValid] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const validateToken = async () => {
    setLoading(true);
    setValidationError(null);
    
    try {
      // Test all required SIP-010 functions
      const requiredFunctions = [
        'get-name',
        'get-symbol', 
        'get-decimals',
        'get-balance',
        'get-total-supply',
        'get-token-uri'
      ];
      
      const results = await Promise.all(
        requiredFunctions.map(func => 
          callReadOnlyFunction({
            contractAddress,
            contractName,
            functionName: func,
            functionArgs: func === 'get-balance' 
              ? [standardPrincipalCV(contractAddress)] 
              : [],
            network: 'testnet'
          }).catch(err => ({ error: err.message, function: func }))
        )
      );
      
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        setValidationError(`Missing functions: ${errors.map(e => e.function).join(', ')}`);
        setIsValid(false);
      } else {
        setIsValid(true);
      }
      
    } catch (error) {
      setValidationError(error.message);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (contractAddress && contractName) {
      validateToken();
    }
  }, [contractAddress, contractName]);
  
  return { isValid, validationError, loading, validateToken };
};

// Usage in component
const TokenValidator = ({ contractAddress, contractName }) => {
  const { isValid, validationError, loading } = useSIP010Validator(contractAddress, contractName);
  
  if (loading) return <span>Validating...</span>;
  
  return (
    <div className={`validation-badge ${isValid ? 'valid' : 'invalid'}`}>
      {isValid ? (
        <span>✅ SIP-010 Compliant</span>
      ) : (
        <span>❌ Not SIP-010 Compliant: {validationError}</span>
      )}
    </div>
  );
};
```

## � Testing Your SIP-010 Implementation

### Trait Compliance Test Suite

```clarity
;; Complete SIP-010 compliance test
(use-trait ft-trait .ft-trait.ft-trait)

(define-public (comprehensive-sip010-test (token <ft-trait>))
  (let (
    (test-address 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
    (results (list))
  )
  (begin
    ;; Test 1: get-name
    (asserts! (is-ok (contract-call? token get-name)) (err "get-name failed"))
    
    ;; Test 2: get-symbol  
    (asserts! (is-ok (contract-call? token get-symbol)) (err "get-symbol failed"))
    
    ;; Test 3: get-decimals
    (asserts! (is-ok (contract-call? token get-decimals)) (err "get-decimals failed"))
    
    ;; Test 4: get-total-supply
    (asserts! (is-ok (contract-call? token get-total-supply)) (err "get-total-supply failed"))
    
    ;; Test 5: get-balance
    (asserts! (is-ok (contract-call? token get-balance test-address)) (err "get-balance failed"))
    
    ;; Test 6: get-token-uri
    (asserts! (is-ok (contract-call? token get-token-uri)) (err "get-token-uri failed"))
    
    ;; Test 7: transfer function signature (can't test execution without tokens)
    ;; This would fail at runtime if signature is wrong
    
    (ok "All SIP-010 compliance tests passed!")
  ))
)

;; Test with VEN Token
(comprehensive-sip010-test .SIP_010)
```

### Performance Benchmarking

```javascript
// Benchmark SIP-010 function call performance
class SIP010Benchmark {
  constructor(contractAddress, contractName) {
    this.contractAddress = contractAddress;
    this.contractName = contractName;
    this.network = new StacksTestnet();
  }
  
  async benchmarkReadFunctions(iterations = 10) {
    const functions = ['get-name', 'get-symbol', 'get-decimals', 'get-total-supply'];
    const results = {};
    
    for (const func of functions) {
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        await callReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: func,
          functionArgs: [],
          network: this.network,
          senderAddress: this.contractAddress
        });
      }
      
      const endTime = Date.now();
      results[func] = {
        totalTime: endTime - startTime,
        avgTime: (endTime - startTime) / iterations,
        iterations
      };
    }
    
    return results;
  }
}

// Usage
const benchmark = new SIP010Benchmark(
  'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E',
  'SIP_010'
);

const results = await benchmark.benchmarkReadFunctions(5);
console.log('Benchmark Results:', results);
```

## ⚠️ Important Notes

### For Developers
- **Complete Implementation Required** - Must implement ALL trait functions
- **Function Signatures** - Must match exactly as defined in trait
- **Return Types** - Must return correct response types
- **Error Handling** - Should provide meaningful error codes

### For Users
- **Trait Verification** - Always verify a token implements the trait correctly
- **Security** - Only interact with verified SIP-010 tokens
- **Testing** - Test with small amounts first

### Common Pitfalls
- **Missing Functions** - Forgetting to implement all required functions
- **Wrong Signatures** - Function parameters or return types don't match
- **No Trait Implementation** - Forgetting `(impl-trait .ft-trait.ft-trait)`
- **Access Control** - Not properly restricting admin functions

## 🔗 Resources & References

### Documentation
- **SIP-010 Standard:** [GitHub SIP-010](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- **Clarity Language:** [docs.stacks.co/clarity](https://docs.stacks.co/clarity)
- **Clarinet Tools:** [docs.hiro.so/clarinet](https://docs.hiro.so/clarinet)
- **Stacks.js SDK:** [docs.stacks.co/stacks.js](https://docs.stacks.co/stacks.js)

### Deployed Contracts
- **ft-trait Contract:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.ft-trait`
- **Example Implementation:** `STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010`
- **Testnet Explorer:** https://explorer.stacks.co/?chain=testnet

### Development Tools
- **Testnet Faucet:** https://explorer.stacks.co/sandbox/faucet?chain=testnet
- **Hiro Wallet:** https://wallet.hiro.so/
- **Clarinet:** https://github.com/hirosystems/clarinet

## 🎯 Quick Examples

### 1. Basic Trait Usage in Your Contract
```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-public (my-function (token <ft-trait>))
  (contract-call? token get-name)
)
```

### 2. Multi-Token DApp Integration
```javascript
const tokens = [
  { address: 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E', name: 'SIP_010' },
  // Add more SIP-010 tokens here
];

for (const token of tokens) {
  const info = await getTokenInfo(token.address, token.name);
  console.log(`${token.name}:`, info);
}
```

### 3. Token Registry Pattern
```clarity
(use-trait ft-trait .ft-trait.ft-trait)

(define-map approved-tokens principal bool)

(define-public (approve-token (token <ft-trait>))
  (begin
    (try! (contract-call? token get-name))
    (map-set approved-tokens (contract-of token) true)
    (ok true)
  )
)
```

## 🚀 Next Steps

1. **Study the Trait** - Understand each function's purpose
2. **Implement Your Token** - Create a new SIP-010 compliant token
3. **Test Thoroughly** - Use the compliance tests provided
4. **Deploy & Verify** - Deploy to testnet and verify functionality
5. **Integrate** - Build dApps that work with any SIP-010 token

---

**Master the SIP-010 Standard! 🎯**

*For VEN Token specific usage, check the main [README.md](README.md) documentation.*