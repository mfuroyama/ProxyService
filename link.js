'use strict';

const EventEmitter = require('events');
const chalk = require('chalk');
const net = require('net');
const uuid = require('uuid/v4');

class Link extends EventEmitter {
    constructor(client, { host, port }) {
        super();
        Object.assign(this, {
            client,
            isConnected: false,
            id: uuid(),
            remoteAddress: client.remoteAddress,
            remotePort: client.remotePort,
        });

        // Attempt a connection to the target host. Teardown and signal failure on conneciton error
        this.target = new net.Socket();
        this.target.once('error', (err) => {
            console.log(chalk.red(`Connection to target ${host}:${port} failed ${err.toString()}`));
            this._handleTeardown('TARGET', 'error');
        });
        this.isConnecting = true;
        this.target.connect(port, host, this.setup.bind(this));
    }

    setup() {
        // Remove the initial connection error listener
        this.target.removeAllListeners();

        // The heart of the Link functionality: wiring the two socket streams together
        this.target
            .on('error', this._handleError.bind(this, 'TARGET'))
            .on('end', this._handleTeardown.bind(this, 'TARGET', 'end'))
            .on('close', this._handleTeardown.bind(this, 'TARGET', 'close'))
            .pipe(this.client);

        this.client
            .on('error', this._handleError.bind(this, 'CLIENT'))
            .on('end', this._handleTeardown.bind(this, 'CLIENT', 'end'))
            .on('close', this._handleTeardown.bind(this, 'CLIENT', 'close'))
            .pipe(this.target);

        // If we're here, we're as good as connected. Stash variables in local state.
        Object.assign(this, {
            isConnecting: false,
            isConnected: true,
        });

        // Let the Mirror object know that we're connected
        this.emit('connect', {
            id: this.id,
            host: this.remoteAddress,
            port: this.remotePort,
        });
    }

    teardown({ source }) {
        if (!this.isConnected && !this.isConnecting) {
            return;
        }
        this.isConnected = false;
        this.isConnecting = false;

        this._handleDisconnect('TARGET');
        this._handleDisconnect('CLIENT');

        this.emit('destroy', {
            id: this.id,
            source,
        });
    }

    _handleTeardown(entity, event) {
        this.teardown({ source: entity });
    }

    _handleError(entity, err) {
        this.emit('error', err);
        this.teardown({ source: entity });
    }

    _handleDisconnect(entityName) {
        const entity = entityName.toLowerCase();
        this[entity].removeAllListeners();
        this[entity].destroy();
    }
}

module.exports = Link;
