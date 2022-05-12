const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
    let SimpleToken;
    let TokenReceiver;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("SimpleToken");
        [owner] = await ethers.getSigners();
        TokenReceiver = await ethers.getContractFactory("TokenReceiver")
        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        token = await Token.deploy();
        receiver = await TokenReceiver.deploy(token.address)
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
          token.increaseAllowance(receiver.address, 1000)
          await receiver.doStuff();
          expect(await token.balanceOf(receiver.address)).to.equal(1000);
        });
    });
});