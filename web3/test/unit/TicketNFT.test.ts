import { expect } from "chai";
import { ethers } from "hardhat";
import { TicketNFT } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TicketNFT", function () {
  let ticketNFT: TicketNFT;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const TicketNFTFactory = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFTFactory.deploy();
  });

  it("Should mint a new ticket", async function () {
    const ticket = {
      eventId: 1,
      price: ethers.parseEther("0.1"),
      validUntil: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
      seatNumber: "A1",
      isUsed: false
    };

    await ticketNFT.mint(user.address, ticket);
    expect(await ticketNFT.ownerOf(0)).to.equal(user.address);
  });
}); 