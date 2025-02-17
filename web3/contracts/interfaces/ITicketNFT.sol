// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/TicketLib.sol";

interface ITicketNFT {
    function mint(address to, TicketLib.Ticket memory ticket) external returns (uint256);
    function getTicketDetails(uint256 tokenId) external view returns (TicketLib.Ticket memory);
} 