import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Board {
    @bindable value;
    WIDTH = 4;
    HEIGHT = 1;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.score = 0;
        this._newTiles();
        this.allCorrectCombinations = [];
        this.testing = window.location.href.includes('localhost');
    }

    attached() {
        document.body.addEventListener('mousemove', this._adjustPupils);
        this._clockFaceInterval = setInterval(() => {
            this._randomFeatureChange();
        }, 1000);
    }

    detached() {
        document.body.removeEventListener('mousemove', this._adjustPupils);
    }

    _adjustPupils = (event) => {
        if (this.positionThrottle) return;
        this.positionThrottle = setTimeout(() => {
            this._eventAggregator.publish('mouse-position', { x: event.x, y: event.y });
            this.positionThrottle = null;
        }, 100);
    }

    _randomFeatureChange() {
        const features = ['chin', 'hair', 'nose', 'mouth'];
        const values = ['left', 'center', 'right'];

        const tile = this.deck[Math.floor(Math.random() * this.deck.length)];
        const feature = features[Math.floor(Math.random() * features.length)];
        const currentValue = tile[feature];

        let newValue;
        do {
            newValue = values[Math.floor(Math.random() * values.length)];
        } while (newValue === currentValue);

        tile[feature] = newValue;
    }

    _newTiles() {
        // const features = ['left', 'center', 'right'];
        this.deck = [
            { id: 0, chin: 'left', hair: 'left', nose: 'left', mouth: 'left', x: 0, y: 0 },
            { id: 1, chin: 'center', hair: 'center', nose: 'center', mouth: 'center', x: 1, y: 0 },
            { id: 2, chin: 'right', hair: 'right', nose: 'right', mouth: 'right', x: 2, y: 0 },
            { id: 3, chin: 'left', hair: 'center', nose: 'right', mouth: 'left', x: 3, y: 0 },
        ];
    }

}
