import { mainnet, sepolia, polygon, polygonMumbai } from "wagmi/chains";
import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

export const { chains, publicClient } = configureChains(
  [mainnet, sepolia, polygon, polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Hedgy",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});
