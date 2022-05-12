import config from "../../config.json"
import ethers from "ethers";

export default function handler(req, res) {

    const ethers = require('ethers');
    const config = require('../../config.json');
    let privateKey = config['private_key']
    let network = config['network']
    let address = config['address']
    let test_json = require('../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
    let provider = new ethers.providers.JsonRpcProvider(network)
    res.status(200).json({ provider: provider })
}
