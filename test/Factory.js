// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers } = require("hardhat");
// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("TicketsFactory contract", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    let Token;
    let hardhatToken;
    let owner;
    let organizer1
    let organizer2
    let operator
    let customer1;
    let customer2;
    let customer3;
    let customers;
    let jayConcerntAddress
    let taylorConcertAddress
    let Ticket_ct = require('../artifacts/contracts/TicketNFT.sol/TicketNFT.json');
    let Ticket_abi = Ticket_ct.abi;
    let jayNFT
    let taylorNFT

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("GogoToken"); // 不用
        [owner, organizer1, organizer2, operator, customer1, customer2, customer3, ...customers] = await ethers.getSigners(); // 不用

        // 组织者
        Factory = await ethers.getContractFactory("TicketsFactory")
        
        factory = await Factory.deploy();
        hardhatToken = await Token.deploy();

        // myNFT = await NFT.deploy("Jay Chow Concert", "Jay", 100, 1000, organizer.address); //
        // myNFT2 = await NFT.deploy("Jay Chow Concert2", "Jay", 50, 1000, organizer.address);
        // myMarket = await Market.deploy(hardhatToken.address, myNFT.address)
        // myMarket2 = await Market.deploy(hardhatToken.address, myNFT2.address)

        // // 发行票
        // // await myNFT.connect(organizer).bulkMintTickets(200, operator.address);
        // await myNFT.connect(organizer).bulkMintTickets(200, myMarket.address);
        // await myNFT2.connect(organizer).bulkMintTickets(100, myMarket2.address)

        // 注册时发钱
        await hardhatToken.transfer(customer1.address, 250);
        await hardhatToken.transfer(customer2.address, 200);
        await hardhatToken.transfer(customer3.address, 250);
        await factory.connect(organizer1).createNewFest(hardhatToken.address, "Jay Chow Concert", "Jay", 100, 20)
        await factory.connect(organizer2).createNewFest(hardhatToken.address, "Taylor Swift Concert", "Taylor", 50, 10)
        const activeTickets = await factory.getActiveFests()
        const[jayConcerntAddress, taylorConcertAddress] = Object.values(activeTickets);
        jayNFT = new ethers.Contract(jayConcerntAddress, Ticket_abi , organizer1);
        taylorNFT = new ethers.Contract(taylorConcertAddress, Ticket_abi , organizer2);
        // jayConcerntAddress = activeTickets[0]
        // taylorConcertAddress = activeTickets[1]
        // console.log(jayConcerntAddress)
        // console.log(taylorConcertAddress)
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        // `it` is another Mocha function. This is the one you use to define your
        // tests. It receives the test name, and a callback function.

        // If the callback function is async, Mocha will `await` it.
        it("Should set the right owner", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await hardhatToken.owner()).to.equal(owner.address);
        });

        it("Should set the right organizer", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await jayNFT.getOrganiser()).to.equal(organizer1.address);
            expect(await taylorNFT.getOrganiser()).to.equal(organizer2.address);
        });

        // If the callback function is async, Mocha will `await` it.
        it("Should get right balance of customers", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the customers' balance stored in the contract to be equal
            // to our assignment.
            // await myNFT.bulkMintTickets(200, organizer.address);

            // token的实例去使用函数
            const customer1Balance = await hardhatToken.balanceOf(customer1.address);
            expect(customer1Balance).to.equal(250);

            const customer2Balance = await hardhatToken.balanceOf(customer2.address);
            expect(customer2Balance).to.equal(200);

            const customer3Balance = await hardhatToken.balanceOf(customer3.address);
            expect(customer3Balance).to.equal(250);

        });

        it("Should get right property of festival", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the customers' balance stored in the contract to be equal
            // to our assignment.
            // await myNFT.bulkMintTickets(200, organizer.address);
            
            expect(await jayNFT.name()).to.equal("Jay Chow Concert");
            expect(await taylorNFT.name()).to.equal("Taylor Swift Concert");
            expect(await jayNFT.symbol()).to.equal("Jay");
            expect(await taylorNFT.symbol()).to.equal("Taylor");
            expect(await jayNFT.getTicketPrice()).to.equal(100);
            expect(await taylorNFT.getTicketPrice()).to.equal(50);
        });
    });
    // 功能开始
    describe("Festival", function () {
        it("Should transfer tickets between accounts ", async function () {
            const initBalanceOfCustomer1 = await hardhatToken.balanceOf(customer1.address);
            const ticketPrice = await jayNFT.getTicketPrice();

            // 买票
            const jayDetails = await factory.getFestDetails(jayNFT.address)
            const [jayTicketName, jayTicketSymbol, jayTicketPrice, jayTotalSupply, jayMarketPlace] = Object.values(jayDetails);
            await jayNFT.connect(organizer1).bulkMintTickets(10, jayMarketPlace);
            await hardhatToken.connect(customer1).increaseAllowance(jayMarketPlace, jayTicketPrice);
            let TicketMarket_ct = require('../artifacts/contracts/TicketMarket.sol/TicketMarket.json');
            let TicketMarket_abi = TicketMarket_ct.abi;
            let TicketsMartket = new ethers.Contract(jayMarketPlace, TicketMarket_abi, organizer1);
            await TicketsMartket.connect(customer1).purchaseTicket();

            const [isExist] = Object.values(await jayNFT.functions.isCustomerExist(customer1.address))
            const [TicketsIds]= Object.values(await jayNFT.functions.getTicketsOfCustomer(customer1.address))
            console.log("Purchase")
            for(let i = 0;i < TicketsIds.length; i++){
                console.log(TicketsIds[i])
            }
            // console.log(TicketsIds[0])
            // if (isExist) {
            //     const [TicketsIds]= Object.values(await jayNFT.functions.getTicketsOfCustomer(customer1.address))
            //     for(let i = 0;i < TicketsIds.length; i++){
            //         console.log(TicketsIds[i])
            //     }
            // }

            // 二级市场卖票 
            // const ticketsForSale0 = await jayNFT.getTicketsForSale();
            // if (ticketsForSale0.length.equal.to(0)){
            //     console.log("empty")
            // }
            // await jayNFT.connect(customer1).setSaleDetails(TicketsIds[0], 120, jayMarketPlace);
            // const ticketsForSale = await jayNFT.getTicketsForSale();
            // for(let i = 0;i < ticketsForSale.length; i++){
            //     console.log(ticketsForSale[i])
            //     let val = Object.values(await jayNFT.getTicketDetails(ticketsForSale[i]))
            //     console.log(val[4])
            // }

            // 抽奖
            await jayNFT.connect(organizer1).bulkLotteryTickets(10, jayMarketPlace);
            console.log("Ticket Left")
            console.log(await jayNFT.getBulkLeft())
            console.log(await jayNFT.getLottLeft())
            console.log("Lottery")
            await hardhatToken.connect(customer1).increaseAllowance(jayMarketPlace, jayTicketPrice);
            await TicketsMartket.connect(customer1).enter()
            await hardhatToken.connect(customer2).increaseAllowance(jayMarketPlace, jayTicketPrice);
            await TicketsMartket.connect(customer2).enter()
            await TicketsMartket.connect(organizer1).lotteryTicket()
            const [TicketsIds2]= Object.values(await jayNFT.functions.getTicketsOfCustomer(customer1.address))
            console.log("customer1")
            for(let i = 0;i < TicketsIds2.length; i++){
                console.log(TicketsIds2[i])
            }
            console.log("customer2")
            const [TicketsIds3]= Object.values(await jayNFT.functions.getTicketsOfCustomer(customer2.address))
            for(let i = 0;i < TicketsIds3.length; i++){
                console.log(TicketsIds3[i])
            }
            console.log("Ticket Left")
            console.log(await jayNFT.getBulkLeft())
            console.log(await jayNFT.getLottLeft())

            // 我的票


            // // not enough tokens
            // await expect(myNFT.transferTicket(customer1.address)).to.be.reverted; // 钱不够会被驳回

            // // sender increase the allowance of receiver
            // // 买票之前，用户得授权买票的市场
            // await hardhatToken.connect(customer2).increaseAllowance(myMarket.address, ticketPrice);
            // // 买票，去票对应的市场
            // await myMarket.connect(customer2).purchaseTicket();

            // // 买票
            // await hardhatToken.connect(customer3).increaseAllowance(myMarket.address, ticketPrice);
            // await myMarket.connect(customer3).purchaseTicket();

            // // expect the balance change after buying tickets 没用
            // expect(await hardhatToken.balanceOf(organizer.address)).to.equal(200);
            // expect(await hardhatToken.balanceOf(customer3.address)).to.equal(initBalanceOfCustomer3 - ticketPrice);

            // // 顾客持有的票，返回的是一个list，用[]访问
            // const ticketsOfCustomer2 = await myNFT.getTicketsOfCustomer(customer2.address);
            // const ticketOfCustomer2id = ticketsOfCustomer2[0];
            // expect(ticketOfCustomer2id).to.equal(1);

            // const ticketsOfCustomer3 = await myNFT.getTicketsOfCustomer(customer3.address);
            // const ticketOfCustomer3id = ticketsOfCustomer3[0];
            // expect(ticketOfCustomer3id).to.equal(2);

            // // sell the ticket on secondary market， 在二级市场卖
            // // customer2 需要 setSaleDetails 去设置销售的信息，ticketid，新价格，市场的地址，需要和票对应
            // await myNFT.connect(customer2).setSaleDetails(ticketOfCustomer2id, 120, myMarket.address);
            // // 获得二级市场上出现的票，返回一个list
            // const ticketsForSale = await myNFT.getTicketsForSale();
            // const ticketForSale = ticketsForSale[0];
            // expect(ticketForSale).to.equal(1);

            // // 获取票的信息
            // const ticketDetails = await myNFT.getTicketDetails(ticketForSale);
            // const newTicketPrice = ticketDetails[1];


            // expect(newTicketPrice).to.equal(120);

            // // 在二级市场买票 secondaryPurchase 输入的ticketid
            // await hardhatToken.connect(customer3).increaseAllowance(myMarket.address, newTicketPrice);
            // await myMarket.connect(customer3).secondaryPurchase(ticketForSale);

            // // 没用
            // const newTicketsOfCustomer3 = await myNFT.getTicketsOfCustomer(customer3.address);
            // expect(newTicketsOfCustomer3[0]).to.equal(2);
            // expect(newTicketsOfCustomer3[1]).to.equal(1);
            // expect(await myNFT.ownerOf(newTicketsOfCustomer3[1])).to.equal(customer3.address)


            // // 发行抽奖的票，需要和市场对应
            // await myNFT2.connect(organizer).bulkLotteryTickets(1, myMarket2.address);
            // const ticket2Price = await myNFT2.getTicketPrice();
            // await hardhatToken.connect(customer3).increaseAllowance(myMarket2.address, ticket2Price);

            // // 用户参加抽奖 enter
            // await myMarket2.connect(customer3).enter(myNFT.address);
            // // 选择胜利者
            // await myMarket2.lotteryTicket()

            // // 获取参与者
            // const players = await myMarket2.getPlayers()
            // const player1 = players[0]
            // expect(player1).to.equal(customer3.address)

            // const ticketsForBulk2 = await myNFT2.getTicketsForBulk()
            // const ticketsForLott2 = await myNFT2.getTicketsForLott()
            // expect(ticketsForBulk2[0]).to.equal(1)
            // expect(ticketsForLott2[0]).to.equal(101)
            // // expect(await hardhatToken.balanceOf(customer3.address)).to.equal(30);
            // const tickets2OfCustomer3 = await myNFT2.getTicketsOfCustomer(customer3.address);
            // const ticket2OfCustomer3id = tickets2OfCustomer3[0];
            // expect(ticket2OfCustomer3id).to.equal(101);
            // expect(await hardhatToken.balanceOf(customer3.address)).to.equal(30);
            // expect(await hardhatToken.balanceOf(organizer.address)).to.equal(212);
            // expect(await hardhatToken.balanceOf(customer2.address)).to.equal(158);

            // sell the ticket between customer
            // hardhatToken.connect(customer1).increaseAllowance(myMarket.address, newTicketPrice);
            // await myNFT.connect(customer3).setSaleDetails(newTicketsOfCustomer3[1], 50, customer1.address);
            // await myNFT.connect(customer3).secondaryTransferTicket(customer1.address, newTicketsOfCustomer3[1])

            // await myNFT.connect(customer3).setSaleDetails(newTicketsOfCustomer3[1], 50, myMarket.address);
            // await hardhatToken.connect(customer1).increaseAllowance(myMarket.address, 50);
            // await myMarket.connect(customer1).secondaryPurchase(newTicketsOfCustomer3[1]);

        });
    });
});