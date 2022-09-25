const {
	time,
	loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe("Vault tests", function () {
	async function deployFixture() {
    	// Contracts are deployed using the first signer/account by default
		const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

		// Deploy ERC20
		const erc20name = "LiquidToken";
		const erc20symbol = "LT";
		const totalSupply = 188;
		const LNT20 = await ethers.getContractFactory("LNT20");
		const lnt20 = await LNT20.deploy(erc20name, erc20symbol, totalSupply, owner.address);
		
		// Deploy ERC721
		const erc721name = "LiquidNFT";
		const erc721symbol = "LNFT";
		const baseURI = "ipfs://bafybeicdyppz5etjnhpgv2gm7ahfe3a4nmrzi63cmuz57m4p7muqavcuki/";
		const LNT721 = await ethers.getContractFactory("LNT721");
		const lnt721 = await LNT721.deploy(lnt20.address, erc721name, erc721symbol, baseURI, owner.address);
		const fakeNFT = await LNT721.deploy(lnt20.address, "fakeNFT", "FNFT", baseURI, owner.address);


		// Deploy Vault
		const LiquidVault = await ethers.getContractFactory("LiquidVault");
		const vault = await LiquidVault.deploy(lnt20.address, lnt721.address);

		return { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, baseURI, owner, account1, account2, account3, account4, account5 };
	}

	describe("Check erc20 to erc721", function () {
	
		it("Normal Swap", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, baseURI, owner, account1, account2, account3 } = await loadFixture(deployFixture);

			await lnt721.mint(vault.address, 188);
			expect(await lnt721.balanceOf(vault.address)).to.equal(await vault.totalSupply());

		// check both owner and account1 balances
			await lnt20.transfer(account1.address, 1000000000000000000n);
			expect(await lnt20.balanceOf(owner.address)).to.equal(187000000000000000000n);
			expect(await lnt20.balanceOf(account1.address)).to.equal(1000000000000000000n);

		// approve and check allowance
			await lnt20.connect(account1).approve(vault.address, 1000000000000000000n);
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(1000000000000000000n);
		
		// trigger the transferFrom function
			await vault.connect(account1).erc20toErc721();

		// check erc20 balances
			expect(await lnt20.balanceOf(vault.address)).to.equal(1000000000000000000n);
			expect(await lnt20.balanceOf(account1.address)).to.equal(0);
		// check erc721 balances
			expect(await lnt721.balanceOf(vault.address)).to.equal(187);
			expect(await lnt721.balanceOf(account1.address)).to.equal(1);
		// check allowance
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(0);
		});

		it("Vault picks NFT in correct order", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3, account4, account5 } = await loadFixture(deployFixture);

			await lnt721.mint(vault.address, 188);
			await lnt20.transfer(account1.address, 10000000000000000000n);
			await lnt20.connect(account1).approve(vault.address, 10000000000000000000n);
			for (let i = 0; i < 10; i++) {
				await vault.connect(account1).erc20toErc721();
			}

			await lnt721.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, vault.address, 1);
			await lnt721.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, vault.address, 5);
			await lnt721.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, vault.address, 3);
			await lnt721.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, vault.address, 9);


			// check ownership and bool on the first 10 NFTs
			expect(await lnt20.balanceOf(vault.address)).to.equal(6000000000000000000n);
			expect(await lnt721.balanceOf(vault.address)).to.equal(182);
			expect(await lnt721.ownerOf(0)).to.equal(account1.address);
			expect(await vault.collectionTracker(0)).to.equal(true);
			expect(await lnt721.ownerOf(1)).to.equal(vault.address);
			expect(await vault.collectionTracker(1)).to.equal(false);
			expect(await lnt721.ownerOf(2)).to.equal(account1.address);
			expect(await vault.collectionTracker(2)).to.equal(true);
			expect(await lnt721.ownerOf(3)).to.equal(vault.address);
			expect(await vault.collectionTracker(3)).to.equal(false);
			expect(await lnt721.ownerOf(4)).to.equal(account1.address);
			expect(await vault.collectionTracker(4)).to.equal(true);
			expect(await lnt721.ownerOf(5)).to.equal(vault.address);
			expect(await vault.collectionTracker(5)).to.equal(false);
			expect(await lnt721.ownerOf(6)).to.equal(account1.address);
			expect(await vault.collectionTracker(6)).to.equal(true);
			expect(await lnt721.ownerOf(7)).to.equal(account1.address);
			expect(await vault.collectionTracker(7)).to.equal(true);
			expect(await lnt721.ownerOf(8)).to.equal(account1.address);
			expect(await vault.collectionTracker(8)).to.equal(true);
			expect(await lnt721.ownerOf(9)).to.equal(vault.address);
			expect(await vault.collectionTracker(9)).to.equal(false);

			// pull first available NFT
			await lnt20.connect(account1).approve(vault.address, 4000000000000000000n);
			await vault.connect(account1).erc20toErc721();

			// check if correct NFT as been pulled
			expect(await lnt721.ownerOf(1)).to.equal(account1.address);
			expect(await vault.collectionTracker(1)).to.equal(true);

			// one more time
			await vault.connect(account1).erc20toErc721();
			expect(await lnt721.ownerOf(3)).to.equal(account1.address);
			expect(await vault.collectionTracker(3)).to.equal(true);

		});

		it("Fake collections do not alter the vault", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

		// send all fakeNFT to the vault
			await fakeNFT.mint(vault.address, 188);
			await lnt20.transfer(account1.address, 1000000000000000000n);
			await lnt20.connect(account1).approve(vault.address, 1000000000000000000n);
		// trying to interact with it
			await expect(vault.connect(account1).erc20toErc721()).to.be.revertedWith("ERC721: invalid token ID");
			expect(await lnt20.balanceOf(account1.address)).to.equal(1000000000000000000n);

		// mint whitelisted collection
			await lnt721.mint(vault.address, 188);
			await vault.connect(account1).erc20toErc721();

		// check vault and account1 balances
			expect(await lnt20.balanceOf(account1.address)).to.equal(0);
			expect(await lnt721.ownerOf(0)).to.equal(account1.address);
			expect(await vault.collectionTracker(0)).to.equal(true);
		});

		it("Can't transfer lower than 1 erc20", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

		// mint and transfer
			await lnt721.mint(vault.address, 188);
			await lnt20.transfer(account1.address, 1999999999999999999n);

		// approve lower than minimum
			await lnt20.connect(account1).approve(vault.address, 1999999999999999999n);
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(1999999999999999999n);
		
		// trigger the transferFrom function
			await vault.connect(account1).erc20toErc721();
			await expect(vault.connect(account1).erc20toErc721()).to.be.revertedWith("ERC20: insufficient allowance");
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(999999999999999999n);
			expect(await lnt20.balanceOf(account1.address)).to.equal(999999999999999999n);
		});

		it("Can't transfer erc20 if no balance", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

		// mint and transfer
			await lnt721.mint(vault.address, 188);

		// approve then transfer erc20 await
			await lnt20.connect(account1).approve(vault.address, 1000000000000000000n);
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(1000000000000000000n);
			await expect(vault.connect(account1).erc20toErc721()).to.be.revertedWith("ERC20: transfer amount exceeds balance");
		});
	});

	describe("Check erc721 to erc20", function () {
		it("Normal Swap", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

			await lnt721.mint(vault.address, 188);
			await lnt20.transfer(account1.address, 1000000000000000000n);
			await lnt20.connect(account1).approve(vault.address, 1000000000000000000n);
			await vault.connect(account1).erc20toErc721();

		// check vault and account1 balances
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(0);
			expect(await lnt20.balanceOf(account1.address)).to.equal(0);
			expect(await lnt721.balanceOf(account1.address)).to.equal(1);
			expect(await lnt721.ownerOf(0)).to.equal(account1.address);
			expect(await vault.collectionTracker(0)).to.equal(true);

		// transfer nft from account1 to account2
			await lnt721.connect(account1).transferFrom(account1.address, account2.address, 0);

		// check account2 balances
			expect(await lnt20.balanceOf(account2.address)).to.equal(0);
			expect(await lnt721.balanceOf(account2.address)).to.equal(1);
			expect(await lnt721.ownerOf(0)).to.equal(account2.address);


		// send erc721 by safeTransferFrom
			await lnt721.connect(account2)["safeTransferFrom(address,address,uint256)"](account2.address, vault.address, 0);

		// check if all worked
			expect(await lnt20.balanceOf(account2.address)).to.equal(1000000000000000000n);
			expect(await lnt721.balanceOf(account2.address)).to.equal(0);
			expect(await lnt721.ownerOf(0)).to.equal(vault.address);
			expect(await vault.collectionTracker(0)).to.equal(false);

		});

		it("Only accept Whitelisted NFT Collection", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

		// send all fakeNFT to account 1
			await fakeNFT.mint(account1.address, 188);
		// send 10 erc20 to the vault
			await lnt20.transfer(vault.address, 10000000000000000000n);
		// send 1 fakeNFT to the vault to trigger "onERC721Received"
			await expect(fakeNFT.connect(account1)["safeTransferFrom(address,address,uint256)"](account1.address, vault.address, 0)).to.be.revertedWith("NFT not whitelisted");

		// check vault balances
			expect(await lnt20.balanceOf(vault.address)).to.equal(10000000000000000000n);
			expect(await vault.collectionTracker(0)).to.equal(false);

		// check account1 balances
			expect(await lnt20.balanceOf(account1.address)).to.equal(0);
			expect(await fakeNFT.ownerOf(0)).to.equal(account1.address);
			expect(await fakeNFT.balanceOf(account1.address)).to.equal(188);
		});

		it("Don't mint more than totalSupply", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);

			await lnt721.mint(vault.address, 500);

		// try to re-triggered the mint function
			await expect(lnt721.mint(vault.address, 50)).to.be.revertedWith("Collection has already been minted");

		// check if right amount of NFTs in wallet
			expect(await lnt721.balanceOf(vault.address)).to.equal(188);
		});

		it("Revert when no NFT in the vault", async function () {
			const { lnt20, lnt721, fakeNFT, vault, erc20name, erc20symbol, erc721name, erc721symbol, totalSupply, owner, account1, account2, account3 } = await loadFixture(deployFixture);
	
		// pull 187 NFTs from the vault
			await lnt721.mint(vault.address, 188);
			await lnt20.transfer(account1.address, 188000000000000000000n);
			await lnt20.connect(account1).approve(vault.address, 188000000000000000000n);
			for (let i = 0; i < 187; i++) {
				await vault.connect(account1).erc20toErc721();
			}

		// check erc20 balances
			expect(await lnt20.balanceOf(vault.address)).to.equal(187000000000000000000n);
			expect(await lnt20.balanceOf(account1.address)).to.equal(1000000000000000000n);
		// check erc721 balances
			expect(await lnt721.balanceOf(vault.address)).to.equal(1);
			expect(await lnt721.balanceOf(account1.address)).to.equal(187);
		// check allowance
			expect(await lnt20.allowance(account1.address, vault.address)).to.equal(1000000000000000000n);

		// pull the last nft from the vault and check balances
			await vault.connect(account1).erc20toErc721();
			expect(await lnt721.balanceOf(vault.address)).to.equal(0);
			expect(await lnt721.balanceOf(account1.address)).to.equal(188);

		// try to pull when no NFT left in the vault
			await expect(vault.connect(account1).erc20toErc721()).to.be.revertedWith("No available NFT in the vault");
		});
	});
});
