pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract StarNotary is ERC721Mintable {

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

    constructor(string name, string symbol) ERC721Full (name, symbol) public {}

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

    function checkIfStarExists(string _ra, string _dec, string _mag) public view returns (bool) {
        bool exists = false;
        bytes memory coordinates = bytes(concatThreeStrings(_ra, _dec, _mag));
        if(existingCoordinatesToToken[keccak256(coordinates)] != 0) exists = true;
        return exists;
    }

    function concatTwoStrings(string _firstString, string _secondString) internal constant returns (string){
        // we need to access individual bytes of first string
        bytes memory firstStringAsByteArray = bytes(_firstString);

        // we also need to access individual bytes of second string
        bytes memory secondStringAsByteArray = bytes(_secondString);

        // now we need to calculate the length of target string
        uint256 targetStringLength = firstStringAsByteArray.length + secondStringAsByteArray.length;

        // now we create the new empty string - this is our target string
        string memory emptyStringOfTargetLength = new string(targetStringLength);

        // we also need to access it's individual bytes
        bytes memory targetStringByteArray = bytes(emptyStringOfTargetLength);

        // now we need to copy each byte of first string to target string
        uint targetByteIndex = 0; // index of the byte in target string

        for (uint sourceByteIndex = 0; sourceByteIndex < firstStringAsByteArray.length; sourceByteIndex++) {
            targetStringByteArray[targetByteIndex++] = firstStringAsByteArray[sourceByteIndex];
        } // first string copied to target string
        for (sourceByteIndex = 0; sourceByteIndex < secondStringAsByteArray.length; sourceByteIndex++) {
            targetStringByteArray[targetByteIndex++] = secondStringAsByteArray[sourceByteIndex];
        } // second string copied to target string
        return string(targetStringByteArray);
    }

    function concatThreeStrings(string _firstString, string _secondString, string _thirdString) internal constant returns (string) {
        return concatTwoStrings(concatTwoStrings(_firstString, _secondString), _thirdString);
    }

    function compareStrings (string a, string b) internal view returns (bool){
        // we hash both strings using Etherium native hash function keccak256()
        // and compare hashes
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}