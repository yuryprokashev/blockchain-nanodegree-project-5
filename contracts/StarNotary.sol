pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        string ra; // right ascend
        string dec; // declination
        string mag; // magnitude
    }

    mapping(uint256 => Star) _tokenIdToStarInfo;
    mapping(uint256 => bool) tokenIdsIssued;
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => uint256) existingCoordinatesToToken;

    function createStar(
        string _name,
        string _story,
        string _rascend,
        string _declination,
        string _magnitude,
        uint256 _tokenId) public {

        require(checkIfStarExists(_rascend, _declination, _magnitude) == false, "ERROR: The star with these coordinates already exists");

        Star memory starData = Star(
            _name,
            _story,
                concatTwoStrings("ra_", _rascend),
                concatTwoStrings("dec_", _declination),
                concatTwoStrings("mag_", _magnitude)
        );

        _tokenIdToStarInfo[_tokenId] = starData;
        tokenIdsIssued[_tokenId] = true;
        bytes memory coordinates = bytes(concatThreeStrings(_rascend, _declination, _magnitude));
        bytes32 coordinatesHash = keccak256(coordinates);
        existingCoordinatesToToken[coordinatesHash] = _tokenId;

        _mint(msg.sender, _tokenId);
    }

    function tokenIdToStarInfo(uint256 _tokenId) public view
    returns(string name, string story, string ra, string dec, string mag) {
        require(tokenIdsIssued[_tokenId] == true, "ERROR: This token does not exists");
        Star memory s = _tokenIdToStarInfo[_tokenId];
        return (s.name, s.story, s.ra, s.dec, s.mag);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
}