// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
	// Deploy ERC20
	const erc20name = "LiquidToken";
	const erc20symbol = "LT";
	const totalSupply = 1000;
	const LNT20 = await ethers.getContractFactory("LNT20");
	const lnt20 = await LNT20.deploy(erc20name, erc20symbol, totalSupply);
	
	// Deploy ERC721
	const erc721name = "LiquidNFT";
	const erc721symbol = "LNFT";
	const baseURI = "ipfs://bafybeibnbtud2jvdz7dcxcig7p3nextucuheslggzhn6oiq7z7voqhbpge/";
	const LNT721 = await ethers.getContractFactory("LNT721");
	const lnt721 = await LNT721.deploy(lnt20.address, erc721name, erc721symbol, baseURI);

	// Deploy Vault
	const LiquidVault = await ethers.getContractFactory("LiquidVault");
	const vault = await LiquidVault.deploy(lnt20.address, lnt721.address);

	console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
	console.log("Contracts successfully deployed!\n\nerc20 contract:   ", lnt20.address);
	console.log("erc721 contract:  ", lnt721.address);
	console.log("vault contract:   ", vault.address);
	console.log("\n");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
