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
    
    describe('Create a star', async function() {
        let newStar;

        beforeEach(async function() {
            await this.contract.createStar(
                starOne.name,
                starOne.story,
                starOne.coordinates.rightAscend,
                starOne.coordinates.declination,
                starOne.coordinates.magnitude,
                starTokenOne,
                {from: seller});
            newStar = await this.contract.tokenIdToStarInfo(starTokenOne);
        });

        it('The true is returned, when the star one exists', async function () {
            let exists = await this.contract.checkIfStarExists(
                starOne.coordinates.rightAscend,
                starOne.coordinates.declination,
                starOne.coordinates.magnitude);
            assert.equal(exists, true);
        });
        it('The false is returned, when the star two does not exist', async function () {
            let exists = await this.contract.checkIfStarExists(
                starTwo.coordinates.rightAscend,
                starTwo.coordinates.declination,
                starTwo.coordinates.magnitude);
            assert.equal(exists, false);
        });
        it('The star name matches input', async function () {
            assert.equal(newStar[0], starOne.name);
        });
        it('The star story matches input', async function () {
            assert.equal(newStar[1], starOne.story);
        });
        it('The star right ascend matches "ra_" + input', async function () {
            assert.equal(newStar[2], `ra_${starOne.coordinates.rightAscend}`);
        });
        it('The star declination matches "dec_" + input', async function () {
            assert.equal(newStar[3], `dec_${starOne.coordinates.declination}`);
        });
        it('The star magnitude matches "mag_" + input', async function () {
            assert.equal(newStar[4], `mag_${starOne.coordinates.magnitude}`);
        });
        it('Throws error on attempt to create a star with the same three coordinates', async function () {
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
        it('Create another star, when one coordinate is different', async function () {
            await this.contract.createStar(
                starTwo.name,
                starTwo.story,
                starTwo.coordinates.rightAscend,
                starTwo.coordinates.declination,
                starOne.coordinates.magnitude,
                starTokenTwo,
                {from: seller});
            let anotherStar = await this.contract.tokenIdToStarInfo(starTokenTwo);
            assert.equal(anotherStar[0], starTwo.name);
        });
        it('Throws error, when star with provided tokenId does not exist', async function(){
            try {
                await this.contract.tokenIdToStarInfo(starTokenThatDoesNotExist);
            } catch (e) {
                assert.equal(e.message.includes("ERROR: This token does not exists"), true);
            }
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