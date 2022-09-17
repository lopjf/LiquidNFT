// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LNT20 is ERC20 {
    constructor(string memory _name, string memory _symbol, uint _totalSupply) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply * 10 ** decimals());
    }
}
