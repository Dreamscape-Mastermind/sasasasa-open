// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ITicketNFT.sol";
import "../libraries/TicketLib.sol";

contract TicketNFT is ERC721, Ownable {
    using TicketLib for TicketLib.Ticket;
    
    mapping(uint256 => TicketLib.Ticket) private _tickets;
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("Event Ticket", "TCKT") Ownable(msg.sender) {}
    
    function mint(address to, TicketLib.Ticket memory ticket) 
        external 
        onlyOwner 
        returns (uint256) 
    {
        uint256 tokenId = _tokenIdCounter++;
        _tickets[tokenId] = ticket;
        _safeMint(to, tokenId);
        return tokenId;
    }
    
    function getTicketDetails(uint256 tokenId) 
        external 
        view 
        returns (TicketLib.Ticket memory) 
    {
        return _tickets[tokenId];
    }
} 