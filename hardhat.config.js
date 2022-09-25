require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const ETHERSCAN_API_KEY = "";
const ALCHEMY_API_KEY = "";
const TESTNET_PRIVATE_KEY = "";
const MAINNET_PRIVATE_KEY = "";


module.exports = {
	defaultNetwork: "optimism", 
	networks: {
	  hardhat: {
	  },
	  // for mainnet
	  'optimism': {
		url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
		accounts: [MAINNET_PRIVATE_KEY]
	  },
	  // for kovan optimism
	  'optimism-kovan': {
		url: `https://opt-kovan.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
		accounts: [TESTNET_PRIVATE_KEY]
	  },
	  // for goerli optimism
	  'optimism-goerli': {
		url: `https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
		accounts: [TESTNET_PRIVATE_KEY]
	  },
	  // for the local dev environment
	  'optimism-local': {
		url: "http://localhost:8545",
		accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"]
	  },
	},
	solidity: {
		version: "0.8.17",
		settings: {
			optimizer: {
				enabled: true,
				runs: 10000
		}
		}
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
};
  