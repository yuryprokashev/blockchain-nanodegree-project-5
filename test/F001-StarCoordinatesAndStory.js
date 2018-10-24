const StarNotary = artifacts.require('StarNotary');
const StarCoordinates = require('./StarCoordinates');
const Star = require('./Star');

contract('Feature001: Star Coordinates and Story', async accounts => {
    let defaultAccount = accounts[0];
    let seller = accounts[1];
    let buyer = accounts[2];
    let operator = accounts[3];
    let starTokenOne = 1;
    let starTokenTwo = 2;
    let starTokenThatDoesNotExist = 99;
    let starOneCoordinates =  new StarCoordinates("032.155", "121.874", "245.978");
    let starTwoCoordinates = new StarCoordinates("132.155", "121.874", "245.978");
    let starOne = new Star("awesome star number one", "I love this star one!", starOneCoordinates);
    let starTwo = new Star("awesome star number two", "I love this star two!", starTwoCoordinates);

    beforeEach(async function () {
        this.contract = await StarNotary.new("Star Notary", "SNOT", {from: defaultAccount});
    });

    describe("1. Transactions that mutate the contract state", async function() {
        describe("1.1 Mint New Star Token Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("inherited from ERC721Mintable.sol", async function () {

                });
            });

            describe("Successful Case", async function () {

                let mintTransaction;
                before(async function () {
                    mintTransaction = await this.contract.createStar(
                        starOne.name,
                        starOne.story,
                        starOne.coordinates.rightAscend,
                        starOne.coordinates.declination,
                        starOne.coordinates.magnitude,
                        starTokenOne,
                        {from: seller});
                });
                it('Mint New Star TokenTransaction successful', async function () {
                    assert.equal(mintTransaction.logs[0].event, "Transfer");
                });
            });

            describe("Invalid Input Errors", async function () {
                it('Throws an Error, when there is already the Star Token with the same coordinates', async function () {
                    try {
                        await this.contract.createStar(
                            starOne.name,
                            starOne.story,
                            starOne.coordinates.rightAscend,
                            starOne.coordinates.declination,
                            starOne.coordinates.magnitude,
                            starTokenTwo,
                            {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("ERROR: The star with these coordinates already exists"), true);
                    }
                });
            });
        });
    });


    describe("2. Transactions that read the contract state", async function() {
        describe("2.1 Read Star By Token ID Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                let mintedStarToken;
                before(async function () {
                    await this.contract.createStar(
                        starOne.name,
                        starOne.story,
                        starOne.coordinates.rightAscend,
                        starOne.coordinates.declination,
                        starOne.coordinates.magnitude,
                        starTokenOne,
                        {from: seller});
                    mintedStarToken = await this.contract.tokenIdToStarInfo(starTokenOne);
                });
                it('Read Star By Token ID Transaction successful', async function () {
                    await this.contract.createStar(
                        starOne.name,
                        starOne.story,
                        starOne.coordinates.rightAscend,
                        starOne.coordinates.declination,
                        starOne.coordinates.magnitude,
                        starTokenOne,
                        {from: seller});
                    let star = await this.contract.tokenIdToStarInfo(starTokenOne);
                    assert.equal(star !== undefined, true);
                });

                it('The star name matches input', async function () {
                    assert.equal(mintedStarToken[0], starOne.name);
                });
                it('The star story matches input', async function () {
                    assert.equal(mintedStarToken[1], starOne.story);
                });
                it('The star right ascend matches "ra_" + input', async function () {
                    assert.equal(mintedStarToken[2], `ra_${starOne.coordinates.rightAscend}`);
                });
                it('The star declination matches "dec_" + input', async function () {
                    assert.equal(mintedStarToken[3], `dec_${starOne.coordinates.declination}`);
                });
                it('The star magnitude matches "mag_" + input', async function () {
                    assert.equal(mintedStarToken[4], `mag_${starOne.coordinates.magnitude}`);
                });
            });

            describe("Invalid Input Errors", async function () {
                it('Throws an Error, when the Star Token does not exist', async function(){
                    try {
                        await this.contract.tokenIdToStarInfo(starTokenThatDoesNotExist);
                    } catch (e) {
                        // assert.equal(e.message.includes("ERROR: This token does not exists"), true);
                        assert.equal(e instanceof Error, true);
                    }
                });
            });
        });

        describe("2.2 Check If Star Token With Coordinates Exists Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                it('Check If Star Token With Coordinates Exists returns false, when star does not exist', async function () {
                    let exists = await this.contract.checkIfStarExists(
                        starTwo.coordinates.rightAscend,
                        starTwo.coordinates.declination,
                        starTwo.coordinates.magnitude);
                    assert.equal(exists, false);
                });
                it('Check If Star Token With Coordinates Exists returns true, when star exists', async function () {
                    await this.contract.createStar(
                        starOne.name,
                        starOne.story,
                        starOne.coordinates.rightAscend,
                        starOne.coordinates.declination,
                        starOne.coordinates.magnitude,
                        starTokenOne,
                        {from: seller});
                    let exists = await this.contract.checkIfStarExists(
                        starOne.coordinates.rightAscend,
                        starOne.coordinates.declination,
                        starOne.coordinates.magnitude);
                    assert.equal(exists, true);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Does not validate input", async function () {

                });
            });
        });
    });

});

        // it('can check if star with provided coordinates exists', async function (){
        //     let exists = await doesStarExist(starOne);
        //     assert.equal(exists, true);
        // });
        // it('throws Error, when User tries to create the new star with the same coordinates', async function () {
        //     let error;
        //     try {
        //         createStar(starOne);
        //     } catch (e) {
        //         error = e;
        //         assert.equal(error instanceof Error, true);
        //     }
        //     // assert.equal(error instanceof Error, true);
        // });
    // });

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