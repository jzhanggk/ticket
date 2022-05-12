pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GogoToken is ERC20 {
    uint256 public total = 100000;
    address public owner;

    constructor() ERC20("GogoToken", "GTK") {
        _mint(msg.sender, total * 10 ** decimals());
        owner = msg.sender;
    }


}