const { providers } = require("ethers");
const hre = require("hardhat");

async function main() {
    const [organizer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        organizer.address
    );
    await run("compile");
    // console.log("Account balance:", (await deployer.getBalance()).toString());
    //
    // const Token = await hre.ethers.getContractFactory("GogoToken");
    // const token = await Token.deploy();
    // await token.deployed();
    // console.log("token address: ", token.address)

    const TicketsFactory = await hre.ethers.getContractFactory("TicketsFactory");
    const factory = await TicketsFactory.deploy();
    await factory.deployed()
    console.log("factory address: ", factory.address)

    // const NFT = await hre.ethers.getContractFactory("TicketNFT");
    // const nft = await NFT.deploy("Jay Chow Concert", "Jay", 100, 1000, organizer.address);
    // await nft.deployed();
    //
    // console.log("nft address: ", nft.address)
    //
    // const Market = await hre.ethers.getContractFactory("TicketMarket");
    // const market = await Market.deploy("0xCA67220Fe68B922A7a643860df1de2AD3FAdcD9c", nft.address);
    // await market.deployed();
    // console.log("market address: ", market.address)



    // const tokenProvider = hre.ethers.providers.JsonRpcProvider("https://rpc.debugchain.net/")
    // const contractAddress = new hre.ethers.Contract("0xCA67220Fe68B922A7a643860df1de2AD3FAdcD9c", abi,tokenProvider)
    // console.log("Factory address:", factory.address);
    // console.log("Market address:", market.address);
    // console.log("NFT address:", nft.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });