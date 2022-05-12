const { providers } = require("ethers");
const hre = require("hardhat");
const config = require('../Client/nextjs-blog/config.json');

async function main() {
    let myAccount = await ethers.getSigners();
    console.log(myAccount)
    let privateKey = config['private_key']
    let privateKey1 = config['private_key2'] // make change
    let privateKey2 = config['private_key3'] // make change
    let network = config['network']
    let address = config['address']

    let token_address = config['token_address']
    let factory_address = config['factory_address']
    let nft_address = config['nft_address']
    let market_address = config['market_address']

    let provider = ethers.getDefaultProvider(network);
    let wallet = new ethers.Wallet(privateKey , provider);
    let wallet1 = new ethers.Wallet(privateKey1 , provider); // make change
    let wallet2 = new ethers.Wallet(privateKey2 , provider); // make change

    let token_ct = require('../artifacts/contracts/GogoToken.sol/GogoToken.json');
    let token_abi = token_ct.abi;
    let token = new ethers.Contract(token_address , token_abi , wallet);
    // let token1 = new ethers.Contract( token_address , token_abi , wallet1 );

    let balancePromise = token.balanceOf(wallet.address);
    
    balancePromise.then((balance) => {
        console.log(ethers.utils.formatEther(balance));
    });
    // for (let i=0;i < 100;i++){
    //     await token.functions.transfer(wallet1.address, 10000000000) //make change
    // }
    await token.functions.transfer(wallet2.address, 1000)
    let balancePromise1 = token.balanceOf(wallet2.address);

    balancePromise1.then((balance) => {
        console.log(ethers.utils.formatEther(balance));
    });
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });