// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TicketLib {
    struct Ticket {
        uint256 eventId;
        uint256 price;
        uint256 validUntil;
        string seatNumber;
        bool isUsed;
    }
    
    function isValid(Ticket memory ticket) internal view returns (bool) {
        return !ticket.isUsed && block.timestamp <= ticket.validUntil;
    }
} 