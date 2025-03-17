const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SasasasaEvent", function () {
  // Fixture for contract deployment
  async function deployTicketFixture() {
    const [owner, platformAdmin, eventOrganizer, platformWallet, user1, user2] = await ethers.getSigners();
    
    const maxSupplies = [100, 200, 300];
    const prices = [
      ethers.parseEther("0.1"),
      ethers.parseEther("0.2"),
      ethers.parseEther("0.3")
    ];
    
    const platformFeePercentage = 150; // 2.5%
    const baseURI = "https://api.example.com/token/"; // TODO set this to the actual baseURI based on API ENV var
    
    const SasasasaEvent = await ethers.getContractFactory("SasasasaEvent");
    const ticket = await SasasasaEvent.deploy(
      baseURI,
      maxSupplies,
      prices,
      platformAdmin.address,
      eventOrganizer.address,
      platformWallet.address,
      platformFeePercentage
    );
    
    await ticket.waitForDeployment();
    
    return {
      ticket,
      owner,
      platformAdmin,
      eventOrganizer,
      platformWallet,
      user1,
      user2,
      maxSupplies,
      prices,
      platformFeePercentage,
      baseURI
    };
  }

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const { ticket, platformAdmin, eventOrganizer, platformWallet, maxSupplies, prices, platformFeePercentage } = await loadFixture(deployTicketFixture);
      
      const DEFAULT_ADMIN_ROLE = await ticket.DEFAULT_ADMIN_ROLE();
      const PLATFORM_ADMIN_ROLE = await ticket.PLATFORM_ADMIN_ROLE();
      const EVENT_MANAGER_ROLE = await ticket.EVENT_MANAGER_ROLE();
      
      expect(await ticket["hasRole(bytes32,address)"](DEFAULT_ADMIN_ROLE, platformAdmin.address)).to.be.true;
      expect(await ticket["hasRole(bytes32,address)"](PLATFORM_ADMIN_ROLE, platformAdmin.address)).to.be.true;
      expect(await ticket["hasRole(bytes32,address)"](EVENT_MANAGER_ROLE, platformAdmin.address)).to.be.true;
      expect(await ticket.platformFeePercentage()).to.equal(platformFeePercentage);
      expect(await ticket.platformWallet()).to.equal(platformWallet.address);
      expect(await ticket.eventOrganizer()).to.equal(eventOrganizer.address);
      expect(await ticket.ticketTypeCount()).to.equal(maxSupplies.length);
      
      // Verify ticket types
      for (let i = 0; i < maxSupplies.length; i++) {
        const details = await ticket.getTicketDetails(i);
        expect(details.maxSupply).to.equal(maxSupplies[i]);
        expect(details.price).to.equal(prices[i]);
        expect(details.totalMinted).to.equal(0);
        expect(details.remaining).to.equal(maxSupplies[i]);
      }
    });

    it("Should revert with invalid constructor parameters", async function () {
      const { platformAdmin, eventOrganizer, platformWallet } = await loadFixture(deployTicketFixture);
      const SasasasaEvent = await ethers.getContractFactory("SasasasaEvent");
      
      const maxSupplies = [100, 200];
      const prices = [ethers.parseEther("0.1")]; // Mismatched lengths
      
      await expect(
        SasasasaEvent.deploy(
          "https://api.example.com/token/",
          maxSupplies,
          prices,
          platformAdmin.address,
          eventOrganizer.address,
          platformWallet.address,
          250
        )
      ).to.be.revertedWith("Mismatched array lengths");
      
      await expect(
        SasasasaEvent.deploy(
          "https://api.example.com/token/",
          [100, 200],
          [ethers.parseEther("0.1"), ethers.parseEther("0.2")],
          platformAdmin.address,
          eventOrganizer.address,
          platformWallet.address,
          1100 // Fee too high
        )
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Role Management", function () {
    it("Should allow platform admin to add and remove event managers", async function () {
      const { ticket, platformAdmin, user1 } = await loadFixture(deployTicketFixture);
      
      const EVENT_MANAGER_ROLE = await ticket.EVENT_MANAGER_ROLE();
      
      await expect(ticket.connect(platformAdmin).addEventManager(user1.address))
        .to.emit(ticket, "EventManagerAdded")
        .withArgs(user1.address);
      
      expect(await ticket["hasRole(bytes32,address)"](EVENT_MANAGER_ROLE, user1.address)).to.be.true;
      
      await expect(ticket.connect(platformAdmin).removeEventManager(user1.address))
        .to.emit(ticket, "EventManagerRemoved")
        .withArgs(user1.address);
      
      expect(await ticket["hasRole(bytes32,address)"](EVENT_MANAGER_ROLE, user1.address)).to.be.false;
    });

    it("Should not allow non-admin to manage roles", async function () {
      const { ticket, user1, user2 } = await loadFixture(deployTicketFixture);
      
      await expect(ticket.connect(user1).addEventManager(user2.address))
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
      
      await expect(ticket.connect(user1).removeEventManager(user2.address))
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Ticket Operations", function () {
    it("Should allow users to mint tickets with correct payment", async function () {
      const { ticket, user1, prices } = await loadFixture(deployTicketFixture);
      
      const ticketType = 0;
      const amount = BigInt(2);
      const totalCost = prices[ticketType] * amount;
      
      await expect(ticket.connect(user1).mint(ticketType, amount, { value: totalCost }))
        .to.emit(ticket, "TicketMinted")
        .withArgs(user1.address, ticketType, amount);
      
      const details = await ticket.getTicketDetails(ticketType);
      expect(details.totalMinted).to.equal(amount);
      expect(details.remaining).to.equal(details.maxSupply - amount);
      
      expect(await ticket.balanceOf(user1.address, ticketType)).to.equal(amount);
    });

    it("Should allow batch minting of different ticket types", async function () {
      const { ticket, user1, prices } = await loadFixture(deployTicketFixture);
      
      const ticketTypes = [0, 1];
      const amounts = [2, 3];
      let totalCost = BigInt(0);
      
      for (let i = 0; i < ticketTypes.length; i++) {
        totalCost += prices[ticketTypes[i]] * BigInt(amounts[i]);
      }
      
      await expect(ticket.connect(user1).batchMint(ticketTypes, amounts, { value: totalCost }))
        .to.emit(ticket, "TicketMinted")
        .withArgs(user1.address, ticketTypes[0], amounts[0])
        .to.emit(ticket, "TicketMinted")
        .withArgs(user1.address, ticketTypes[1], amounts[1]);
      
      for (let i = 0; i < ticketTypes.length; i++) {
        expect(await ticket.balanceOf(user1.address, ticketTypes[i])).to.equal(amounts[i]);
      }
    });

    it("Should revert on invalid minting attempts", async function () {
      const { ticket, user1, prices } = await loadFixture(deployTicketFixture);
      
      // Invalid ticket type
      await expect(
        ticket.connect(user1).mint(999, 1, { value: prices[0] })
      ).to.be.revertedWith("Invalid ticket type");
      
      // Insufficient payment
      await expect(
        ticket.connect(user1).mint(0, 1, { value: prices[0] - BigInt(1) })
      ).to.be.revertedWith("Incorrect ETH sent");
      
      // Exceeds max supply
      const maxSupply = (await ticket.getTicketDetails(0)).maxSupply;
      await expect(
        ticket.connect(user1).mint(0, maxSupply + BigInt(1), { value: prices[0] * (maxSupply + BigInt(1)) })
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow platform admin to update fees and wallets", async function () {
      const { ticket, platformAdmin, user1, user2 } = await loadFixture(deployTicketFixture);
      
      const newFee = 300; // 3%
      await expect(ticket.connect(platformAdmin).updatePlatformFee(newFee))
        .to.emit(ticket, "PlatformFeeUpdated")
        .withArgs(newFee);
      expect(await ticket.platformFeePercentage()).to.equal(newFee);
      
      await expect(ticket.connect(platformAdmin).updatePlatformWallet(user1.address))
        .to.emit(ticket, "PlatformWalletUpdated")
        .withArgs(user1.address);
      expect(await ticket.platformWallet()).to.equal(user1.address);
      
      await expect(ticket.connect(platformAdmin).updateEventOrganizer(user2.address))
        .to.emit(ticket, "EventOrganizerUpdated")
        .withArgs(user2.address);
      expect(await ticket.eventOrganizer()).to.equal(user2.address);
    });

    it("Should allow event manager to update ticket prices", async function () {
      const { ticket, platformAdmin, user1 } = await loadFixture(deployTicketFixture);
      
      // First add user1 as event manager
      await ticket.connect(platformAdmin).addEventManager(user1.address);
      
      const newPrice = ethers.parseEther("0.5");
      await expect(ticket.connect(user1).updateTicketPrice(0, newPrice))
        .to.emit(ticket, "TicketPriceUpdated")
        .withArgs(0, newPrice);
      
      const details = await ticket.getTicketDetails(0);
      expect(details.price).to.equal(newPrice);
    });

    it("Should not allow non-admin to update admin settings", async function () {
      const { ticket, user1 } = await loadFixture(deployTicketFixture);
      
      await expect(ticket.connect(user1).updatePlatformFee(300))
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
      
      await expect(ticket.connect(user1).updatePlatformWallet(user1.address))
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
      
      await expect(ticket.connect(user1).updateEventOrganizer(user1.address))
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pausing", function () {
    it("Should allow platform admin to pause and unpause the contract", async function () {
      const { ticket, platformAdmin, user1, prices } = await loadFixture(deployTicketFixture);
      
      await expect(ticket.connect(platformAdmin).togglePause())
        .to.emit(ticket, "ContractPaused")
        .withArgs(platformAdmin.address);
      
      await expect(
        ticket.connect(user1).mint(0, 1, { value: prices[0] })
      ).to.be.revertedWithCustomError(ticket, "EnforcedPause");
      
      await expect(ticket.connect(platformAdmin).togglePause())
        .to.emit(ticket, "ContractUnpaused")
        .withArgs(platformAdmin.address);
      
      await expect(ticket.connect(user1).mint(0, 1, { value: prices[0] }))
        .to.emit(ticket, "TicketMinted");
    });

    it("Should not allow non-admin to pause/unpause", async function () {
      const { ticket, user1 } = await loadFixture(deployTicketFixture);
      
      await expect(ticket.connect(user1).togglePause())
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Withdrawal", function () {
    it("Should correctly distribute funds between platform and organizer", async function () {
      const { ticket, platformAdmin, platformWallet, eventOrganizer, user1, prices } = await loadFixture(deployTicketFixture);
      
      // Mint some tickets to generate funds
      await ticket.connect(user1).mint(0, 2, { value: prices[0] * BigInt(2) });
      
      const initialPlatformBalance = await ethers.provider.getBalance(platformWallet.address);
      const initialOrganizerBalance = await ethers.provider.getBalance(eventOrganizer.address);
      
      await expect(ticket.connect(platformAdmin).withdraw())
        .to.emit(ticket, "FundsWithdrawn");
      
      const finalPlatformBalance = await ethers.provider.getBalance(platformWallet.address);
      const finalOrganizerBalance = await ethers.provider.getBalance(eventOrganizer.address);
      
      // Platform fee is 1.5%, not 2.5%
      const totalFunds = prices[0] * BigInt(2);
      const expectedPlatformFee = (totalFunds * BigInt(150)) / BigInt(10000);
      const expectedOrganizerShare = totalFunds - expectedPlatformFee;
      
      expect(finalPlatformBalance - initialPlatformBalance).to.be.closeTo(
        expectedPlatformFee,
        ethers.parseEther("0.001")
      );
      
      expect(finalOrganizerBalance - initialOrganizerBalance).to.be.closeTo(
        expectedOrganizerShare,
        ethers.parseEther("0.001")
      );
    });

    it("Should not allow non-admin to withdraw funds", async function () {
      const { ticket, user1 } = await loadFixture(deployTicketFixture);
      
      await expect(ticket.connect(user1).withdraw())
        .to.be.revertedWithCustomError(ticket, "AccessControlUnauthorizedAccount");
    });
  });
}); 