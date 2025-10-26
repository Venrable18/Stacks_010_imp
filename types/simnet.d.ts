// Type declarations for simnet global object provided by vitest-environment-clarinet
declare global {
  const simnet: {
    blockHeight: number;
    getAccounts(): Map<string, string>;
    callReadOnlyFn(
      contract: string,
      method: string,
      args: any[],
      sender: string
    ): { result: any };
    callPublicFn(
      contract: string,
      method: string,
      args: any[],
      sender: string
    ): { result: any };
  };
}

export {};