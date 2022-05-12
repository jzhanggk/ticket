import styles from '../styles/layout.module.css'
import Link from "next/link";
import React, { useState,useEffect , Component} from "react";
import TicketNFT_ct from "../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json";
import TicketMarket_ct from "../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json";
import Router from "next/router";
const ethers = require('ethers');
const config = require('../config.json');
let privateKey = config['private_key']
let network = config['network']
let address = config['address']

let token_address = config['token_address']
let factory_address = config['factory_address']

let provider = ethers.getDefaultProvider(network);
let wallet = new ethers.Wallet(privateKey , provider);

let token_ct = require('../../../artifacts/contracts/GogoToken.sol/GogoToken.json');
let token_abi = token_ct.abi;
let token = new ethers.Contract( token_address , token_abi , wallet );

let TicketFactory_ct = require('../../../artifacts/contracts/TicketFactory.sol/TicketsFactory.json');
let TicketFactory_abi = TicketFactory_ct.abi;
let TicketFactory = new ethers.Contract( factory_address , TicketFactory_abi , wallet );
class Purchase extends Component {
    constructor() {
        super();

        this.state = {
            festivals: [],
        };
    }
    //
    async componentDidMount() {
        await this.updateFestivals();
    }
    updateFestivals = async () => {
        try {
            const activeFests = await TicketFactory.functions.getActiveFests()
            let fests = await Promise.all(activeFests
                .map(async test => {
                    return await Promise.all(test.map(
                        async ticket => {

                            async function handleClick(e){
                                e.preventDefault()
                                let TicketMarket_ct = require('../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
                                let TicketMarket_abi = TicketMarket_ct.abi;
                                let TicketsMartket = new ethers.Contract( MarketPlace, TicketMarket_abi, wallet);
                                // await TicketsMartket.connect(wallet2).functions.purchaseTicket();
                                let [organiser] = Object.values(await TicketNFT.functions.getOrganiser())
                                // let [organiser_2] = Object.values(await TicketNFT.functions.getOrganiser())
                                console.log(organiser)
                                await TicketsMartket.connect(wallet).functions.lotteryTicket()
                                const players = await TicketsMartket.connect(wallet).functions.getPlayers()
                                console.log(players)
                                Router.reload(window.location.pathname)

                            }

                            const festDetails = await TicketFactory.functions.getFestDetails(ticket)
                            const [TicketName, TicketSymbol, TicketPrice, totalSupply, MarketPlace] = Object.values(festDetails);

                            let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
                            let TicketNFT_abi = TicketNFT_ct.abi;
                            let TicketNFT = new ethers.Contract( ticket , TicketNFT_abi , wallet );

                            let TicketMarket_ct = require('../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
                            let TicketMarket_abi = TicketMarket_ct.abi;
                            let TicketsMartket = new ethers.Contract( MarketPlace, TicketMarket_abi , wallet );

                            let [organiser] = Object.values(await TicketNFT.functions.getOrganiser())
                            let ticketsForLott = await TicketNFT.functions.getTicketsForLott()
                            let lottNumber = await TicketNFT.functions.getLottLeft()
                            if(organiser == wallet.address && lottNumber != 0){
                                let tmp = (
                                    <tr>

                                        <td class="center">{TicketName}</td>

                                        <td class="center">{TicketSymbol}</td>
                                        <td class="center">{lottNumber.toString()}</td>
                                        {/*<td class="center"><button type="submit" className="custom-btn login-btn" >Buy</button></td>*/}
                                        <td><button type="button"  TicketName = {TicketName} TicketSymbol = {TicketSymbol} lottNumber = {lottNumber} className="btn btn-primary" onClick={handleClick}>Submit</button></td>
                                    </tr>
                                )

                                return tmp
                            }
                            else{
                                return (
                                    <tr>

                                    </tr>
                                )
                            }

                        }

                    ))


                }))
            this.setState({ festivals: fests });
        } catch (err) {
            // renderNotification('danger', 'Error', err.message);
            console.log('Error while updating the fetivals', err);
        }
    }
    //
    onPurchaseTicket = async (marketplace, ticketPrice, initiator) => {
        // try {
        //     const marketplaceInstance = await FestivalMarketplace(marketplace);
        //     await festToken.methods.approve(marketplace, ticketPrice).send({ from: initiator, gas: 6700000 });
        //     await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000 });
        //     await this.updateFestivals();
        //
        //     renderNotification('success', 'Success', `Ticket for the Festival purchased successfully!`);
        // } catch (err) {
        //     console.log('Error while creating new festival', err);
        //     renderNotification('danger', 'Error', err.message);
        // }
    }

    inputChangedHandler = (e) => {
        const state = this.state;
        state[e.target.name] = e.target.value;
        this.setState(state);
    }

    render() {
        return (
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Lottery</h1>
                </header>

                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Symbol</th>
                        <th scope="col">Lottery Number</th>
                        <th scope="col">Lottery</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.festivals}
                    </tbody>
                </table>
                <h2>
                    <Link href="/main">
                        <a>Back to home</a>
                    </Link>
                </h2>
                {/*</div>*/}
            </main>
        )
    }
}
export default Purchase;