# Feature: Star Coordinates and Story
## What User can do?
1. User can check if Star with the given coordinates already exists.
```
this.contract.checkIfStarExists("032.155", "121.874", "245.978");
> true or false
```
2. User can get the star information by token id;
```
this.contract.tokenIdToStarInfo(1);
> ["awesome star number one", "I love this star one!", "ra_032.155", "dec_121.874", "mag_245.978"]
```
3. User can not get the star information for the token id, which does not exists.
```
this.contract.tokenIdToStarInfo(99);
> throws an Error
```
3. User can create a new Star using the following attributes:
    1. name
    2. story
    3. right ascend
    4. declination
    5. magnitude
```
// the first call to create a star works fine
this.contract.createStar("star1", "story1", "032.155", "121.874", "245.978");
```
4. User can not create a new Star with the all the same coordinates:
right ascend, declination, magnitude.
```
// now the Star with these coordinates already exists, and the second call to create a Star with the same coordinates will fail
this.contract.createStar("star2", "story2", "032.155", "121.874", "245.978");
> throws an Error
```
5. __However__, User can create a new Star with if one of three
coordinates is different from what exists in the System.
```
// now, if we change just one coordinate, it will succeed
this.contract.createStar("star2", "story2", "132.155", "121.874", "245.978");
```

## How to test?
1. Open Terminal in the Project directory.
2. Run Ganache
```
ganache-cli
```
> IMPORTANT! If you are using `ganache-cli`, make sure your `truffle.js`
has `port: 8545`.
3. Run:
```
truffle test test/F001-StarCoordinatesAndStory.js
```