import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Board {
    @bindable value;
    WIDTH = 3;
    HEIGHT = 4;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.score = 0;
        this._newTiles();
        this.allCorrectCombinations = [];
        this.testing = window.location.href.includes('localhost');
    }

    attached() {
        this._clickSubscription = this._eventAggregator.subscribe('tile-clicked', _ => this._checkWin());
        this._hintSubscription = this._eventAggregator.subscribe('draw', _ => {
            const combination = this._findCorrectCombinations();
            if (combination) {
                this.deck.forEach(tile => {
                    tile.marked = false;
                    tile.drawn = false;
                });
                this.highLightTiles(combination);
                this.score -= 2;
            } else {
                const tile = this.deck.filter(tile => !tile.onBoard)[0];
                this._highlightTiles([tile]);
                this.score += 2;
            }
            const randomIndex = this._getRandomIndex();
            this.deck[randomIndex].drawn = true;
        });
        this._toDeckSubscription = this._eventAggregator.subscribe('tile-to-deck-ready', _ => {
            clearTimeout(this._toDeckTimeout);
            this._toDeckTimeout = setTimeout(() => {
                this._findCorrectCombinations();
            }, 1000);
        });
        this._interactionTracker = document.body.addEventListener('mousemove', this._adjustPupils);

        setTimeout(() => {
            this._findCorrectCombinations();
        }, 1000);
    }

    detached() {
        this._clickSubscription.dispose();
        this._hintSubscription.dispose();
        this._readySubscription.dispose();
        this._toDeckSubscription.dispose();
        document.body.removeEventListener('mousemove', this._adjustPupils);
    }

    _adjustPupils = (event) => {
        if (this.positionThrottle) return;
        this.positionThrottle = setTimeout(() => {
            this._eventAggregator.publish('mouse-position', { x: event.x, y: event.y });
            this.positionThrottle = null;
        }, 100);
    }

    _denyTile(tile) {
        tile.deny = true;
        setTimeout(_ => {
            tile.deny = false;
            tile.marked = false;
        }, 700);
    }

    _denyTiles(tiles) {
        tiles.forEach(tile => this._denyTile(tile));
    }

    _highlightTile(tile) {
        tile.marked = true;
        setTimeout(_ => tile.marked = false, 2000);
    }

    _highlightTiles(tiles) {
        tiles.forEach(tile => this._highlightTile(tile));
    }

    highLightTiles() {
        this._lastCombinationIndex = this._lastCombinationIndex !== undefined ? (this._lastCombinationIndex + 1) % this.allCorrectCombinations.length : 0;
        this._lastCombinationIndex !== undefined && this._highlightTiles(this.allCorrectCombinations[this._lastCombinationIndex]);
    }

    _getRandomIndex() {
        let tile, index, found = false;
        while (!found) {
            index = Math.floor(Math.random() * this.deck.length);
            tile = this.deck[index];
            if (!(tile.onBoard || tile.marked || tile.toBoard || tile.toDeck || tile.chosen || tile.drawn)) {
                found === true;
                tile.chosen = true;
                return index;
            };
        }
    }

    _newTiles() {
        this._buildDeck();
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                const randomIndex = this._getRandomIndex();
                const tile = this.deck[randomIndex];
                tile.x = x;
                tile.y = y;
                tile.onBoard = true;
                tile.marked = false;
            }
        }
        this.deck.forEach(tile => tile.chosen = false);
    }

    _buildDeck() {
        const features = ['left', 'center', 'right'];
        this.deck = [];
        for (let i = 0; i < features.length; i++) {
            for (let j = 0; j < features.length; j++) {
                for (let k = 0; k < features.length; k++) {
                    for (let l = 0; l < features.length; l++) {
                        this.deck.push({
                            id: this.deck.length,
                            chin: features[i],
                            hair: features[j],
                            nose: features[k],
                            mouth: features[l],
                            x: 0,
                            y: 0,
                            onBoard: false,
                            marked: false
                        });
                    }
                }
            }
        }
    }

    _isCorrect(tiles) {
        const alltreats = ['chin', 'hair', 'nose', 'mouth'];
        const treatSets = {};
        alltreats.forEach(treat => treatSets[treat] = new Set(tiles.map(tile => tile[treat])));

        const inclusiveResults = alltreats.map(treat => treatSets[treat].size === 1).filter(result => result).length;
        const exclusiveResults = alltreats.map(treat => treatSets[treat].size === 3).filter(result => result).length;
        const results = inclusiveResults + exclusiveResults;
        const correct = results === 4;

        return correct;
    }


    _renewTiles(markedTiles) {
        const randomIndices = [];
        const move2Board = (tileToBoard, tileToDeck) => {
            tileToBoard.x = tileToDeck.x;
            tileToBoard.y = tileToDeck.y;
            tileToBoard.toBoard = true;
        }
        const move2Deck = tile => {
            tile.x = 0;
            tile.y = 0;
            tile.toDeck = true;
            if (tile.drawn) {
                tile.drawn = false;
            } else {
                tile.onBoard = false;
            }
        }
        markedTiles.forEach(tile => {
            randomIndices.push(tile.drawn ? -1 : this._getRandomIndex());
        });
        this.deck.forEach(tile => tile.chosen = false);
        for (let i = 0; i < markedTiles.length; i++) {
            const markedTile = markedTiles[i];
            if (markedTile.drawn) {
                move2Deck(markedTile);
            } else {
                const randomTile = this.deck[randomIndices[i]];
                move2Board(randomTile, markedTile);
                move2Deck(markedTile);
            }
        }
    }

    _checkWin() {
        this.markedTiles = this.deck.filter(tile => tile.marked);
        if (this.markedTiles.length === 3) {
            const result = this._isCorrect(this.markedTiles);
            if (result) {
                this.score += result;
                this._renewTiles(this.markedTiles);
            } else {
                this._denyTiles(this.markedTiles);
            }
        }
    }

    _findCorrectCombinations() {
        this.allCorrectCombinations = [];
        const visibleTiles = this.deck.filter(tile => tile.onBoard || tile.drawn);
        const combinations = this._getCombinations(visibleTiles, 3);
        for (const combination of combinations) {
            if (this._isCorrect(combination)) {
                this.allCorrectCombinations.push(combination);
            }
        }
        return this.allCorrectCombinations[0] || null;
    }

    _getCombinations(arr, len) {
        if (len === 1) return arr.map(x => [x]);
        let result = [];
        for (let i = 0; i < arr.length - len + 1; i++) {
            let current = arr[i];
            let rest = arr.slice(i + 1);
            for (let p of this._getCombinations(rest, len - 1)) {
                result.push([current, ...p]);
            }
        }
        return result;
    }
}
