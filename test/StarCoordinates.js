module.exports = class StarCoordinates {
    constructor(rightAscend, declination, magnitude) {
        this._ra = rightAscend;
        this._dec = declination;
        this._mag = magnitude;
        this._rightAscend = rightAscend;
        this._declination = declination;
        this._magnitude = magnitude;
    }

    get rightAscend() {
        return this._rightAscend;
    }

    get declination() {
        return this._declination;
    }

    get magnitude() {
        return this._magnitude;
    }
};