import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Board {
    @bindable value;
    WIDTH = 3;
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
        document.body.addEventListener('touchmove', this._adjustPupils);
        this._clockFaceInterval = setInterval(() => {
            this._randomFeatureChange();
        }, 2000);
    }

    detached() {
        document.body.removeEventListener('mousemove', this._adjustPupils);
        document.body.removeEventListener('touchmove', this._adjustPupils);
        clearInterval(this._clockFaceInterval);
    }

    _adjustPupils = (event) => {
        if (this.positionThrottle) return;
        this.positionThrottle = setTimeout(() => {
            let x, y;
            if (event.touches && event.touches.length > 0) {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }
            this._eventAggregator.publish('pointer-position', { x, y });
            this.positionThrottle = null;
        }, 50);
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
        this._eventAggregator.publish('tile-changed');
    }

    _newTiles() {
        this.deck = [
            { id: 0, chin: 'left', hair: 'left', nose: 'left', mouth: 'left' },
            { id: 1, chin: 'center', hair: 'center', nose: 'center', mouth: 'center' },
            { id: 2, chin: 'right', hair: 'right', nose: 'right', mouth: 'right' },
        ];
    }

}
