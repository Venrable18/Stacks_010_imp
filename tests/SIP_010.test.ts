import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

describe("SIP-010 Token Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should get token name correctly", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const { result } = simnet.callReadOnlyFn("SIP_010", "get-name", [], address1);
    expect(result).toBeOk(Cl.stringAscii("VEN Token"));
  });

  it("should get token symbol correctly", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const { result } = simnet.callReadOnlyFn("SIP_010", "get-symbol", [], address1);
    expect(result).toBeOk(Cl.stringAscii("VT"));
  });

  it("should get token decimals correctly", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const { result } = simnet.callReadOnlyFn("SIP_010", "get-decimals", [], address1);
    expect(result).toBeOk(Cl.uint(18));
  });

  it("should get total supply correctly", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const { result } = simnet.callReadOnlyFn("SIP_010", "get-total-supply", [], address1);
    expect(result).toBeOk(Cl.uint(0)); // Initially 0 since no tokens minted
  });

  it("should get balance correctly", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const { result } = simnet.callReadOnlyFn("SIP_010", "get-balance", [Cl.principal(address1)], address1);
    expect(result).toBeOk(Cl.uint(0)); // Initially 0
  });

  it("should allow contract owner to mint tokens", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const deployer = accounts.get("deployer")!;
    
    const mintAmount = 1000;
    const { result } = simnet.callPublicFn("SIP_010", "mint", [Cl.uint(mintAmount), Cl.principal(address1)], deployer);
    expect(result).toBeOk(Cl.bool(true));

    // Check balance after minting
    const { result: balance } = simnet.callReadOnlyFn("SIP_010", "get-balance", [Cl.principal(address1)], address1);
    expect(balance).toBeOk(Cl.uint(mintAmount));
  });

  it("should prevent non-owner from minting tokens", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    
    const mintAmount = 1000;
    const { result } = simnet.callPublicFn("SIP_010", "mint", [Cl.uint(mintAmount), Cl.principal(address1)], address1);
    expect(result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("should allow token transfer between accounts", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const address2 = accounts.get("wallet_2")!;
    const deployer = accounts.get("deployer")!;
    
    // First mint some tokens to address1
    simnet.callPublicFn("SIP_010", "mint", [Cl.uint(1000), Cl.principal(address1)], deployer);
    
    // Transfer tokens from address1 to address2
    const transferAmount = 500;
    const { result } = simnet.callPublicFn("SIP_010", "transfer", [Cl.uint(transferAmount), Cl.principal(address1), Cl.principal(address2)], address1);
    expect(result).toBeOk(Cl.bool(true));

    // Check balances after transfer
    const { result: balance1 } = simnet.callReadOnlyFn("SIP_010", "get-balance", [Cl.principal(address1)], address1);
    const { result: balance2 } = simnet.callReadOnlyFn("SIP_010", "get-balance", [Cl.principal(address2)], address2);
    
    expect(balance1).toBeOk(Cl.uint(500)); // 1000 - 500
    expect(balance2).toBeOk(Cl.uint(500)); // 0 + 500
  });

  it("should prevent unauthorized transfers", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const address2 = accounts.get("wallet_2")!;
    
    // Try to transfer tokens from address1 using address2's credentials
    const { result } = simnet.callPublicFn("SIP_010", "transfer", [Cl.uint(100), Cl.principal(address1), Cl.principal(address2)], address2);
    expect(result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("should prevent transfer of zero amount", () => {
    const accounts = simnet.getAccounts();
    const address1 = accounts.get("wallet_1")!;
    const address2 = accounts.get("wallet_2")!;
    
    const { result } = simnet.callPublicFn("SIP_010", "transfer", [Cl.uint(0), Cl.principal(address1), Cl.principal(address2)], address1);
    expect(result).toBeErr(Cl.uint(101)); // ERR_INVALID_AMOUNT
  });
});
