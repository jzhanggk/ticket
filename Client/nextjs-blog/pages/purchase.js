// import styles from '../components/my_css.module.css'
// import styles from '../styles/Home.module.css'
import Head from 'next/head'
// import Layout from '../components/layout'
import styles from '../styles/layout.module.css'
import Link from "next/link";
import React, { useState,useEffect , Component} from "react";
import { withRouter} from 'next/router'
import {TicketsInfo} from "../components/ticketsInfo"
import TicketNFT_ct from "../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json";
import TicketMarket_ct from "../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json";
import Router from "next/router";

const ethers = require('ethers');
const config = require('../config.json');
// let privateKey = config['private_key']
let privateKey2 = config['private_key']
let network = config['network']
let address = config['address']

let token_address = config['token_address']
let factory_address = config['factory_address']

let provider = ethers.getDefaultProvider(network);
// let wallet = new ethers.Wallet(privateKey , provider);
let wallet2 = new ethers.Wallet(privateKey2 , provider); // make change

let token_ct = require('../../../artifacts/contracts/GogoToken.sol/GogoToken.json');
let token_abi = token_ct.abi;


let token = new ethers.Contract(token_address , token_abi); // make change
let TicketFactory_ct = require('../../../artifacts/contracts/TicketFactory.sol/TicketsFactory.json');
let TicketFactory_abi = TicketFactory_ct.abi;
let TicketFactory = new ethers.Contract(factory_address , TicketFactory_abi, wallet2);



class Purchase extends Component {
    constructor({router}) {
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
                          const festDetails = await TicketFactory.functions.getFestDetails(ticket)
                          const [TicketName, TicketSymbol, TicketPrice, totalSupply, MarketPlace] = Object.values(festDetails);

                           let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
                           let TicketNFT_abi = TicketNFT_ct.abi;
                           let TicketNFT = new ethers.Contract( ticket , TicketNFT_abi , wallet2 );
                           let ticketsForSale = await TicketNFT.functions.getTicketsForSale()
                           let ticketsForBulk = await TicketNFT.functions.getTicketsForBulk()
                           let ticketsForLott = await TicketNFT.functions.getTicketsForLott()
                           let bulk_number = await TicketNFT.functions.getBulkLeft()
                           // let bulk_number = totalSupply - lott_number // make change
                           let lott_number = await TicketNFT.functions.getLottLeft()



                           async function handleClick(e){
                               e.preventDefault()
                               // const ticket2Price = await myNFT2.getTicketPrice();
                               // await hardhatToken.connect(customer3).increaseAllowance(myMarket2.address, ticket2Price);
                               let MarketPlace = e.target.getAttribute('MarketPlace')
                               let TicketName = e.target.getAttribute('TicketName')
                               let TicketPrice = e.target.getAttribute('TicketPrice')
                               let Type = e.target.getAttribute('TicketType')
                               let Number = e.target.getAttribute('Number')
                               const config = require('../config.json');
                               let privateKey = config['private_key']
                               let network = config['network']
                               let token_address = config['token_address']
                               let provider = ethers.getDefaultProvider(network);
                               let wallet = new ethers.Wallet(privateKey2, provider);
                               let token_ct = require('../../../artifacts/contracts/GogoToken.sol/GogoToken.json');
                               let token_abi = token_ct.abi;
                               // let token = new ethers.Contract( token_address , token_abi , wallet ); // make change
                               let token = new ethers.Contract(token_address, token_abi, wallet2); // make change
                               // 买票之前，用户得授权买票的市场
                               // await token.functions.increaseAllowance(MarketPlace, TicketPrice); // make change
                               await token.functions.increaseAllowance(MarketPlace, TicketPrice);
                               // 买票，去票对应的市场
                               let TicketMarket_ct = require('../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
                               let TicketMarket_abi = TicketMarket_ct.abi;
                               let TicketsMartket = new ethers.Contract( MarketPlace, TicketMarket_abi);
                               if(Type == "Bulk"){

                                   await TicketsMartket.connect(wallet2).functions.purchaseTicket();
                                   Router.reload(window.location.pathname)
                               }
                               else{
                                   await TicketsMartket.connect(wallet2).functions.enter();
                                   Router.reload(window.location.pathname)
                               }


                           }
                           let tmp = [(
                               <tr>
                                   <td class="center">{MarketPlace}</td>
                                   <td class="center">{TicketName}</td>
                                   <td class="center">{TicketPrice.toString()}</td>
                                   <td class="center">Bulk</td>
                                   <td class="center">{bulk_number.toString()}</td>
                                   {/*<td class="center"><button type="submit" className="custom-btn login-btn" >Buy</button></td>*/}
                                   <td><button type="button" Marketplace = {MarketPlace} TicketName = {TicketName} TicketPrice = {TicketPrice.toString()} TicketType = "Bulk" Number = {bulk_number} className="btn btn-primary" onClick={handleClick}>Submit</button></td>
                               </tr>
                           ),
                               (
                                   <tr>
                                       <td class="center">{MarketPlace}</td>
                                       <td class="center">{TicketName}</td>
                                       <td class="center">{TicketPrice.toString()}</td>
                                       <td class="center">Lottery</td>
                                       <td class="center">{lott_number.toString()}</td>
                                       {/*<td class="center"><button type="submit" className="custom-btn login-btn" >Buy</button></td>*/}
                                       <td><button type="button" MarketPlace = {MarketPlace} TicketName = {TicketName} TicketPrice = {TicketPrice.toString()} TicketType = "Lottery" Number = {lott_number} className="btn btn-primary" onClick={handleClick}>Submit</button></td>
                                   </tr>
                                   // <tr>
                                   //     <td></td>
                                   // </tr>
                               )]

                          return tmp
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
                    <h1>Buy Tickets</h1>
                </header>

                <table className="table">

                    <thead>
                    <tr>
                        {/*<th scope="col">#</th>*/}
                        <th scope="col">Address</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Type</th>
                        <th scope="col">Tickets Left</th>
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
                {/*</div>*/}
            </main>
        )
    }
}
export default withRouter(Purchase)