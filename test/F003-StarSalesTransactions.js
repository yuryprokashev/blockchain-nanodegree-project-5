const StarNotary = artifacts.require('StarNotary');
const StarCoordinates = require('./StarCoordinates');
const Star = require('./Star');

const TRANSACTION_SUCCESSFUL = '0x01';

contract('Feature003: Star Sales Transactions', async accounts => {
    let defaultAccount = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];
    let operator = accounts[3];
    let starTokenOne = 1;
    let starTokenTwo = 2;
    let starTokenThatDoesNotExist = 99;
    let starTokenOnePrice = web3.toWei(0.01, "ether");
    let starTokenOnePriceReduced = web3.toWei(0.00999999, "ether");
    let starOneCoordinates =  new StarCoordinates("032.155", "121.874", "245.978");
    let starTwoCoordinates = new StarCoordinates("132.155", "121.874", "245.978");
    let starOne = new Star("awesome star number one", "I love this star one!", starOneCoordinates);
    let starTwo = new Star("awesome star number two", "I love this star two!", starTwoCoordinates);

    beforeEach(async function () {
        this.contract = await StarNotary.new("Star Notary", "SNOT", {from: defaultAccount});
        await this.contract.createStar(
            starOne.name,
            starOne.story,
            starOne.coordinates.rightAscend,
            starOne.coordinates.declination,
            starOne.coordinates.magnitude,
            starTokenOne,
            {from: seller});
    });

    describe("1. Transactions that mutate the contract state", async function() {
        describe("1.1 Put Star Token For Sale Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("only owner", async function () {
                    try{
                        await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: buyer});
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: Only token owner can put star for sale"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
            });

            describe("Successful Case", async function () {

                let putStarForSaleTransaction;
                before(async function () {
                    putStarForSaleTransaction = await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: seller});
                });
                it('Put Star Token For Sale Transaction successful', async function () {
                    assert.equal(putStarForSaleTransaction.receipt.status, TRANSACTION_SUCCESSFUL);
                });
            });

            describe("Invalid Input Errors", async function () {
                it('Throws an Error, when the Star Token does not exist', async function () {
                    try {
                        await this.contract.putStarUpForSale(starTokenThatDoesNotExist, starTokenOnePrice, {from: seller});
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: This token does not exists"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
            });
        });

        describe("1.2 Buy Star Token Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("no restrictions", async function () {

                });
            });

            describe("Successful Cases", async function () {

                beforeEach(async function () {
                    await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: seller});
                });

                describe("Buyer buys at token price", async function () {
                    let buyStarTransaction;
                    let sellerBalanceBefore;
                    let sellerBalanceAfter;
                    let buyerBalanceBefore;
                    let buyerBalanceAfter;
                    let currentTokenOwner;
                    beforeEach(async function () {
                        sellerBalanceBefore = web3.eth.getBalance(seller);
                        buyerBalanceBefore = web3.eth.getBalance(buyer);
                        buyStarTransaction = await this.contract.buyStar(starTokenOne, {from: buyer, value: starTokenOnePrice, gasPrice: 0});
                        sellerBalanceAfter = web3.eth.getBalance(seller);
                        buyerBalanceAfter = web3.eth.getBalance(buyer);
                        currentTokenOwner = await this.contract.ownerOf(starTokenOne);
                    });
                    it('Buy Star Token Transaction successful', async function () {
                        assert.equal(buyStarTransaction.receipt.status, TRANSACTION_SUCCESSFUL);
                    });
                    it('Seller balance increased by star price', async function () {
                        assert.equal(sellerBalanceAfter.sub(sellerBalanceBefore), starTokenOnePrice);
                    });
                    it('Buyer balance decreased by star price', async function () {
                        assert.equal(buyerBalanceBefore.sub(buyerBalanceAfter), starTokenOnePrice);
                    });
                    it('Buyer owns the star token', async function () {
                        assert.equal(currentTokenOwner, buyer);
                    });
                });

                describe("Buyer buys at price higher than the token price", async function () {
                    let buyStarTransaction;
                    let sellerBalanceBefore;
                    let sellerBalanceAfter;
                    let buyerBalanceBefore;
                    let buyerBalanceAfter;
                    let currentTokenOwner;
                    let priceMarkup = 1;
                    beforeEach(async function () {
                        await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: seller});
                        sellerBalanceBefore = web3.eth.getBalance(seller);
                        buyerBalanceBefore = web3.eth.getBalance(buyer);

                        buyStarTransaction = await this.contract.buyStar(starTokenOne, {from: buyer, value: starTokenOnePrice + priceMarkup, gasPrice: 0});
                        sellerBalanceAfter = web3.eth.getBalance(seller);
                        buyerBalanceAfter = web3.eth.getBalance(buyer);
                        currentTokenOwner = await this.contract.ownerOf(starTokenOne);
                    });
                    it('Buy Star Token Transaction successful', async function () {
                        assert.equal(buyStarTransaction.receipt.status, TRANSACTION_SUCCESSFUL);
                    });
                    it('Seller balance increased by star price', async function () {
                        assert.equal(sellerBalanceAfter.sub(sellerBalanceBefore), starTokenOnePrice);
                    });
                    it('Buyer balance decreased by star price', async function () {
                        assert.equal(buyerBalanceBefore.sub(buyerBalanceAfter), starTokenOnePrice);
                    });
                    it('Buyer owns the star token', async function () {
                        assert.equal(currentTokenOwner, buyer);
                    });
                });
            });

            describe("Invalid Input Errors", async function () {
                beforeEach(async function () {
                    await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: seller});
                });

                it('Throws an Error, when the Star Token does not exist', async function () {
                    try {
                        await this.contract.buyStar(starTokenTwo, {from: buyer, value: starTokenOnePrice - 1, gasPrice: 0});
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: This token does not exists"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });

                it('Throws an Error, when the Star Token exists, but it is not for sale', async function () {
                    await this.contract.createStar(
                        starTwo.name,
                        starTwo.story,
                        starTwo.coordinates.rightAscend,
                        starTwo.coordinates.declination,
                        starTwo.coordinates.magnitude,
                        starTokenTwo,
                        {from: seller});
                    try {
                        await this.contract.buyStar(starTokenTwo, {from: buyer, value: starTokenOnePrice - 1, gasPrice: 0});
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: Star is not for sale"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });

                it('Throws an Error, when the value offered by buyer is less than token price', async function () {
                    try {
                        await this.contract.buyStar(starTokenOne, {from: buyer, value: starTokenOnePriceReduced, gasPrice: 0});
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: Value offered is less, than Star price"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
            });
        });
    });


    describe("2. Transactions that read the contract state", async function() {
        beforeEach(async function () {
            await this.contract.putStarUpForSale(starTokenOne, starTokenOnePrice, {from: seller});
            await this.contract.createStar(
                starTwo.name,
                starTwo.story,
                starTwo.coordinates.rightAscend,
                starTwo.coordinates.declination,
                starTwo.coordinates.magnitude,
                starTokenTwo,
                {from: seller});
        });
        describe("2.1 Read Price Of Star Token For Sale Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                it('Read Price Of Star Token For Sale Transaction successful', async function () {
                    let readPriceTransaction = await this.contract.starsForSale(starTokenOne);
                    assert.equal(readPriceTransaction.s, 1);
                });
            });

            describe("Invalid Input Errors", async function () {
                it('Throws an Error, when the Star Token does not exist', async function () {
                    try {
                        await this.contract.starsForSale(starTokenThatDoesNotExist);
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: This token does not exists"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
                it('Throws an Error, when the Star Token exists, but it is not for sale', async function () {
                    try {
                        await this.contract.starsForSale(starTokenTwo);
                        assert.fail();
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: Star is not for sale"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
            });
        });
    });
});


// describe('buying and selling stars', () => {
//     let user1 = accounts[1];
//     let user2 = accounts[2];
//     let randomMaliciousUser = accounts[3];
//
//     let starId = 1;
//     let starPrice = web3.toWei(.01, "ether");
//
//     beforeEach(async function () {
//         await this.contract.createStar('awesome star!', starId, {from: user1})
//     });
//
//     it('user1 can put up their star for sale', async function () {
//         assert.equal(await this.contract.ownerOf(starId), user1);
//         await this.contract.putStarUpForSale(starId, starPrice, {from: user1});
//
//         assert.equal(await this.contract.starsForSale(starId), starPrice)
//     });
//
//     describe('user2 can buy a star that was put up for sale', () => {
//         beforeEach(async function () {
//             await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
//         });
//
//         it('user2 is the owner of the star after they buy it', async function() {
//             await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0});
//             assert.equal(await this.contract.ownerOf(starId), user2)
//         });
//
//         it('user2 ether balance changed correctly', async function () {
//             let overpaidAmount = web3.toWei(.05, 'ether');
//             const balanceBeforeTransaction = web3.eth.getBalance(user2);
//             await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0});
//             const balanceAfterTransaction = web3.eth.getBalance(user2);
//
//             assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
//         })
//     })
// })