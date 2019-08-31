'use strict';

const EVENT_OPTION_MAP = {
    SIGINT: { type: 'SIGNAL' },
    SIGUSR1: { type: 'SIGNAL' },
    SIGUSR2: { type: 'SIGNAL' },
    uncaughtException: { type: 'EXCEPTION' },
    unhandledRejection: { type: 'REJECT' },
};

class ProcessEventHandler {
    constructor() {
        // Add the mapped signals and shutdown handlers to process shutdown events
        Object.keys(EVENT_OPTION_MAP).forEach((event) => {
            const options = EVENT_OPTION_MAP[event];
            process.on(event, this._onShutdownEvent.bind(this, Object.assign(options, { name: event })));
        });
        this.handleShutdown = null;
    }

    _onShutdownEvent(options, reason, other) {
        const { type = 'UNKNOWN' } = options;
        const results = { type, reason, code: 0 };

        switch (type) {
            case 'SIGNAL':
                Object.assign(results, { reason: options.name });
                break;
            case 'EXCEPTION':
            case 'REJECT':
                Object.assign(results, { code: -1 });
                break;
            case 'UNKNOWN':
            default:
        }

        this.handleShutdown(results);
    }

    onShutdown(shutdownFunc) {
        this.handleShutdown = (typeof shutdownFunc === 'function') ? shutdownFunc : this.handleShutdown;
    }
}

const Process = new ProcessEventHandler();
module.exports = { Process };
