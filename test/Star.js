module.exports = class Star {
    constructor(name, story, coordinates){
        this._name = name;
        this._story = story;
        this._coordinates = coordinates;
    }

    get name() {
        return this._name;
    }

    get coordinates() {
        return this._coordinates;
    }

    get story() {
        return this._story;
    }
};