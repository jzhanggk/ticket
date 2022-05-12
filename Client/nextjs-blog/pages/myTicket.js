import styles from '../styles/layout.module.css'
import Link from "next/link";
import React, { useState,useEffect , Component} from "react";
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
            newPrice:[],
            
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
                            const handleClick = async (ticketId)=>{
                                try {
                                    let newPrice = this.state['newPrice']
                                    console.log(TicketNFT.address)
                                    console.log(typeof ticketId)
                                    console.log(typeof newPrice)
                                    console.log(ticketId)
                                    console.log(newPrice)
                                    await TicketNFT.functions.setSaleDetails(Number(ticketId), Number(newPrice), TicketsMartket.address);
                                    let val = Object.values(await TicketNFT.functions.getTicketDetails(TicketsId))
                                    console.log(val[1])
                                    console.log(val[4])
                                }
                                catch (exception){
                                    console.log("can not be re-sell")
                                }
                                finally {
                                    // Router.reload(window.location.pathname)
                                }
                            }
                            const handleInput = async (e)=>{
                                const state = this.state;
                                state['newPrice'] = e.target.value
                                this.setState(state);
                                console.log(this.state)
                            }
                            const festDetails = await TicketFactory.functions.getFestDetails(ticket)
                            const [TicketName, TicketSymbol, TicketPrice, totalSupply, MarketPlace] = Object.values(festDetails);
                            let TicketNFT_ct = require('../../../artifacts/contracts/TicketNFT.sol/TicketNFT.json')
                            let TicketNFT_abi = TicketNFT_ct.abi;
                            let TicketNFT = new ethers.Contract( ticket , TicketNFT_abi , wallet )
                            let [isExist] = Object.values(await TicketNFT.functions.isCustomerExist(wallet.address))

                            let TicketMarket_ct = require('../../../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
                            let TicketMarket_abi = TicketMarket_ct.abi;
                            let TicketsMartket = new ethers.Contract( MarketPlace, TicketMarket_abi , wallet );
                            if(isExist){
                                // 顾客持有的票，返回的是一个list，用[]访问
                                const [TicketsIds]= Object.values(await TicketNFT.functions.getTicketsOfCustomer(wallet.address))
                                // console.log(TicketsId[0])
                                let res = []
                                for(let i = 0;i < TicketsIds.length; i++){
                                    // [purchasePrice, sellingPrice, forSale, canTransfer, ticketStatus]
                                    let TicketsId = TicketsIds[i]
                                    let val = Object.values(await TicketNFT.functions.getTicketDetails(TicketsId))
                                    let purchasePrice = val[0]
                                    let sellingPrice = val[1]
                                    let forSale = val[2]
                                    let canTransfer = val[3]
                                    let ticketStatus = val[4]
                                    let tmp = (
                                        <tr>
                                            <td class="center">{TicketName}</td>
                                            <td class="center">{TicketsId.toString()}</td>
                                            <td class="center">{ticketStatus.toString()}</td>
                                            <td class="center">{TicketPrice.toString()}</td>
                                            <td>
                                            <input type="text" className="form-control" id="ticket_name" onChange={handleInput}
                                                   ></input><br/><br/>
                                            </td>
                                                <td><button type="button"  className="btn btn-primary" onClick={handleClick.bind(this,TicketsId.toString())}>Submit</button></td>
                                        </tr>
                                    )
                                    res.push(tmp)
                                }
                                return res
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
                    <h1>My Tickets</h1>
                </header>

                <table className="table">

                    <thead>
                    <tr>
                        <th scope="col">Name</th>
                         <th scope="col">ID</th>
                         <th scope="col">Status</th>
                        <th scope="col">Old Price</th>
                        <th scope="col">New Price</th>
                         <th scope="col">Sell</th>
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
