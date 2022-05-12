// import Head from 'next/head'
// import Image from 'next/image'
import styles from '../styles/Home.module.css'
import main from './main';
// const { ethers } = require("ethers"); // node.js require
import {React, useState, useEffect} from 'react'
import Link from 'next/link'
import Router from 'next/router'
import config from "../config.json";
function Home ()  {
    const [privateKey, setPK] = useState(0.0);
    const dirToMain = ()=>{
        Router.push("/main")
    }

    return(
            <div className={styles.container}>

                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1>Fair Ticket System</h1>
                    </header>
                    <br/><br/><br/><br/>
                    <button type="submit" className="btn btn-primary" onClick={dirToMain}>Connect</button>
                </main>
            </div>
    )

}
export default Home