# Asset Notary Service on Etherium
## Contract Deployed on Rinkeby Test Network
1. `Contract address: 0x533C2dc83c9810e1F1debE92d47Eef09E17DA836`
2. `TransactionId: 0x24af8bbf4933fc63e753108616c212e81f1a278d131dec6304a9936b3483eae6`
# Dependencies
1. `openzeppelin-solidity/ERC721Token.sol` - ERC721 interface implementation
from `Zeppelin`


# Project Features
## StarNotary is AssetNotary
1. Star Asset has Star Coordinates:
    1. declination
    2. magnitude
    3. right ascend
2. Star Coordinates are unique (`checkfStarExists()` function)
3. Star Asset has Star Story.
> Solidity can not iterate over mappings. I can create mapping with the
key = the coordinates. I can also create a hash of the coordinates and
create mapping from this hash.
I can also check regex support in Solidity.

> Another note is that Star Coordinates are Dec (dec), Mag (mag) and
Cent (ra). Star Story is not a Coordinate.


## AssetNotary
1. createAsset
2. putAssetForSale
3. buyAsset
4. doesAssetExist
5. mint
6. approve
7. safeTransferFrom
8. setApprovalForAll
9. getApproved
10. ownerOf
11. assetForSale
12. tokenIdToAssetInfo
    1. Response:
    `["Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978"]`



