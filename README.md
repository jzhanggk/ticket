### Run the application

Steps:

1. Open the file config.json in the path Client/nextjs-blog/config.json, and fill in the  property 'private_key' with the private key of MetaMask.
2. Change the path into Client/nextjs-blog in command line interface, and run the command `npm install`.
3. Run the command  `npm run dev`.
4. After above steps, the application will be accessible at `http://localhost:3000/`.

While the program is running, it is normal to have a delay in display. If the waiting time is too long, please refresh the page.

### Example of running process:

Since there are some restrictions for the functions of the application, for example, the organizer account cannot purchase the tickets that are created and released by itself, it is recommended to use multiple accounts. The example of testing process is as follows:

#### Create Ticket

1. Prepare three accounts of MetaMask of  for testing, assume the accounts are account_1, account_2 and account_3.
2. Fill in config.json with the private key of account_1 and run the application. the application can be accessible at `http://localhost:3000/`

4. Click the connect button to enter the main page.
5. Click the Create Button to enter the create ticket page.
6. Create a ticket, which will be mint a new NFT.

#### Release Tickets

1.  Continue the previous process and return to main page to enter the release page.

2. Release the bulk tickets and the lottery tickets that we created respectively. We can also choose the number of the tickets that we expect to release.

#### Buy Tickets

1.  Continue the previous process, fill in config.json with the private key of account_2 to change the account.

2.  Enter the buy tickets page from the main page.

3. Purchase a bulk ticket and a lottery ticket we released previously.

#### Secondary Market

1. Continue the previous process and enter the my tickets page, then we can find the tickets that we purchased before.

2. Set a new price of the bulk ticket we purchased, and put it on the secondary market.

3. Fill in config.json with the private key of account_3 to change the account.

4. Enter the secondary market page from the main page.
5. Purchase the ticket that we put on sale before.

6. Enter the my ticket page from the main page, we will find the ticket we bought from the secondary market.

#### Lottery

1.  Continue the previous process and fill in config.json with the private key of account_1 to change the account.
2.  Enter the lottery page from the main page.
3.  Choose the lottery ticket we release before.
4.  Fill in config.json with the private key of account_2 to change the account. 
5.  If the account_2 is chosen, the ticket will be presented in its my ticket page. 

## The restrictions for the application

To make the ticketing system fairer, we apply following restrictions to the application:

- The number of released ticket cannot be more than the total supply which is set at the creation of the event.
- Customers cannot hold more than 2 tickets. 
- The owner of tickets cannot buy a ticket a second time to avoid double payments.
- Ticket cannot be resell twice (ticket bought from secondary market cannot be resell again.
- The reselling price cannot be more than 130% of original price.
- Lottery Ticket cannot be resellThe caller of this function must be organizer.
- The customers enter the lottery must have less than 2 tickets for this event.
- Enter fee equals to 10% of ticket price will be charged no matter the result. The winner will automatically transfer the rest 90% of ticket price.
- 10% of the new price at the secondary market will be regarded as commission and transfer to the organizer. 
- The 90% of the new price at the secondary market will be transferred to the seller.

​	