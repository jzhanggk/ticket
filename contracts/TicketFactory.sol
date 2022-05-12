pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketNFT.sol";
import "./TicketMarket.sol";
import "./GogoToken.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract TicketsFactory is Ownable {
    struct Festival {
        string festName;
        string festSymbol;
        uint256 ticketPrice;
        uint256 totalSupply;
        address marketplace;
    }
    address[] private activeFests;
    mapping(address => Festival) private activeFestsMapping;
    mapping(address => Festival) private activeCustomer; // make change

    event Created(address ntfAddress, address marketplaceAddress);
    function createNewFest(
        GogoToken token,
        string memory festName,
        string memory festSymbol,
        uint256 ticketPrice,
        uint256 totalSupply
    ) public returns (address) {
        TicketNFT newFest =
            new TicketNFT(
                festName,
                festSymbol,
                ticketPrice,
                totalSupply,
                msg.sender
            );

        TicketMarket newMarketplace =
            new TicketMarket(token, newFest);

        address newFestAddress = address(newFest);

        activeFests.push(newFestAddress);
        activeFestsMapping[newFestAddress] = Festival({
            festName: festName,
            festSymbol: festSymbol,
            ticketPrice: ticketPrice,
            totalSupply: totalSupply,
            marketplace: address(newMarketplace)
        });
        emit Created(newFestAddress, address(newMarketplace));
        return newFestAddress;
    }
    function getActiveFests() public view returns (address[] memory) {
        return activeFests;
    }
    function getFestDetails(address festAddress)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            address
        )
    {
        return (
            activeFestsMapping[festAddress].festName,
            activeFestsMapping[festAddress].festSymbol,
            activeFestsMapping[festAddress].ticketPrice,
            activeFestsMapping[festAddress].totalSupply,
            activeFestsMapping[festAddress].marketplace
        );
    }
}