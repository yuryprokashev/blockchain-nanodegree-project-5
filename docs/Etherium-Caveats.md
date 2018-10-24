# Etherium Caveats
Once I started with Project 5 of Udacity Blockchain Developer
Nanodegree, Term1, I realized that Etherium platform has a lot of
unclear errors. These errors are very difficult to debug.

I started to write them down in this doc.

## Caveat-001. Deploying a contract that has unimplemented method or constructor
### What happened?
In my case, all I did was changing this code:
```
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {}
```

to this
```
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract StarNotary is ERC721Mintable {}
```

I wanted to inherit from another implementation of ERC721, that has `mint`
method implemented.

### How Etherium tells you about it?
`Error: The contract code couldn't be stored, please check your gas amount.`

Really? I tried to change the amount of gas in my `truffle.js`, but it did not help.

### What really happened?
The `StarNotary` contract did not have `constructor` when it become `ERC721Mintable`.

In turn `ERC721Mintable` is `ERC721Full`.

And `ERC721Full` is `ERC721Metadata`.

And `ERC721Metadata` has `constructor(string name, string symbol)`.

The message about gas, that Etherium gave me, said that my contract
does not inherit from the contract with constructor properly.

### How to solve it?
All I need to do is to add the `constructor` to my contract, so it
properly invokes the `constructor` of its distant parent.
```
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract StarNotary is ERC721Mintable {
    // ...contract properties

    constructor(string name, string symbol) ERC721Full (name, symbol) public {}

    // ...contract functions
}
```

### Sources
1. [Exact same issue with constructor agruments](
https://github.com/OpenZeppelin/openzeppelin-solidity/issues/629)
2. [Another issue that gives the same error, but is related to unimplemented method of the interface](
https://mandarvaze.bitbucket.io/posts/please-check-your-gas-amount-maybe-misleading/)

## Caveat-002. Ganache UI gas limit can not be reset to default.

### What happened?
In my case I changed the `GAS LIMIT` property to blank in my Ganache UI client:

![](https://www.dropbox.com/s/vwdrvvyohmztj9o/Screenshot%202018-10-12%2020.31.10.png?dl=1)

### How Etherium tells you about it?
I run my javascript tests using `truffle test` and I see:

`Error: Exceeds block gas limit`

### What really happened?
Ganache UI client does not update `GAS LIMIT` property to default, after
you had changed it to some number.

### How to solve it?
#### Change the gas limit to big value.
Like 20,000,000.

#### Try to re-install Ganache UI
I did not try this option.

## Caveat-0033. When contract has constructor with arguments, JS code must pass them.
### What happened?
I changed my `StarNotary.sol` to inherit from the `ERC721Mintable`.

I added the two arguments into the `constructor` (see Caveat-1):

And then I tried to run my Javascript tests.

### How Etherium tells you about it?

`Error: StarNotary contract constructor expected 2 arguments, received 0`

### What really happened?
My tests were creating the contract like this:
```
beforeEach(async function () {
    this.contract = await StarNotary.new({from: defaultAccount});
});
```
And I just added two arguments to the constructor of the contract.
Arguments, that are not used here in contract creation call.

## How to solve it?
```
beforeEach(async function () {
    this.contract = await StarNotary.new("Star Notary", "SNOT", {from: defaultAccount});
});
```

## Caveat-0044. Concatenating strings in Etherium
### What happened?
I followed the Project 5 review rubric. It asks to return the following response
on call to `tokeIdToStarInfo(tokenId)`:
```
["Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978"]
```

### How Etherium tells you about it?
Etherium does not say anything as Error.

The problem, though, is that Solidity does not support the concatenation
of the `string` types out of the box!

However, it does not support string concatenation for a good reason.

__You shall not concatenate strings in the smart contract code!__

Why? Because, you have your web-server for that!

Operations on Etherium network are not free. They cost gas.

Why would you want to concatenate string in smart contract, instead of
asking it to return the `struct tuple` as `array` and transform the
response into the fine formatted JSON on the web-server?

### What really happened?
Udacity asked to do an exercise, that is not a best practice of
Etherium developer. For whatever reason.

### How to solve it?
__Do not concatenate strings in your smart contract production code!__

## Caveat-005. Embedding structs into each other
<!--TODO Change article format to the common-->
Solidity does not support `struct` which is embedded into another `struct`.
```
struct Child {
    string name;
    uint8 age;
}
struct Parent {
    string parentName;
    Child child;
}
mapping(uint256 => Parent) public idToParentStruct;
```
When you try to call this via `Javascript` as

```
await contract.idToParentStruct(parentId);
```
Then you will get
```
Error: invalid solidity type!: tuple
```
__But this code works fine!__
```
struct Parent {
    string parentName;
    string childName;
    uint8 childAge;
}
mapping(uint256 => Parent) public idToParentStruct;
```

## Caveat-006. The sequence of require statements matter.
<!--TODO Change article format to the common-->
this order works properly
```
require(tokenIdsIssued[_tokenId] == true, "ERROR: This token does not exists");
require(this.ownerOf(_tokenId) == msg.sender, "ERROR: Only token owner can put star for sale");
```

This order will throw standard Etherium `VM Exception while processing transaction: revert`
but nothing more:
```
require(this.ownerOf(_tokenId) == msg.sender, "ERROR: Only token owner can put star for sale");
require(tokenIdsIssued[_tokenId] == true, "ERROR: This token does not exists");
```

The reason is that `require(this.ownerOf(_tokenId) == msg.sender)`
throws this error, because `_tokenId` does not exist. And the next
`require(tokenIdsIssued[_tokenId] == true)` is never called.

## Caveat-007. You will never get back error in live network.
Try you JS code that says something like this
```
myContract.myTransactionMethod(arg1, arg2, function (err, txHash) {
    if (err) return handleError(err);
}
```

[some reading about it](
https://programtheblockchain.com/posts/2017/12/13/building-decentralized-apps-with-ethereum-and-javascript/);

## Caveat-008. The web3 object injected by Metamask does not need to be
instantiated again.
In the lesson videos Elena shows the instantiation code of the
web3 object in case when it is injected by metamask. Project 5
boilerplate code contains the same code.

But it is not required.
All, that is required, is to check, if Metamask, or any other browser
plugin, injected the web3 object, or not. If not, application must
show error and ask user to log in (= authenticate with metamask, or
any other browser plugin wallet).

## Caveat-009. Official web3 from Etherium is still callback based.
But you can use the `truffle-contract` package to instantiate your
contracts.
There is a part about it called "2. Instantiation of the Contract" [here](
https://boostlog.io/@junp1234/how-to-make-a-dapp-of-a-pet-shop-using-solidity-and-truffle-5ab200c50814730093a2ec91)

__But please, do not do the other stuff, described in this article!__

## Caveat-010. Once you restarted your dev network, you need to re-compile
and re-deploy your contracts.

It is because, when you compile the contract for new network, contract
json `networks` property is updated with new network. Hence, your
contract has a new ABI. => You need to make sure, you instantiate
your contract by calling `TruffleContract(contractJson)` using the contract
with latest json.

### Caveat-10. To inject the metamask into you web page, you must run local http server and serve index.html from there
What? Seriously?

Damn, that's one of the most stupid things I have ever seen. :(
why injecting the web3 into the web page directly and then ask to
run local web server to serve it. One can just run the remote web server
and server the page from there. I do not get it. Really.
[This is the source article](
https://ethereum.stackexchange.com/questions/16130/metamask-injected-web3-not-working-in-html-file)