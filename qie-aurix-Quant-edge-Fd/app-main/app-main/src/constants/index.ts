export const stableToken: {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
} = {
  symbol: "USDC.e",
  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  decimals: 6,
};

export const vaultShareToken: {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
} = {
  symbol: "VST",
  address: process.env
    .NEXT_PUBLIC_VAULT_SHARE_CONTRACT_ADDRESS as `0x${string}`,
  decimals: 6,
};
