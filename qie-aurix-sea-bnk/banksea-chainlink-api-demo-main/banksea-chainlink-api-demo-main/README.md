# banksea-chainlink-api-demo
This repo is a demo for the developer who want to use the data on-chain from banksea on Ethereum by chainlink. 

The params of **setChainlinkToken** and **setChainlinkOracle** is the settings on Goerli Testnet. If you want to try the demo on Etheruem Mainnet. Please refer to the [chainlink docs](https://docs.chain.link/any-api/introduction) to update them.

## Installation
Clone the repo:
```
git clone https://github.com/Banksea-Finance/banksea-chainlink-api-demo.git
```
Install dependencies:
```
npm install
```
Create a .env file, and fill it with the privatekey of your wallet and infura key:
```
PRIVATE_KEY=YOUR-PRIVATE-KEY
INFURA_KEY=YOUR-INFURA-KEY
```
## Compilation & Deployment
Compile the contract:
```
npx hardhat compile
```
Deploy
```
npx hardhat run .\scripts\deploy.ts --network goerli
```
Record the address of APIConsumer and fund some LINK to the address.

## Test
You can call the **requestFloor** interface on the contract. After a while, you can check the **floor** value on it.