const StarNotary = artifacts.require('StarNotary');

contract('Feature002: Star Token is ERC721Mintable', async accounts => {
    let defaultAccount = accounts[0];
    let seller = accounts[1];
    let minter = defaultAccount;
    let nonMinter = seller;
    let zeroAddress = 0;
    let buyer = accounts[2];
    let operator = accounts[3];
    let agent = accounts[4];
    let starTokenOne = 1;
    let starTokenTwo = 2;
    let starTokenThatDoesNotExist = 99;

    beforeEach(async function () {
        this.contract = await StarNotary.new("Star Notary", "SNOT", {from: defaultAccount});
    });

    describe("1. Transactions that mutate the contract state", async function(){

        describe("1.1. Mint New Token Transaction.", async function () {

            describe("Access Control Errors", async function(){
                it("Throws an Error, when transaction sender does not have minter role", async function () {
                    try {
                        await this.contract.mint(seller, starTokenTwo, {from: nonMinter});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });

            describe("Successful Case", async function () {
                let mintTransaction;
                beforeEach(async function () {
                    mintTransaction = await this.contract.mint(seller, starTokenOne, {from: minter});
                });
                it("Mint New Token Transaction successful", async function () {
                    assert.equal(mintTransaction.logs[0].event, "Transfer");
                });
                it("Owner of new Token is set", async function () {
                    let currentStarOneTokenOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(currentStarOneTokenOwner, seller);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when seller address is 0.", async function () {
                    try {
                        await this.contract.mint(zeroAddress, starTokenTwo, {from: minter});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });

        describe("1.2. Transfer Token Transaction.", async function () {
            let transferTransaction;

            beforeEach(async function () {
                await this.contract.mint(seller, starTokenOne, {from: minter});
            });

            describe("Access Control Errors", async function(){
                it('Throws an Error, when transaction sender does not own the transferred token', async function () {
                    try {
                        await this.contract.safeTransferFrom(seller, buyer, starTokenOne, {from: buyer});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });

            describe("Successful Case", async function () {
                it('Transfer Token Transaction successful', async function () {
                    let validTransferTransaction = await this.contract.safeTransferFrom(seller, buyer, starTokenOne, {from: seller});
                    assert.equal(validTransferTransaction.logs[0].event, 'Transfer');
                });
                it("Owner of new Token is set", async function () {
                    await this.contract.safeTransferFrom(seller, buyer, starTokenOne, {from: seller});
                    let currentStarOneTokenOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(currentStarOneTokenOwner, buyer);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when 'from' address is not owner of the transferred token", async function () {
                    try {
                        await this.contract.safeTransferFrom(buyer, buyer, starTokenOne, {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });

                it('Throws and Error, when token does not exist', async function () {
                    try {
                        await this.contract.safeTransferFrom(seller, buyer, starTokenThatDoesNotExist, {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });

        describe("1.3. Grant Transfer Rights For One Token To Agent Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it('Throws an Error, when transaction sender does not own the token', async function () {
                    try {
                        await this.contract.approve(buyer, starTokenOne, {from: buyer});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });

            describe("Successful Case", async function () {
                beforeEach(async function () {
                    await this.contract.mint(seller, starTokenOne, {from: minter});
                });

                it('Grant Transfer Rights For One Token To Agent Transaction successful', async function () {
                    let approveTransaction = await this.contract.approve(agent, starTokenOne, {from: seller});
                    assert.equal(approveTransaction.logs[0].event, "Approval");
                });
                it('Agent address is approved', async function () {
                    await this.contract.approve(agent, starTokenOne, {from: seller});
                    let approvedAddress = await this.contract.getApproved(starTokenOne);
                    assert.equal(approvedAddress, agent);
                });
            });

            describe("Invalid Input Errors", async function () {
                it('Throws an Error, when the token does not exist', async function () {
                    try {
                        await this.contract.approve(agent, starTokenThatDoesNotExist, {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
                it('Throws an Error, when the agent address is zero', async function () {
                    try {
                        await this.contract.approve(zeroAddress, starTokenOne, {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });

        describe("1.4. Manage Transfer Rights For All Tokens To Operator Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access control restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                beforeEach(async function () {
                    await this.contract.mint(seller, starTokenOne, {from: minter});
                    await this.contract.mint(seller, starTokenTwo, {from: minter});
                });
                it('Grant Transfer Rights For All Tokens To Operator Transaction successful', async function () {
                    let grantTransferRightsTransaction = await this.contract.setApprovalForAll(operator, true, {from: seller});
                    assert.equal(grantTransferRightsTransaction.logs[0].event, "ApprovalForAll");
                });

                it('Operator can perform transfers with all tokens', async function () {
                    await this.contract.setApprovalForAll(operator, true, {from: seller});
                    let currentStarTokenOneOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(currentStarTokenOneOwner, seller);
                    await this.contract.safeTransferFrom(seller, buyer, starTokenOne, {from: operator});
                    let newStarTokenOneOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(newStarTokenOneOwner, buyer);

                    let currentStarTokenTwoOwner = await this.contract.ownerOf(starTokenTwo);
                    assert.equal(currentStarTokenTwoOwner, seller);
                    await this.contract.safeTransferFrom(seller, buyer, starTokenTwo, {from: operator});
                    let newStarTokenTwoOwner = await this.contract.ownerOf(starTokenTwo);
                    assert.equal(newStarTokenTwoOwner, buyer);
                });

                it('Operator address is set as approved for all tokens of transaction sender', async function () {
                    await this.contract.setApprovalForAll(operator, true, {from: seller});
                    let currentApprovalForOperatorFromSeller = await this.contract.isApprovedForAll(seller, operator);
                    assert.equal(currentApprovalForOperatorFromSeller, true);
                });

                it('Revoke Transfer For All Tokens From Operator Transaction successful', async function () {
                    await this.contract.setApprovalForAll(operator, true, {from: seller});
                    let revokeTransferRightsTransaction = await this.contract.setApprovalForAll(operator, false, {from: seller});
                    assert.equal(revokeTransferRightsTransaction.logs[0].event, "ApprovalForAll");
                });

                it('Operator can not perform transfers with all tokens of transaction sender', async function () {
                    await this.contract.setApprovalForAll(operator, true, {from: seller});
                    await this.contract.setApprovalForAll(operator, false, {from: seller});
                    try{
                        await this.contract.safeTransferFrom(seller, buyer, starTokenOne, {from: operator});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                    let currentStarTokenOneOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(currentStarTokenOneOwner, seller);
                    try {
                        await this.contract.safeTransferFrom(seller, buyer, starTokenTwo, {from: operator});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                    let currentStarTokeTwonOwner = await this.contract.ownerOf(starTokenTwo);
                    assert.equal(currentStarTokeTwonOwner, seller);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when Operator's address is the same as transaction sender ", async function () {
                    try {
                        await this.contract.setApprovalForAll(seller, true, {from: seller});
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });
    });

    describe("2. Transactions that read the contract state", async function() {

        describe("2.1 Read Agent Address For One Token Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                it("Read Agent Address For One Token Transaction successful", async function () {
                    await this.contract.mint(seller, starTokenOne, {from: minter});
                    await this.contract.approve(agent, starTokenOne, {from: seller});
                    let currentApprovedAddress = await this.contract.getApproved(starTokenOne);
                    assert.equal(currentApprovedAddress, agent);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when the token does not exist", async function () {
                    try{
                        await this.contract.getApproved(starTokenThatDoesNotExist);
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });

        describe("2.2 Read Owner Address Of One Token Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                it('Read Owner Address Of One Token Transaction successful', async function () {
                    await this.contract.mint(seller, starTokenOne, {from: minter});
                    let currentStarTokenOneOwner = await this.contract.ownerOf(starTokenOne);
                    assert.equal(currentStarTokenOneOwner, seller);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when the token does not exist", async function () {
                    try{
                        await this.contract.ownerOf(starTokenThatDoesNotExist);
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
            });
        });

        describe("2.3 Read Status Of Token Transfer Rights Given By Owner To Operator Transaction.", async function () {

            describe("Access Control Errors", async function() {
                it("Does not have access restrictions", async function () {

                });
            });

            describe("Successful Case", async function () {
                it("Read Status Of Token Transfer Rights Given By Owner To Operator Transaction successful", async function () {
                    // await this.contract.mint(seller, starTokenOne, {from: minter});
                    // await this.contract.mint(seller, starTokenTwo, {from: minter});
                    await this.contract.setApprovalForAll(operator, true, {from: seller});
                    let approvalStatus = await this.contract.isApprovedForAll(seller, operator);
                    assert.equal(approvalStatus, true);
                });
            });

            describe("Invalid Input Errors", async function () {
                it("Throws an Error, when owner address is 0", async function () {
                    try {
                        await this.contract.isApprovedForAll(zeroAddress, operator);
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });
                it("Throws an Error, when operator address is 0", async function () {
                    try {
                        await this.contract.isApprovedForAll(seller, zeroAddress);
                    } catch (e) {
                        assert.equal(e.message.includes("VM Exception while processing transaction: revert"), true);
                    }
                });

            });
        });
    });
});