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
describe("NFT contract", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    let Token;
    let hardhatToken;
    let owner;
    let organizer
    let operator
    let customer1;
    let customer2;
    let customer3;
    let customers;

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Token = await ethers.getContractFactory("GogoToken"); // 不用
        [owner, organizer, operator, customer1, customer2, customer3, ...customers] = await ethers.getSigners(); // 不用

        // 组织者
        NFT = await ethers.getContractFactory("TicketNFT");
        Market = await ethers.getContractFactory("TicketMarket")

        hardhatToken = await Token.deploy(); // 不用

        // 实例， market address 和 nft 相关
        myNFT = await NFT.deploy("Jay Chow Concert", "Jay", 100, 1000, organizer.address); //
        myNFT2 = await NFT.deploy("Jay Chow Concert2", "Jay", 50, 1000, organizer.address);
        myMarket = await Market.deploy(hardhatToken.address, myNFT.address)
        myMarket2 = await Market.deploy(hardhatToken.address, myNFT2.address)

        // 发行票
        // await myNFT.connect(organizer).bulkMintTickets(200, operator.address);
        await myNFT.connect(organizer).bulkMintTickets(200, myMarket.address);
        await myNFT2.connect(organizer).bulkMintTickets(100, myMarket2.address)

        // 注册时发钱
        await hardhatToken.transfer(customer1.address, 1500);
        await hardhatToken.transfer(customer2.address, 2000);
        await hardhatToken.transfer(customer3.address, 2500);

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
            expect(await myNFT.getOrganiser()).to.equal(organizer.address);
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
            expect(customer1Balance).to.equal(1500);

            const customer2Balance = await hardhatToken.balanceOf(customer2.address);
            expect(customer2Balance).to.equal(2000);

            const customer3Balance = await hardhatToken.balanceOf(customer3.address);
            expect(customer3Balance).to.equal(2500);
        });

        it("Should get right property of festival", async function () {
            // Expect receives a value, and wraps it in an Assertion object. These
            // objects have a lot of utility methods to assert values.

            // This test expects the customers' balance stored in the contract to be equal
            // to our assignment.
            // await myNFT.bulkMintTickets(200, organizer.address);
            expect(await myNFT.name()).to.equal("Jay Chow Concert");
            expect(await myNFT.symbol()).to.equal("Jay");
            expect(await myNFT.getTicketPrice()).to.equal(100);
            expect(await myNFT.ticketCounts()).to.equal(200);
            const finalTicket = await myNFT.ticketCounts();
            expect(await myNFT.ownerOf(finalTicket)).to.equal(myMarket.address)
        });
    });
    // 功能开始
    describe("Festival", function () {
        it("Should transfer tickets between accounts ", async function () {
            const initBalanceOfCustomer3 = await hardhatToken.balanceOf(customer3.address);
            const ticketPrice = await myNFT.getTicketPrice();
            // not enough tokens
            await expect(myNFT.transferTicket(customer1.address)).to.be.reverted; // 钱不够会被驳回

            // sender increase the allowance of receiver
            // 买票之前，用户得授权买票的市场
            await hardhatToken.connect(customer2).increaseAllowance(myMarket.address, ticketPrice);
            // 买票，去票对应的市场
            await myMarket.connect(customer2).purchaseTicket();

            // 买票
            await hardhatToken.connect(customer3).increaseAllowance(myMarket.address, ticketPrice);
            await myMarket.connect(customer3).purchaseTicket();

            // expect the balance change after buying tickets 没用
            expect(await hardhatToken.balanceOf(organizer.address)).to.equal(200);
            expect(await hardhatToken.balanceOf(customer3.address)).to.equal(initBalanceOfCustomer3 - ticketPrice);

            // 顾客持有的票，返回的是一个list，用[]访问
            const ticketsOfCustomer2 = await myNFT.getTicketsOfCustomer(customer2.address);
            const ticketOfCustomer2id = ticketsOfCustomer2[0];
            expect(ticketOfCustomer2id).to.equal(1);

            const ticketsOfCustomer3 = await myNFT.getTicketsOfCustomer(customer3.address);
            const ticketOfCustomer3id = ticketsOfCustomer3[0];
            expect(ticketOfCustomer3id).to.equal(2);

            // sell the ticket on secondary market， 在二级市场卖
            // customer2 需要 setSaleDetails 去设置销售的信息，ticketid，新价格，市场的地址，需要和票对应
            await myNFT.connect(customer2).setSaleDetails(ticketOfCustomer2id, 120, myMarket.address);
            // 获得二级市场上出现的票，返回一个list
            const ticketsForSale = await myNFT.getTicketsForSale();
            const ticketForSale = ticketsForSale[0];
            expect(ticketForSale).to.equal(1);

            // 获取票的信息
            const ticketDetails = await myNFT.getTicketDetails(ticketForSale);
            const newTicketPrice = ticketDetails[1];


            expect(newTicketPrice).to.equal(120);

            // 在二级市场买票 secondaryPurchase 输入的ticketid
            await hardhatToken.connect(customer3).increaseAllowance(myMarket.address, newTicketPrice);
            await myMarket.connect(customer3).secondaryPurchase(ticketForSale);

            // 没用
            const newTicketsOfCustomer3 = await myNFT.getTicketsOfCustomer(customer3.address);
            expect(newTicketsOfCustomer3[0]).to.equal(2);
            expect(newTicketsOfCustomer3[1]).to.equal(1);
            expect(await myNFT.ownerOf(newTicketsOfCustomer3[1])).to.equal(customer3.address)


            // 发行抽奖的票，需要和市场对应
            await myNFT2.connect(organizer).bulkLotteryTickets(1, myMarket2.address);
            const ticket2Price = await myNFT2.getTicketPrice();
            await hardhatToken.connect(customer3).increaseAllowance(myMarket2.address, ticket2Price);

            // 用户参加抽奖 enter
            await myMarket2.connect(customer3).enter(myNFT.address);
            // 选择胜利者
            await myMarket2.lotteryTicket()

            // 获取参与者
            const players = await myMarket2.getPlayers()
            const player1 = players[0]
            expect(player1).to.equal(customer3.address)

            const ticketsForBulk2 = await myNFT2.getTicketsForBulk()
            const ticketsForLott2 = await myNFT2.getTicketsForLott()
            expect(ticketsForBulk2[0]).to.equal(1)
            expect(ticketsForLott2[0]).to.equal(101)
            // expect(await hardhatToken.balanceOf(customer3.address)).to.equal(30);
            const tickets2OfCustomer3 = await myNFT2.getTicketsOfCustomer(customer3.address);
            const ticket2OfCustomer3id = tickets2OfCustomer3[0];
            expect(ticket2OfCustomer3id).to.equal(101);
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