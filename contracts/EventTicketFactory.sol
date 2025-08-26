// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EventTicket1155.sol";

contract EventTicketFactory {
    address[] public deployedEvents;
    mapping(address => address[]) public eventManagers;
    event EventCreated(address indexed eventContract, address indexed owner, string uri);

    function createEvent(string memory uri, uint256[] memory maxSupplies, uint256[] memory prices) external {
        EventTicket1155 newEvent = new EventTicket1155(uri, maxSupplies, prices);
        deployedEvents.push(address(newEvent));
        newEvent.transferOwnership(msg.sender);
        eventManagers[msg.sender].push(address(newEvent));
        emit EventCreated(address(newEvent), msg.sender, uri);
    }

    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }

    function getOwnerEvents(address _address) public view returns (address[] memory) {
        return eventManagers[_address];
    }
}
