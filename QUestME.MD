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

### 1. Using Stacks Explorer

Visit the contract on Stacks Explorer:
```
https://explorer.stacks.co/address/STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E?chain=testnet
```

### 2. Using Clarinet Console

```bash
# Start Clarinet console
clarinet console

# Switch to testnet
::set_network testnet
```

## 📖 Reading Token Information

### Get Token Details

```clarity
;; Get token name
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-name)
;; Returns: (ok "VEN Token")

;; Get token symbol  
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-symbol)
;; Returns: (ok "VT")

;; Get decimals
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-decimals)
;; Returns: (ok u18)

;; Get total supply
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-total-supply)
;; Returns current total supply
```

### Check Balances

```clarity
;; Check your balance (replace with your address)
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-balance 'ST1YOUR_ADDRESS_HERE)

;; Check deployer balance
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-balance 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E)
```

## 💰 Token Operations

### Minting Tokens (Owner Only)

```clarity
;; Only the contract deployer can mint tokens
;; Mint 1000 tokens (1000 * 10^18 in smallest units)
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 mint u1000000000000000000000 'ST1RECIPIENT_ADDRESS)
```

### Transferring Tokens

```clarity
;; Standard SIP-010 transfer
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 transfer 
  u100000000000000000000    ;; 100 tokens (100 * 10^18)
  tx-sender                 ;; from your address
  'ST1RECIPIENT_ADDRESS)    ;; to recipient

;; Helper transfer function
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 transfer-token 
  u100000000000000000000    ;; 100 tokens
  'ST1RECIPIENT_ADDRESS)    ;; to recipient
```

## 🔧 Using Stacks.js

### Setup

```bash
npm install @stacks/transactions @stacks/network
```

### Read Token Information

```javascript
import { 
  callReadOnlyFunction,
  standardPrincipalCV,
  StacksTestnet
} from '@stacks/transactions';

const network = new StacksTestnet();
const contractAddress = 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E';
const contractName = 'SIP_010';

// Get token name
const getTokenName = async () => {
  const result = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-name',
    functionArgs: [],
    network,
    senderAddress: contractAddress
  });
  console.log('Token name:', result);
};

// Get balance
const getBalance = async (address) => {
  const result = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-balance',
    functionArgs: [standardPrincipalCV(address)],
    network,
    senderAddress: contractAddress
  });
  console.log('Balance:', result);
};
```

### Transfer Tokens

```javascript
import { 
  makeContractCall,
  broadcastTransaction,
  uintCV,
  standardPrincipalCV,
  StacksTestnet
} from '@stacks/transactions';

const transferTokens = async (senderKey, recipientAddress, amount) => {
  const network = new StacksTestnet();
  
  const txOptions = {
    contractAddress: 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E',
    contractName: 'SIP_010',
    functionName: 'transfer',
    functionArgs: [
      uintCV(amount),
      standardPrincipalCV(senderAddress),
      standardPrincipalCV(recipientAddress)
    ],
    senderKey,
    network,
    anchorMode: 1, // AnchorMode.OnChainOnly
  };
  
  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
};

// Example usage
const txid = await transferTokens(
  'your-private-key-here',
  'ST1RECIPIENT_ADDRESS',
  '100000000000000000000' // 100 tokens
);
```

## 🎮 Web3 Wallet Integration

### Using Hiro Wallet (Leather)

```javascript
// Connect wallet
const connectWallet = async () => {
  if (window.StacksProvider) {
    const userSession = await window.StacksProvider.connect();
    return userSession;
  }
};

// Transfer via wallet
const walletTransfer = async (recipientAddress, amount) => {
  const txOptions = {
    contractAddress: 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E',
    contractName: 'SIP_010',
    functionName: 'transfer-token',
    functionArgs: [
      uintCV(amount),
      standardPrincipalCV(recipientAddress)
    ],
    network: new StacksTestnet(),
  };
  
  const result = await window.StacksProvider.signTransaction(txOptions);
  return result;
};
```

## 🧮 Token Amount Calculations

VEN Token has 18 decimals, so calculations work like this:

```javascript
// Convert human-readable amounts to contract amounts
const toContractAmount = (humanAmount) => {
  return BigInt(humanAmount) * BigInt(10 ** 18);
};

// Convert contract amounts to human-readable
const fromContractAmount = (contractAmount) => {
  return Number(contractAmount) / (10 ** 18);
};

// Examples
console.log(toContractAmount(1));    // 1000000000000000000n (1 token)
console.log(toContractAmount(100));  // 100000000000000000000n (100 tokens)
console.log(fromContractAmount(1000000000000000000n)); // 1
```

## ⚠️ Important Notes

### Security
- Always verify recipient addresses before transferring
- Use proper error handling for all contract calls
- Test with small amounts first

### Gas Fees
- All transactions require STX for fees
- Ensure you have testnet STX in your wallet
- Get testnet STX from: https://explorer.stacks.co/sandbox/faucet?chain=testnet

### Error Codes
- `100` - Unauthorized (not the sender)
- `101` - Invalid amount (zero or negative)
- `102` - Not token owner (for minting)
- `103` - Insufficient balance

## 🔗 Useful Links

- **Testnet Explorer:** https://explorer.stacks.co/?chain=testnet
- **Testnet Faucet:** https://explorer.stacks.co/sandbox/faucet?chain=testnet
- **Stacks.js Docs:** https://docs.stacks.co/stacks.js/
- **SIP-010 Standard:** https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md

## 📝 Example Use Cases

### 1. Simple Token Transfer
```clarity
;; Transfer 50 VT tokens to another user
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 transfer-token 
  u50000000000000000000
  'ST1RECIPIENT_ADDRESS)
```

### 2. Check Before Transfer
```clarity
;; Check balance first
(contract-call? 'STP472NMPYXCMRB4G75EM43PESZT33FZG7GBVK8E.SIP_010 get-balance tx-sender)
;; Then transfer if sufficient balance
```

### 3. Batch Operations (via script)
```javascript
// Transfer to multiple recipients
const recipients = [
  'ST1ADDR1',
  'ST1ADDR2', 
  'ST1ADDR3'
];

for (const recipient of recipients) {
  await transferTokens(privateKey, recipient, '10000000000000000000'); // 10 tokens each
}
```

---

**Happy token trading! 🚀**

*Need help? Check the main [README.md](README.md) for detailed documentation.*