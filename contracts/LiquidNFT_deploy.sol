// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./Vault.sol";
import "./LNT20.sol";
import "./LNT721.sol";


contract LiquidNFT_deploy{
    
	LNT20 erc20Token;
    LNT721 erc721Collection;
    LiquidVault vault;

	mapping (address => LNT20) public erc20_contract;
	mapping (address => LNT721) public erc721_contract;
	mapping (address => LiquidVault) public vault_contract;

	// to do: Find a way for people to easily deploy the 3 smart contracts, and keep storage of them in a mapping or so
	// mapping(LNT20 => uint) public deploy_All_Tracker;

    function deploy_All(address _owner, string memory _erc20Name, string memory _erc20Symbol, uint _totalSupply, string memory _erc721Name, string memory _erc721Symbol, string memory _baseURI) public{

        erc20Token = new LNT20(_erc20Name, _erc20Symbol, _totalSupply, _owner);
        erc721Collection = new LNT721(erc20Token, _erc721Name, _erc721Symbol, _baseURI, _owner);
        vault = new LiquidVault(erc20Token, erc721Collection);

		erc20_contract[msg.sender] = erc20Token;
		erc721_contract[msg.sender] = erc721Collection;
		vault_contract[msg.sender] = vault;

    }
}