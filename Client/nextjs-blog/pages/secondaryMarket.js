
import styles from '../styles/layout.module.css'
import Link from "next/link";
import React, { useState,useEffect , Component} from "react";
import TicketNFT_ct from "../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json";
import Router from "next/router";

const ethers = require('ethers');
const config = require('../config.json');
let privateKey3 = config['private_key']
let network = config['network']
let address = config['address']

let token_address = config['token_address']
let factory_address = config['factory_address']

let provider = ethers.getDefaultProvider(network);
let wallet = new ethers.Wallet(privateKey3 , provider);

let token_ct = require('../../../artifacts/contracts/GogoToken.sol/GogoToken.json');
let token_abi = token_ct.abi;
let token = new ethers.Contract( token_address , token_abi , wallet );

let balancePromise = token.balanceOf(wallet.address);

balancePromise.then((balance) => {
    console.log(ethers.utils.formatEther(balance));
});

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
    //
    updateFestivals = async () => {
        try {
            const activeFests = await TicketFactory.functions.getActiveFests()
            let fests = await Promise.all(activeFests
                .map(async test => {
                    return await Promise.all(test.map(
                        async ticket => {
                            // console.log(fest)
                            async function handleClick(e){
                                e.preventDefault()
                                let MarketPlace = e.target.getAttribute('MarketPlace')
                                let TicketName = e.target.getAttribute('TicketName')
                                let TicketSymbol = e.target.getAttribute('TicketSymbol')
                                let TicketID = e.target.getAttribute('TicketID')
                                let Price = e.target.getAttribute('Price')
                                let TicketMarket_ct = require('../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
                                let TicketMarket_abi = TicketMarket_ct.abi;
                                let TicketsMartket = new ethers.Contract( MarketPlace, TicketMarket_abi , wallet );
                                await token.connect(wallet).increaseAllowance(TicketsMartket.address, Price);
                                await TicketsMartket.connect(wallet).secondaryPurchase(TicketID);
                                Router.reload(window.location.pathname)
                            }
                            const TicketDetails = await TicketFactory.functions.getFestDetails(ticket)
                            const [TicketName, TicketSymbol, TicketPrice, TotalSupply, MarketPlace] = Object.values(TicketDetails);
                            let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
                            let TicketNFT_abi = TicketNFT_ct.abi;
                            let TicketNFT = new ethers.Contract( ticket , TicketNFT_abi , wallet );
                            let ticketsForSale = await TicketNFT.functions.getTicketsForSale()
                            if(ticketsForSale[0].length != 0){
                                let res = []
                                for(let i = 0; i < ticketsForSale[0].length; i++){
                                    let TicketsId = ticketsForSale[0][i]
                                    console.log(TicketsId)
                                    let val = Object.values(await TicketNFT.functions.getTicketDetails(TicketsId))
                                    let newTicketPrice = val[1]
                                    console.log(val[1])
                                    console.log(ticketsForSale[i])
                                    let tmp = (
                                        <tr>
                                            <td class="center">{MarketPlace}</td>
                                            <td class="center">{TicketName}</td>
                                            <td class="center">{TicketSymbol.toString()}</td>
                                            <td class="center">{ticketsForSale[i].toString()}</td>
                                            <td class="center">{newTicketPrice.toString()}</td>
                                            <td><button type="button" Marketplace = {MarketPlace} TicketName = {TicketName} TicketSymbol = {TicketSymbol} TicketID = {ticketsForSale[i]} Price = {newTicketPrice.toString()} className="btn btn-primary" onClick={handleClick}>Submit</button></td>
                                        </tr>
                                    )
                                    res.push(tmp)
                                }
                                return res
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

                {/*<div>*/}
                <header className={styles.header}>
                    <h1>Secondary market</h1>
                </header>

                <table className="table">

                    <thead>
                    <tr>
                        {/*<th scope="col">#</th>*/}
                        <th scope="col">Address</th>
                        <th scope="col">Name</th>
                        <th scope="col">Symbol</th>
                        <th scope="col">Ticket ID</th>
                        {/*<th scope="col">Type</th>*/}
                        <th scope="col">Price</th>
                        <th scope="col">Purchase</th>
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
            </main>
        )
    }
}

export default Purchase;