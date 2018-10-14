# Feature: Star Token is ERC721Mintable
## What User can do?
### Transactions that mutate the contract state
1. Mint New Token Transaction
    1. Access Control
        1. sender must be minter
    2. Invalid Input
        1. seller address must not be 0

2. Transfer Token Transaction
    1. Access Control
        1. sender must own the transferred token
    2. Invalid Input
        1. 'from' address must own the transferred token
        2. token must exist

3. Grant Transfer Rights For One Token To Agent Transaction
    1. Access Control
        1. sender must own the token
    2. Invalid Input
        1. token must exist
        2. agent address must not be 0

4. Manage Transfer Rights For All Tokens To Operator Transaction
    1. Access Control
        1. no limitations
    2. Invalid Input
        1. operator address must be different from token owner address

### Transactions that read the contract state
1. Read Agent Address For One Token Transaction
    1. Access Control
        1. no limitations
    2. Invalid Input
        1. token must exist

2. Read Owner Address Of One Token Transaction
    1. Access Control
        1. no limitations
    2. Invalid Input
        1. token must exist

3. Read Status Of Token Transfer Rights Given By Owner To Operator Transaction
    1. Access Control
        1. no limitations
    2. Invalid Input
        1. owner address must not be 0
        2. operator address must not be 0

## How to test?
1. [Setup your test environment](./Common-TestEnvSetup.md)
2. Run in project directory
```
truffle test test/F002-ERC721Mintable.js
```