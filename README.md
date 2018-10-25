# Star Notary Service on Etherium Network
## Contract on Rinkeby Test Network
1. Contract address at Rinkeby Network: `0x533C2dc83c9810e1F1debE92d47Eef09E17DA836`
2. ID of contract creation transaction:
```
0x24af8bbf4933fc63e753108616c212e81f1a278d131dec6304a9936b3483eae6
```
3. [URL on Etherscan of contract creation transaction](
https://rinkeby.etherscan.io/tx/0x24af8bbf4933fc63e753108616c212e81f1a278d131dec6304a9936b3483eae6)
2. [Contract page on Etherscan](
https://rinkeby.etherscan.io/address/0x533c2dc83c9810e1f1debe92d47eef09e17da836)
3. [Token Tracker on Etherscan](
https://rinkeby.etherscan.io/token/0x533c2dc83c9810e1f1debe92d47eef09e17da836?a=0x62fd352ac07c6135c963d3c032616ea62b9241b4
)

## How to interact with the Contract deployed at Rinkeby?
1. Clone this repo.
2. Open this project directory and start terminal.
3. Run
```
npm install
```
3. Start local http server
```
node index.js
```
3. In your Chrome Browser with Metamask extension installed open:
```
http://localhost:8080/index.html
```
3. Check section "What the User can do?" of this README (below).

## How to interact with the Contract deployed on your local test network?
1. Clone this repo
2. [Set up the Test Environment](./docs/Common-TestEnvSetup.md)
3. Open this project directory and start terminal.
4. Run
```
npm install
```
5. Follow below steps if you are using `ganache-cli`
```
// Compile contracts
truffle compile --network development_cli

// Deploy contracts
truffle deploy --network development_cli
```
6. Follow below steps if you are using `ganache-ui`
```
// Compile contracts
truffle compile --network development_ui

// Deploy contracts
truffle deploy --network development_ui
```
7. The output of the `deploy` command will give you back contract address
8. Copy this contract address and open index.html in text editor.
9. Locate this code block in the `index.html`
```
// Star Notary @ Rinkeby
const STAR_NOTARY_ADDRESS = "0x533c2dc83c9810e1f1debe92d47eef09e17da836";

// Star Notary @ Local Development Network
// const STAR_NOTARY_ADDRESS = "0x56bd8eba040abe225d4eece9aaf33bfe40bc391f";
```
10. Replace the contract address in the last line with your contract
address.
11. Uncomment the last line.
12. Comment the second line, which declares address at Rinkeby test network.
13. Start local http server
```
node index.js
```
14. In your Chrome Browser with Metamask extension installed open:
```
http://localhost:8080/index.html
```
15. Check section "What the User can do?" of this README (below).

## What the User can do?
1. The user first need to login to the network using his Metamask extension for Chrome.
Until then, User will see the message, asking him to login.
2. The logged in user can claim the star by providing star name, story
and  coordinates and clicking `Claim this Star` button.
```
Caveat: There is no form validation, so the user can claim the star
with empty form.
```
3. IMPORTANT! Once the `Claim this Star` button is clicked, the user has to
submit the transaction with Metamask Chrome extension UI.
```
The request to the Network is asynchronous. So User will have to wait
until transaction is accepted by the Nework.
```
4. The user can see the status of the Transaction near the `Claim this Star` button.
```
Caveat: sometimes Rinkeby does not reply for a long time.
The page code waits for 240 seconds, and after considers the transaction
was rejected.
However, it may not be the case. The successfull transaction may be
accepted by the Network later.
```
5. The user can not claim the new star with the exact same coordinates of the star
that is already claimed.
```
Example:
The user has claimed the star with coordinates:
- right ascend = 1
- declination = 1
- magnitude = 1
Once any user will try to claim the star with the same coordinates,
contract will reject the transaction.
However, the new star with right ascend = 2, declination = 1,
magnitude = 1 can be claimed.
```
6. Page shows notifications to the user about the following events:
    1. Transaction was successful, the star is claimed.
    2. Transaction was rejected, the star with submitted coordinates already exists.
    3. Transaction processing will take longer than 240 seconds (when 240 seconds passed).
7. Notifications are dissmissed within 10 seconds.
8. The user can search the star by token Id.

## Dependencies
1. Star Notary extends [ERC721Mintable.sol](
./node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol)
from [OpenZeppelin](https://openzeppelin.org/)
2. `index.html` uses `truflle-contract.min.js`, that allows to call
contract using `async/await`.

## How to run automated tests on your local machine?
1. Clone this project
2. Open Terminal in project directory
3. Run
```
truffle test
```