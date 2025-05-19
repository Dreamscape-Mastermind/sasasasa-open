// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Ticketv0.2.sol";

contract SasasasaEventFactory {
    address public platformAdmin;
    address public platformWallet;
    uint256 public defaultPlatformFee;
    
    address[] public deployedEvents;
    mapping(address => address[]) public eventManagers;
    
    event EventCreated(
        address indexed eventContract, 
        address indexed eventOrganizer, 
        string uri
    );

    constructor(
        address _platformAdmin,
        address _platformWallet,
        uint256 _defaultPlatformFee
    ) {
        require(_platformAdmin != address(0), "Invalid platform admin");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_defaultPlatformFee <= 1000, "Fee too high"); // Max 10%
        
        platformAdmin = _platformAdmin;
        platformWallet = _platformWallet;
        defaultPlatformFee = _defaultPlatformFee;
    }

    function createEvent(
        string memory uri,
        uint256[] memory maxSupplies,
        uint256[] memory prices,
        address eventOrganizer
    ) external returns (address) {
        SasasasaEvent newEvent = new SasasasaEvent(
            uri,
            maxSupplies,
            prices,
            platformAdmin,
            eventOrganizer,
            platformWallet,
            defaultPlatformFee
        );
        
        deployedEvents.push(address(newEvent));
        eventManagers[eventOrganizer].push(address(newEvent));
        
        emit EventCreated(address(newEvent), eventOrganizer, uri);
        return address(newEvent);
    }

    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }

    function getOrganizerEvents(address _organizer) external view returns (address[] memory) {
        return eventManagers[_organizer];
    }

    // Admin functions
    function updatePlatformAdmin(address _newAdmin) external {
        require(msg.sender == platformAdmin, "Not authorized");
        require(_newAdmin != address(0), "Invalid address");
        platformAdmin = _newAdmin;
    }

    function updatePlatformWallet(address _newWallet) external {
        require(msg.sender == platformAdmin, "Not authorized");
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
    }

    function updateDefaultPlatformFee(uint256 _newFee) external {
        require(msg.sender == platformAdmin, "Not authorized");
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        defaultPlatformFee = _newFee;
    }
} 