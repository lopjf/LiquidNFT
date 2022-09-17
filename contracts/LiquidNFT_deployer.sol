// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./Vault.sol";
import "./LNT20.sol";
import "./LNT721.sol";


contract LiquidNFT_deployer{
    
    LNT20 public erc20Token;
    LNT721 public erc721Collection;
    LiquidVault public vault;

    function deploy(string memory _erc20Name, string memory _erc20Symbol, uint _totalSupply, string memory _erc721Name, string memory _erc721Symbol, string memory _baseURI) public{

        erc20Token = new LNT20(_erc20Name, _erc20Symbol, _totalSupply);
        erc721Collection = new LNT721(erc20Token, _erc721Name, _erc721Symbol, _baseURI);
        vault = new LiquidVault(erc20Token, erc721Collection);
    }
}