// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SasasasaEvent is ERC1155, AccessControl, Pausable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
    bytes32 public constant EVENT_MANAGER_ROLE = keccak256("EVENT_MANAGER_ROLE");
    
    struct Ticket { 
        uint256 maxSupply; // Should we set an upper limit for the max supply? What should it be?
        uint256 totalMinted;
        uint256 price;
    }

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => Ticket) public tickets;
    uint256 public ticketTypeCount;

    event TicketMinted(address indexed buyer, uint256 ticketType, uint256 amount);
    event EventManagerAdded(address indexed account);
    event EventManagerRemoved(address indexed account);
    event FundsWithdrawn(
        address platformWallet,
        uint256 platformAmount,
        address eventOrganizer,
        uint256 organizerAmount
    );
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformWalletUpdated(address newWallet);
    event EventOrganizerUpdated(address newOrganizer);
    event TicketTypeAdded(uint256 indexed ticketType, uint256 maxSupply, uint256 price);
    event TokenURIUpdated(uint256 indexed tokenId, string newUri);
    event ContractPaused(address account);
    event ContractUnpaused(address account);
    event TicketPriceUpdated(uint256 indexed ticketType, uint256 newPrice);

    uint256 public platformFeePercentage; // e.g., 250 means 2.5%
    address public platformWallet;
    address public eventOrganizer;

    constructor(
        string memory _uri, 
        uint256[] memory maxSupplies, 
        uint256[] memory prices,
        address platformAdmin,
        address _eventOrganizer,
        address _platformWallet,
        uint256 _platformFeePercentage
    ) ERC1155(_uri) {
        require(maxSupplies.length == prices.length, "Mismatched array lengths");
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, platformAdmin);
        _grantRole(PLATFORM_ADMIN_ROLE, platformAdmin);
        _grantRole(EVENT_MANAGER_ROLE, platformAdmin);

        ticketTypeCount = maxSupplies.length;
        
        for (uint256 i = 0; i < ticketTypeCount; i++) {
            tickets[i] = Ticket({
                maxSupply: maxSupplies[i],
                totalMinted: 0,
                price: prices[i]
            });
        }

        eventOrganizer = _eventOrganizer;
        platformWallet = _platformWallet;
        platformFeePercentage = _platformFeePercentage;

        require(_platformFeePercentage <= 1000, "Fee too high"); // Max 10%
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_eventOrganizer != address(0), "Invalid event organizer");
    }

    // Role management functions
    function addEventManager(address account) external onlyRole(PLATFORM_ADMIN_ROLE) {
        grantRole(EVENT_MANAGER_ROLE, account);
        emit EventManagerAdded(account);
    }

    function removeEventManager(address account) external onlyRole(PLATFORM_ADMIN_ROLE) {
        revokeRole(EVENT_MANAGER_ROLE, account);
        emit EventManagerRemoved(account);
    }

    // Modified existing functions with role checks
    function addTicketType(uint256 maxSupply, uint256 price) external onlyRole(EVENT_MANAGER_ROLE) {
        tickets[ticketTypeCount] = Ticket({
            maxSupply: maxSupply,
            totalMinted: 0,
            price: price
        });
        ticketTypeCount++;
        emit TicketTypeAdded(ticketTypeCount - 1, maxSupply, price);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) external onlyRole(EVENT_MANAGER_ROLE) {
        _tokenURIs[tokenId] = tokenURI;
        emit TokenURIUpdated(tokenId, tokenURI);
    }

    // Replace the withdraw function with this
    function withdraw() external onlyRole(PLATFORM_ADMIN_ROLE) nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // Calculate platform fee
        uint256 platformFee = (balance * platformFeePercentage) / 10000;
        uint256 organizerShare = balance - platformFee;

        // Send platform fee
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");

        // Send remaining funds to event organizer
        (bool organizerSuccess, ) = eventOrganizer.call{value: organizerShare}("");
        require(organizerSuccess, "Organizer transfer failed");

        emit FundsWithdrawn(platformWallet, platformFee, eventOrganizer, organizerShare);
    }

    // Existing functions remain unchanged
    function mint(uint256 ticketType, uint256 amount) external payable whenNotPaused {
        require(ticketType < ticketTypeCount, "Invalid ticket type");
        require(tickets[ticketType].totalMinted + amount <= tickets[ticketType].maxSupply, "Exceeds max supply");
        require(msg.value == tickets[ticketType].price * amount, "Incorrect ETH sent");

        tickets[ticketType].totalMinted += amount;
        _mint(msg.sender, ticketType, amount, "");

        emit TicketMinted(msg.sender, ticketType, amount);
    }

    function getTicketPrice(uint256 ticketType) external view returns (uint256) {
        return tickets[ticketType].price;
    }

    function remainingTickets(uint256 ticketType) external view returns (uint256) {
        return tickets[ticketType].maxSupply - tickets[ticketType].totalMinted;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function togglePause() external onlyRole(PLATFORM_ADMIN_ROLE) {
        if (paused()) {
            _unpause();
            emit ContractUnpaused(msg.sender);
        } else {
            _pause();
            emit ContractPaused(msg.sender);
        }
    }

    function updatePlatformFee(uint256 newFee) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function updatePlatformWallet(address newWallet) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
        emit PlatformWalletUpdated(newWallet);
    }

    function updateEventOrganizer(address newOrganizer) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newOrganizer != address(0), "Invalid address");
        eventOrganizer = newOrganizer;
        emit EventOrganizerUpdated(newOrganizer);
    }

    function updateTicketPrice(uint256 ticketType, uint256 newPrice) 
        external 
        onlyRole(EVENT_MANAGER_ROLE) 
    {
        require(ticketType < ticketTypeCount, "Invalid ticket type");
        tickets[ticketType].price = newPrice;
        emit TicketPriceUpdated(ticketType, newPrice);
    }

    function batchMint(
        uint256[] calldata ticketTypes,
        uint256[] calldata amounts
    ) external payable whenNotPaused {
        require(ticketTypes.length == amounts.length, "Array length mismatch");
        
        uint256 totalCost = 0;
        for(uint256 i = 0; i < ticketTypes.length; i++) {
            require(ticketTypes[i] < ticketTypeCount, "Invalid ticket type");
            totalCost += tickets[ticketTypes[i]].price * amounts[i];
        }
        require(msg.value == totalCost, "Incorrect ETH sent");

        for(uint256 i = 0; i < ticketTypes.length; i++) {
            tickets[ticketTypes[i]].totalMinted += amounts[i];
            _mint(msg.sender, ticketTypes[i], amounts[i], "");
            emit TicketMinted(msg.sender, ticketTypes[i], amounts[i]);
        }
    }

    function getTicketDetails(uint256 ticketType) 
        external 
        view 
        returns (
            uint256 maxSupply,
            uint256 totalMinted,
            uint256 price,
            uint256 remaining
        ) 
    {
        require(ticketType < ticketTypeCount, "Invalid ticket type");
        Ticket memory ticket = tickets[ticketType];
        return (
            ticket.maxSupply,
            ticket.totalMinted,
            ticket.price,
            ticket.maxSupply - ticket.totalMinted
        );
    }

    function hasRole(address account, bytes32 role) 
        external 
        view 
        returns (bool) 
    {
        return hasRole(role, account);
    }
}