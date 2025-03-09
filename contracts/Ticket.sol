// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket1155 is ERC1155, Ownable {
    struct Ticket { 
        uint256 maxSupply;
        uint256 totalMinted;
        uint256 price;
    }

    mapping(uint256 => string) private _tokenURIs;

    mapping(uint256 => Ticket) public tickets;
    uint256 public ticketTypeCount;

    event TicketMinted(address indexed buyer, uint256 ticketType, uint256 amount);

    constructor(string memory _uri, uint256[] memory maxSupplies, uint256[] memory prices) ERC1155(_uri) Ownable(msg.sender) {
        require(maxSupplies.length == prices.length, "Mismatched array lengths");
        ticketTypeCount = maxSupplies.length;
        
        for (uint256 i = 0; i < ticketTypeCount; i++) {
            tickets[i] = Ticket({
                maxSupply: maxSupplies[i],
                totalMinted: 0,
                price: prices[i]
            });
        }
    }

    function mint(uint256 ticketType, uint256 amount) external payable {
        require(ticketType < ticketTypeCount, "Invalid ticket type");
        require(tickets[ticketType].totalMinted + amount <= tickets[ticketType].maxSupply, "Exceeds max supply");
        require(msg.value == tickets[ticketType].price * amount, "Incorrect ETH sent");

        tickets[ticketType].totalMinted += amount;
        _mint(msg.sender, ticketType, amount, "");

        emit TicketMinted(msg.sender, ticketType, amount);
    }

    function addTicketType(uint256 maxSupply, uint256 price) external onlyOwner {
        tickets[ticketTypeCount] = Ticket({
            maxSupply: maxSupply,
            totalMinted: 0,
            price: price
            });
        ticketTypeCount++;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getTicketPrice(uint256 ticketType) external view returns (uint256) {
        return tickets[ticketType].price;
    }

    function remainingTickets(uint256 ticketType) external view returns (uint256) {
        return tickets[ticketType].maxSupply - tickets[ticketType].totalMinted;
    }
     

    function setTokenURI(uint256 tokenId, string memory tokenURI) external onlyOwner{
        _tokenURIs[tokenId] = tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}


