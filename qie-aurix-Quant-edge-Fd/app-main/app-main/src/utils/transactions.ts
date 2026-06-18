import { Wallet, providers, Contract, constants, utils } from "ethers";
import { WalletClient, erc20ABI, useWalletClient } from "wagmi";
import React from "react";

export const provider = new providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_PROVIDER_URL
);

export const setTokenAllowance = async (
  tokenAddress: string,
  address: string,
  signer: any
) => {
  try {
    const erc20 = new Contract(tokenAddress, erc20ABI, signer);
    const tx = await erc20.approve(address, constants.MaxUint256);

    await tx.wait();
  } catch (error) {
    console.error("Error setting token allowance:", error);
    throw error;
  }
};

export const getTokenAllowance = async (
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
) => {
  if (!ownerAddress) return;

  try {
    const erc20 = new Contract(tokenAddress, erc20ABI, provider);

    const allowance = await erc20.allowance(ownerAddress, spenderAddress);
    return utils.formatUnits(allowance, 18);
  } catch (error) {
    console.error("Error fetching token allowance:", error);
    throw error;
  }
};

// Signer
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });

  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}

export const getBalance = async (
  tokenAddress: string,
  address: string,
  signer: any
) => {
  if (!signer) return;

  const contract = new Contract(tokenAddress, erc20ABI, signer);
  return contract.balanceOf(address);
};

export const getSupply = async (tokenAddress: string, signer: any) => {
  if (!signer) return;

  const contract = new Contract(tokenAddress, erc20ABI, signer);
  return contract.totalSupply();
};
