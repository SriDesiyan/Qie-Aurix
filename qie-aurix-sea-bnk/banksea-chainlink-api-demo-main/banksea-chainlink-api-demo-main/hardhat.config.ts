import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
dotenv.config();

const { INFURA_KEY, PRIVATE_KEY, ETHERSCAN_KEY } = process.env;

const config: HardhatUserConfig = {
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${PRIVATE_KEY}`]
    },
    fuji: {
      url: `https://avalanche-fuji.infura.io/v3/${INFURA_KEY}`,
      accounts: [`${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: `${ETHERSCAN_KEY}`,
  },
  solidity: "0.8.15",
};
export default config;
