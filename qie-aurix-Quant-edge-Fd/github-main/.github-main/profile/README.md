# Quantum Hedge Fund

![Quantum Oracles](/assets/Quantum%20Hedge%20Fund.001.jpeg)

## Overview
Quantum Hedge Fund is an on-chain hedge fund powered by Chainlink that implements advanced fund management strategies by using a quantum algorithm for portfolio diversification. This project features smart contracts for managing a cryptocurrency vault, integrating Chainlink oracles for accurate pricing and Quickswap for token exchanges.

## Features
- **Token Management**: Support for a diverse range of cryptocurrencies, enabling dynamic adjustments to the portfolio.
- **Vault Shares**: Tokenization of shares in the vault using `VaultShareToken`.
- **Deposits and Withdrawals**: Robust mechanisms for depositing and withdrawing funds.
- **Automated Rebalancing**: Portfolio rebalancing executed based on strategies defined in the `FundManager` contract.
- **Chainlink and Uniswap Integration**: Ensures reliable price feeds and efficient liquidity management.
- **Quantum portfolio diversification**: unique and advanced fund strategy based on a quantum algorithm

## Components

### Chainlink:
- Datafeed: calculating the total value of the pool 
- Functions: retrieving allocations from the quantum oracle
- Automation: initiating rebalancing of assets

### Smart Contracts:
1. **Vault Contract**: Manages core functions such as deposits, withdrawals, and rebalancing.
2. **FundManager Contract**: Oversees token weights and handles oracle requests for portfolio management.
3. **VaultShareToken Contract**: ERC20 token representing a stake in the vault.

### Quantum Computing API:
- Send asset prices to the API and choose algorithm to run (quantum or quantum-inspired)
- Runs quantum algorithm with asset prices
- Sends optimal selection of assets from quantum algorithm
- Draws diagram of quantum program and plots optimisation
- Deployed at URL

### User Interface:
- User can deposit funds
- User can withdraw funds
- Visual representation of the asset allocations

![Quantum Oracles](/assets/Quantum%20Hedge%20Fund.006.jpeg)

## Tech Stack

- Chainlink Functions: Fetching the asset prices and sending them to the quantum oracle and receiving the results
- Chainlink Datafeed: Fetching the prices of each asset real-time on the smart contract
- Chainlink Automation: Rebalancing the allocation of the assets every day
- Polygon: deployed on Polygon mainnet
- Quickswap: Exchange for rebalancing the assets
- Qiskit: Quantum computing software development kit for running the quantum algorithm 

![Quantum Oracles](/assets/Quantum%20Hedge%20Fund.005.jpeg)

## Quantum Algorithm

The algorithm is based on the Qiskit Portfolio Diversification algorithm: [https://qiskit.org/ecosystem/finance/tutorials/02_portfolio_diversification.html](https://qiskit.org/ecosystem/finance/tutorials/02_portfolio_diversification.html)

We modified the algorithm to fit the needs of our quantum hedge fund. 

![Quantum Oracles](/assets/Quantum%20Hedge%20Fund.009.jpeg)

## Links

### Technical Links
- Github: [https://github.com/Quantum-Hedge-Funds](https://github.com/Quantum-Hedge-Funds)
- App: [https://quantum-hedge-fund-app.vercel.app/](https://quantum-hedge-fund-app.vercel.app/)
- API: [https://api-production-5752.up.railway.app/docs](https://api-production-5752.up.railway.app/docs)

### Presentation Links
- Video demo: [https://youtu.be/6QXWxM5b-Pg](https://youtu.be/VWSB-OlrL58)
- Presentation: [https://bit.ly/quantum-fund-presentation](https://bit.ly/quantum-fund-presentation)
- Architecture Diagram: [https://bit.ly/quantum-fund-diagram](https://bit.ly/quantum-fund-diagram)

![Quantum Oracles](/assets/Quantum%20Hedge%20Fund.014.jpeg)

## Getting Started
Engaging with Quantum Hedge Fund requires familiarity with Solidity, Ethereum blockchain, and smart contract development.

### Prerequisites
- Node.js and npm
- Hardhat

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Quantum-Hedge-Funds/smart-contracts.git
   ```

2. Install the required packages:
   ```sh
   npm install
   ```

3. Compile the smart contracts with Hardhat:
   ```sh
   npx hardhat compile
   ```

4. Deploy the contracts:
   ```sh
   npx hardhat run scripts/deploy.ts --network polygonMainnet
   ```

### Testing
Run the test suite to ensure everything functions as expected:
```sh
npx hardhat test
```

## Usage
Interact with the Quantum Hedge Fund contracts through the Hardhat console or by integrating them into a frontend application using Web3.js or Ethers.js.

## Security
This project is in the developmental phase. Thoroughly review the code before deploying it in production environments.

## License
This project is licensed under the MIT License. 

## Contact
You can contact as at contact@yashgoyal.dev, contact@jessicapointing.com

## Acknowledgements
- [Chainlink](https://chain.link/)
- [Quickswap](https://quickswap.exchange/#/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Qiskit](https://www.ibm.com/quantum/qiskit)
