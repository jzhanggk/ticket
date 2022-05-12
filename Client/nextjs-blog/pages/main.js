
import styles from '../styles/Home.module.css'
import Router, { withRouter} from 'next/router'
const { ethers } = require("ethers"); // node.js require

function Home ({router})  {
    // console.log(router.query.PK)
    console.log(router.query.PK)
    let PK = router.query.PK
    const dirToCreate = ()=>{
        Router.push({
            pathname:'/createTicket',
            query:{
                PK:PK
            }
        })
    }
    const dirToRelease= ()=>{
        Router.push({
            pathname:'/Release',
            query:{
                PK:PK
            }
        })
    }

    const dirToPurchase = ()=>{
        Router.push({
            pathname:'/purchase',
            query:{
                PK:PK
            }
        })
    }
    const dirToSecondaryMarket= ()=>{
        Router.push({
            pathname:'/secondaryMarket',
            query:{
                PK:PK
            }
        })
    }
    const dirToMyTickets = ()=>{
        Router.push({
            pathname:'/myTicket',
            query:{
                PK:PK
            }
        })
    }
    const dirToLottery = ()=>{
        Router.push({
            pathname:'/lottery',
            query:{
                PK:PK
            }
        })
    }
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToCreate}>Create Tickets</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToRelease}>Release Tickets</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToPurchase}>Buy Tickets</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToSecondaryMarket}>Secondary Market</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToMyTickets}>My Tickets</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href = '#' onClick={dirToLottery}>Lottery</a>
                    </li>
                </ul>
                <h1 className={styles.title}>
                    Welcome to Ticket market
                </h1>
                <p className={styles.description}>
                </p>
            </main>
        </div>


    )
}
export default withRouter(Home)