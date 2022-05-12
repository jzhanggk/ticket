pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketNFT is Context, AccessControl, ERC721 {
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    using Counters for Counters.Counter;

    Counters.Counter private _ticketIds;
    Counters.Counter private _saleTicketIndex;
    Counters.Counter private _lottTicketIndex;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct TicketDetails {
        uint256 purchasePrice;
        uint256 sellingPrice;
        bool forSale;
        bool canTransfer;
        string status;
    }

    address private _organiser;
    address[] private customers;
    uint256[] private ticketsForSale;
    uint256[] private ticketsForBulk;
    uint256[] private ticketsForLott;
    uint256 private _ticketPrice;
    uint256 private _totalSupply;
    uint256 private _lotteryNo;

    mapping(uint256 => TicketDetails) private _ticketDetails;
    mapping(address => uint256[]) private purchasedTickets;

    constructor(
        string memory festName,
        string memory FestSymbol,
        uint256 ticketPrice,
        uint256 totalSupply,
        address organiser
    ) public ERC721(festName, FestSymbol) {
        _setupRole(MINTER_ROLE, organiser);

        _ticketPrice = ticketPrice;
        _totalSupply = totalSupply;
        _organiser = organiser;
    }

    modifier isValidTicketCount {
        require(
            _ticketIds.current() < _totalSupply,
            "Maximum ticket limit exceeded!"
        );
        _;
    }

    modifier isMinterRole {
        require(
            // hasRole(MINTER_ROLE, _organiser),
            hasRole(MINTER_ROLE, _msgSender()),
            "User must have minter role to mint"
        );
        _;
    }

    modifier isValidSellAmount(uint256 ticketId) {
        uint256 purchasePrice = _ticketDetails[ticketId].purchasePrice;
        uint256 sellingPrice = _ticketDetails[ticketId].sellingPrice;

        require(
            purchasePrice + ((purchasePrice * 110) / 100) > sellingPrice,
            "Re-selling price is more than 110%"
        );
        _;
    }

    /*
     * Mint new tickets and assign it to operator
     * Access controlled by minter only
     * Returns new ticketId
     */
    function mint(address operator)
        internal
        virtual
        isMinterRole
        returns (uint256)
    {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        ticketsForBulk.push(newTicketId);

        _mint(operator, newTicketId);

        _ticketDetails[newTicketId] = TicketDetails({
            purchasePrice: _ticketPrice,
            sellingPrice: 0,
            forSale: false,
            canTransfer: true,
            status: "Waiting For First Sale"
        });

        return newTicketId;
    }

    /*
     * Mint new tickets and assign it to operator
     * Access controlled by minter only
     * Returns new ticketId
     */
    function lotteryMint(address operator)
        internal
        virtual
        isMinterRole
        returns (uint256)
    {
        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();
        ticketsForLott.push(newTicketId);

        _mint(operator, newTicketId);

        _ticketDetails[newTicketId] = TicketDetails({
            purchasePrice: _ticketPrice,
            sellingPrice: 0,
            forSale: false,
            canTransfer: false,
            status: "Lottery Ticket Cannot Resell"
        });

        return newTicketId;
    }

    /*
     * Bulk mint specified number of tickets to assign it to a operator
     * Modifier to check the ticket count is less than total supply
     */
    function bulkMintTickets(uint256 numOfTickets, address operator)
        public
        virtual
        isValidTicketCount
    {
        require(
            (ticketCounts() + numOfTickets) <= 1000,
            "Number of tickets exceeds maximum ticket count"
        );

        for (uint256 i = 0; i < numOfTickets; i++) {
            mint(operator);
        }
    }
    /*
     * Bulk mint specified number of tickets to assign it to a operator
     * The tickets for lottery cannot be transfered
     * Modifier to check the ticket count is less than total supply
     */
    function bulkLotteryTickets(uint256 numOfTickets, address operator)
        public
        virtual
        isValidTicketCount
    {
        require(
            (ticketCounts() + numOfTickets) <= 1000,
            "Number of tickets exceeds maximum ticket count"
        );

        _lotteryNo = numOfTickets;

        for (uint256 i = 0; i < numOfTickets; i++) {
            lotteryMint(operator);
        }
    }

    /*
     * Primary purchase for the tickets
     * Adds new customer if not exists
     * Adds buyer to tickets mapping
     * Update ticket details
     */
    function transferLotteryTicket(address buyer) public {
        uint256 lottTicketIndex = _lottTicketIndex.current();
        uint256 lottTicketId = ticketsForLott[lottTicketIndex];
        _lottTicketIndex.increment();

        require(
            // buyer != ownerOf(saleTicketId),
            msg.sender == ownerOf(lottTicketId),
            "Only initial purchase allowed"
        );
        approve(buyer, lottTicketId);
        transferFrom(ownerOf(lottTicketId), buyer, lottTicketId);

        if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }
        purchasedTickets[buyer].push(lottTicketId);

    }

    /*
     * Lottery for the tickets
     * Adds buyer to tickets mapping
     * Update ticket details
     */
    function transferTicket(address buyer) public {
        uint256 saleTicketIndex = _saleTicketIndex.current();
        uint256 saleTicketId = ticketsForBulk[saleTicketIndex];
        _saleTicketIndex.increment();
        require(
            // buyer != ownerOf(saleTicketId),
            msg.sender == ownerOf(saleTicketId),
            "Only initial purchase allowed"
        );
        approve(buyer, saleTicketId);
        transferFrom(ownerOf(saleTicketId), buyer, saleTicketId);

        if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }
        purchasedTickets[buyer].push(saleTicketId);

    }

    /*
     * Secondary purchase for the tickets
     * Modifier to validate that the selling price shouldn't exceed 110% of purchase price for peer to peer transfers
     * Adds new customer if not exists
     * Adds buyer to tickets mapping
     * Remove ticket from the seller and from sale
     * Update ticket details
     */
    function secondaryTransferTicket(address buyer, uint256 saleTicketId)
        public
        isValidSellAmount(saleTicketId)
    {
        address seller = ownerOf(saleTicketId);
        uint256 sellingPrice = _ticketDetails[saleTicketId].sellingPrice;

        transferFrom(seller, buyer, saleTicketId);

        if (!isCustomerExist(buyer)) {
            customers.push(buyer);
        }

        purchasedTickets[buyer].push(saleTicketId);

        removeTicketFromCustomer(seller, saleTicketId);
        removeTicketFromSale(saleTicketId);

        _ticketDetails[saleTicketId] = TicketDetails({
            purchasePrice: sellingPrice,
            sellingPrice: 0,
            forSale: false,
            canTransfer: false,
            status: "Transfered to others"
        });
    }

    /*
     * Add ticket for sale with its details
     * Validate that the selling price shouldn't exceed 110% of purchase price
     * Organiser can not use secondary market sale
     */
    function setSaleDetails(
        uint256 ticketId,
        uint256 sellingPrice,
        address operator
    ) public {
        uint256 purchasePrice = _ticketDetails[ticketId].purchasePrice;

        require(
            _ticketDetails[ticketId].canTransfer,
            "The ticket cannot be re-sell"
        );

        require(
            purchasePrice * 130 / 100 > sellingPrice,
            "Re-selling price is more than 130%"
        );

        // Should not be an organiser
        require(
            !hasRole(MINTER_ROLE, _msgSender()),
            "Functionality only allowed for secondary market"
        );

        _ticketDetails[ticketId].sellingPrice = sellingPrice;
        _ticketDetails[ticketId].forSale = true;
        _ticketDetails[ticketId].canTransfer = false;
        _ticketDetails[ticketId].status = "Waiting For Re-sell";

        if (!isSaleTicketAvailable(ticketId)) {
            ticketsForSale.push(ticketId);
        }

        approve(operator, ticketId);
    }

    // Get ticket actual price
    function getTicketPrice() public view returns (uint256) {
        return _ticketPrice;
    }

    // Get organiser's address
    function getOrganiser() public view returns (address) {
        return _organiser;
    }

    // Get current ticketId
    function ticketCounts() public view returns (uint256) {
        return _ticketIds.current();
    }

    // Get current ticketId
    function getLotteryNo() public view returns (uint256) {
        return _lotteryNo;
    }

    // Get next sale ticketId
    function getNextSaleTicketId() public view returns (uint256) {
        return ticketsForSale[_saleTicketIndex.current()];
    }

    // Get selling price for the ticket
    function getSellingPrice(uint256 ticketId) public view returns (uint256) {
        return _ticketDetails[ticketId].sellingPrice;
    }

    // Get all tickets available for sale
    function getTicketsForSale() public view returns (uint256[] memory) {
        return ticketsForSale;
    }
    
    function getTicketsForBulk() public view returns (uint256[] memory) {
        return ticketsForBulk;
    }
    // Get all tickets available for sale
    function getTicketsForLott() public view returns (uint256[] memory) {
        return ticketsForLott;
    }

    // Get ticket details
    function getTicketDetails(uint256 ticketId)
        public
        view
        returns (
            uint256 purchasePrice,
            uint256 sellingPrice,
            bool forSale,
            bool canTransfer,
            string memory status
        )
    {
        return (
            _ticketDetails[ticketId].purchasePrice,
            _ticketDetails[ticketId].sellingPrice,
            _ticketDetails[ticketId].forSale,
            _ticketDetails[ticketId].canTransfer,
            _ticketDetails[ticketId].status
        );
    }
    function getBulkLeft()
        public
        view
        returns (uint256)
    {
        return ticketsForBulk.length - _saleTicketIndex.current();
    }

    function getLottLeft()
        public
        view
        returns (uint256)
    {
        return ticketsForLott.length - _lottTicketIndex.current();
    }
    function transfromLottToBulk()
        public
    {
        for(uint256 i=0; i<ticketsForLott.length; i++){
            ticketsForBulk.push(ticketsForLott[i]);
            ticketsForLott[i] = ticketsForLott[ticketsForLott.length - 1];
            ticketsForLott.pop();
        }
    }

    // Get all tickets owned by a customer
    function getTicketsOfCustomer(address customer)
        public
        view
        returns (uint256[] memory)
    {
        return purchasedTickets[customer];
    }

    // Utility function to check if customer exists to avoid redundancy
    function isCustomerExist(address buyer) public view returns (bool) {
        for (uint256 i = 0; i < customers.length; i++) {
            if (customers[i] == buyer) {
                return true;
            }
        }
        return false;
    }

    // Utility function used to check if ticket is already for sale
    function isSaleTicketAvailable(uint256 ticketId)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < ticketsForSale.length; i++) {
            if (ticketsForSale[i] == ticketId) {
                return true;
            }
        }
        return false;
    }

    // Utility function to remove ticket owned by customer from customer to ticket mapping
    function removeTicketFromCustomer(address customer, uint256 ticketId)
        internal
    {
        uint256 numOfTickets = getTicketsOfCustomer(customer).length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (purchasedTickets[customer][i] == ticketId) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    purchasedTickets[customer][j - 1] = purchasedTickets[customer][j];
                }
                purchasedTickets[customer].pop();
            }
        }
    }

    // Utility function to remove ticket from sale list
    function removeTicketFromSale(uint256 ticketId) internal {
        uint256 numOfTickets = ticketsForSale.length;

        for (uint256 i = 0; i < numOfTickets; i++) {
            if (ticketsForSale[i] == ticketId) {
                for (uint256 j = i + 1; j < numOfTickets; j++) {
                    ticketsForSale[j - 1] = ticketsForSale[j];
                }
                ticketsForSale.pop();
            }
        }
    }
}


