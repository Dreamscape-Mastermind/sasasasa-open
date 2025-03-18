


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket1155 is ERC1155, Ownable {
    struct Ticket { 
        uint256 maxSupply;
        uint256 totalMinted;
        uint256 price;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 public ticketTypeCount;

    event TicketMinted(address indexed buyer, uint256 ticketType, uint256 amount);

    constructor(string memory uri, uint256[] memory maxSupplies, uint256[] memory prices) ERC1155(uri) Ownable(msg.sender) {
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

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
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
}
