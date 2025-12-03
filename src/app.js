import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import $ from 'jquery';

@inject(EventAggregator)
export class App {
    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        this.isDark = localStorage.getItem('dark-mode') ?? 'auto';
        this.setDarkMode(this.isDark);
        setTimeout(_ => this._eventAggregator.publish('dark-mode-changed', { mode: this.isDark, prefersDark: this.prefersDark }), 100);
    }

    setDarkMode(mode) {
        this.isDark = mode;
        $('html').removeClass('auto dark light').addClass(mode);
        localStorage.setItem('dark-mode', mode);
    }

    toggleDarkMode() {
        if (this.isDark === 'auto') {
            this.setDarkMode(this.prefersDark ? 'light' : 'dark');
        } else {
            this.setDarkMode(this.isDark === 'dark' ? 'light' : 'dark');
        }
        setTimeout(_ => this._eventAggregator.publish('dark-mode-changed', { mode: this.isDark, prefersDark: this.prefersDark }));
    }
}
