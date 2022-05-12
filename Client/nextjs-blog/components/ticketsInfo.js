import TicketFactory_ct from "../../../artifacts/contracts/TicketFactory.sol/TicketsFactory.json";
import config from "../config.json";
import ethers from "ethers";
import token_ct from "../../../artifacts/contracts/GogoToken.sol/GogoToken.json";

export function TicketsInfo(){
    let res = []
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
        let data =
            {"row_number": 1,
                "Address": 1,
                "Name": 2,
                "Price": 1,
                "Type": 1,
                "left": 1
            }
    // let tmp = getData()
    let nft_address =  TicketFactory.functions.getActiveFests()
    res = []
    console.log(nft_address)
    nft_address.then(function (value) {
        console.log(value)
    for(let i = 0;i < value[0].length;i ++){
        const festDetails = TicketFactory.functions.getFestDetails(value[0][i])
        console.log(festDetails)
    }

    })
    console.log(111)
    // const festDetails = TicketFactory.functions.getFestDetails(nft_address[0][0])
    // console.log(nft_address)
    return [data, data]
}
// import styles from '../styles/layout.module.css'
// import Link from "next/link";
// import React, { useState,useEffect } from "react";
//
// function getInfo() {
//
//     return (
//         <tbody>
//         <tr>
//             <th scope="row">1</th>
//             <td></td>
//             <td>Mark</td>
//             <td>1</td>
//             <td>Lottery</td>
//             <td>30</td>
//             <td>
//                 <button type="submit" className="btn btn-primary">Submit</button>
//             </td>
//         </tr>
//         <tr>
//             <th scope="row">2</th>
//             <td></td>
//             <td>Jacob</td>
//             <td>1</td>
//             <td>Lottery</td>
//             <td>30</td>
//             <td>
//                 <button type="submit" className="btn btn-primary">Submit</button>
//             </td>
//         </tr>
//         <tr>
//             <th scope="row">3</th>
//             <td></td>
//             <td>Larry</td>
//             <td>1</td>
//             <td>Lottery</td>
//             <td>30</td>
//             <td>
//                 <button type="submit" className="btn btn-primary">Submit</button>
//             </td>
//         </tr>
//         </tbody>
//     )
// }
//
// export default getInfo()