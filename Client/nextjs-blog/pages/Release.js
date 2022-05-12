import Link from 'next/link'
import styles from "../styles/layout.module.css";
import React, {useState, useEffect, Component} from "react";
import TicketNFT_ct from "../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json";
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
let TicketFactory = new ethers.Contract(factory_address , TicketFactory_abi , wallet);

class Release extends Component {

    constructor() {
        super();

        this.state = {
            festivals: [],
            number: [],
            type: 'Bulk'
        };
    }
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
                            const festDetails = await TicketFactory.functions.getFestDetails(ticket)
                            const [TicketName, TicketSymbol, TicketPrice, totalSupply, marketplace] = Object.values(festDetails);
                            let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
                            let TicketNFT_abi = TicketNFT_ct.abi;
                            let TicketNFT = new ethers.Contract(ticket , TicketNFT_abi , wallet );
                            let ticketsForSale = await TicketNFT.functions.getTicketsForSale()
                            let ticketsForBulk = await TicketNFT.functions.getTicketsForBulk()
                            let ticketsForLott = await TicketNFT.functions.getTicketsForLott()
                            let _organiser = await TicketNFT.functions.getOrganiser()
                            let left = totalSupply - ticketsForBulk[0].length - ticketsForLott[0].length
                            // let left = totalSupply - ticketsForBulk.length - ticketsForLott.length 

                            let num = 0
                            const handleClick = async (myNFT, myMarket, organiser)=>{

                                try {
                                    let number =this.state['number']
                                    let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
                                    let TicketNFT_abi = TicketNFT_ct.abi;
                                    let TicketNFT = new ethers.Contract(myNFT , TicketNFT_abi , wallet );
                                    // await TicketNFT.functions.bulkLotteryTickets(number, myMarket); // make change
                                    let type = this.state['type']
                                    if(type == 'Bulk')
                                        await TicketNFT.functions.bulkMintTickets(number, myMarket); // xian dao xian de
                                    else{
                                        await TicketNFT.functions.bulkLotteryTickets(number, myMarket); // xian dao xian de
                                    }
                                    Router.reload(window.location.pathname)
                                }
                                catch (exception){
                                    console.log("error")
                                }
                            }
                            const handleInput = async (e)=>{
                                const state = this.state;
                                state['number'] = e.target.value
                                this.setState(state);
                                console.log(this.state)
                            }
                            const handleChange = async (e)=>{
                                const state = this.state;
                                state['type'] = e.target.value
                                this.setState(state);
                                console.log(this.state)
                            }
                            if(_organiser == wallet.address){
                                let tmp = (

                                    <tr key={ticket}>
                                        <th scope="row" id = "organiser">{_organiser}</th>
                                        <td>{TicketName}</td>
                                        <td>{TicketSymbol}</td>
                                        <td>{left}</td>
                                        <td>
                                            <input type="text"  id="number" name = "number" onChange={handleInput}
                                            ></input><br/><br/>
                                        </td>
                                        <td>
                                            <div>
                                                <select  onChange={handleChange}>
                                                    {/*<option value="">Please Select</option>*/}
                                                    <option value="Bulk">Bulk</option>
                                                    <option value="Lottery">Lottery</option>
                                                </select>
                                            </div>

                                        </td>
                                        <td><button type="submit" myNFT = {ticket} myMarket = {marketplace} organiser = {_organiser} number = {num}  className="btn btn-primary" onClick={handleClick.bind(this,ticket, marketplace, _organiser)}>Submit</button></td>

                                    </tr>
                                )
                                return tmp
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
        console.log(e.target.name)
        console.log(state[e.target.name])
    }

    render() {
        return (
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Release Tickets</h1>
                </header>

                <table className="table">

                    <thead>
                    <tr>
                        <th scope="col">Organiser Address</th>
                        <th scope="col">Name</th>
                        <th scope="col">Symbol</th>
                        <th scope="col">Tickets Left</th>
                        <th scope="col">Number</th>
                        <th scope="col">Release Type</th>
                        <th scope="col">Release</th>
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

export default Release;




