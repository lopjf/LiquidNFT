// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract LNT721 is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    IERC20 immutable public erc20Token;
    string private _baseTokenURI;
	uint public totalSupply;

    constructor(IERC20 _erc20Token, string memory _name, string memory _symbol, string memory baseTokenURI, address _owner) ERC721(_name, _symbol) Ownable(_owner) {
        erc20Token = _erc20Token;
        _baseTokenURI = baseTokenURI;
		totalSupply = erc20Token.totalSupply() / 1e18;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function safeMint(address to, string memory uri) private onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function mint(address to, uint quantity) public onlyOwner {
		require(_tokenIdCounter.current() < totalSupply, "Collection has already been minted");
        
		for (uint i = 0; i < quantity && _tokenIdCounter.current() < totalSupply; i++) {
			uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _mint(to, tokenId);
		}
    }
    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
