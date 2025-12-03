import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class Tile {
    @bindable tileObj;

    constructor(element, eventAggregator) {
        this._element = element;
        this._$element = $(element);
        this._eventAggregator = eventAggregator;
    }

    attached() {
        this.tileObj.toBoard = true;
        this.tileObj.onBoard = true;
        this._pupilsOffsetSubscription = this._eventAggregator.subscribe('mouse-position', mousePos => {
            if (!this.tileObj.onBoard) return;
            const centerX = this._$element.offset().left + this._$element.width() / 2;
            const centerY = this._$element.offset().top + this._$element.height() / 2;
            const distanceX = centerX - mousePos.x;
            const distanceY = centerY - mousePos.y;
            const maxDistance = Math.max(this._$element.width(), this._$element.height()) / 2;
            const mouseDx = distanceX / maxDistance; // -1 to 1
            const mouseDy = distanceY / maxDistance;
            const relativeDx = -.2 * mouseDx + 'px';
            const relativeDy = -.2 * mouseDy + 'px';
            this._element.style.setProperty('--pupilOffsetX', relativeDx);
            this._element.style.setProperty('--pupilOffsetY', relativeDy);
        });
        this._darkModeChangedSubscription = this._eventAggregator.subscribe('dark-mode-changed', data => {
            if (data.mode === 'dark' || (data.mode === 'auto' && data.prefersDark)) {
                this._$element.css('filter', 'invert(1)');
                this._$element.find('h2').css('filter', 'none');
            } else {
                this._$element.css('filter', '');
                this._$element.find('h2').css('filter', '');
            }
        })
    }

    detached() {
        this._pupilsOffsetSubscription.dispose();
        this._darkModeChangedSubscription.dispose();
    }

}
