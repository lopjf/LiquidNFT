// SPDX-License-Identifier: MIT
// Big thank you Petr Hejda for proving such good help: https://stackoverflow.com/questions/73624789/vault-that-receives-nfts-and-send-tokens-in-exchange-vice-versa

pragma solidity 0.8.17;
 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract LiquidVault is IERC721Receiver {
    IERC20 immutable public erc20Token;
    IERC721 immutable public erc721Collection;
    uint immutable public totalSupply;
    bool[1000000] public collectionTracker;    // true when no NFT, false when the NFT is in the vault.       By default, all the NFTs are in the vault.
    uint balanceOfNft;

    uint constant public AMOUNT_OF_ERC20_PER_ERC721 = 1 * 1e18; // 1 token, 18 decimals.

    constructor(IERC20 _erc20Token, IERC721 _erc721Collection) {
        erc20Token = _erc20Token;
        erc721Collection = _erc721Collection;
        totalSupply = erc20Token.totalSupply() / 1e18;
    }

    // ERC721 to ERC20  // When a safe transfer to the contract occurs, this function will be invoked.
    function onERC721Received(address _operator, address /*_from*/, uint _tokenId, bytes calldata /*_data*/) external returns(bytes4) {
        // validate that you're receiving from a whitelisted collection.
        require(erc721Collection.balanceOf(address(this)) == balanceOfNft + 1, "NFT not whitelisted");

        collectionTracker[_tokenId] = false;
        balanceOfNft = erc721Collection.balanceOf(address(this));

        // Transfer 1 ERC20 token.
        bool success = erc20Token.transfer(_operator, AMOUNT_OF_ERC20_PER_ERC721);
        require(success);

        // required by the ERC721 standard.
        return this.onERC721Received.selector;
    }

    // How to use: User first need to approve on the ERC20 smart contract to give allowance to the vault. Then it has to trigger this erc20toErc721 vault function.
    function erc20toErc721() external {
        // Find the first available NFT.
        uint tokenId = 0;
        while (collectionTracker[tokenId] == true){
            if (tokenId == totalSupply)
                break;
            tokenId++;
        }
        require(tokenId < totalSupply, "No available NFT in the vault");

        // Pull 1 ERC20 token from the user's address to the vault.
        bool success = erc20Token.transferFrom(msg.sender, address(this), AMOUNT_OF_ERC20_PER_ERC721);
        require(success);

        // Send the NFT from the vault to the user address.
        erc721Collection.safeTransferFrom(address(this), msg.sender, tokenId);
        balanceOfNft = erc721Collection.balanceOf(address(this));

        // Place the pulled NFT as false for keeping track.
        collectionTracker[tokenId] = true;
    }
}
