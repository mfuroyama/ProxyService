'use strict';

const net = require('net');
const chalk = require('chalk');
const Link = require('./link');

class Mirror {
    constructor({
        name,
        localPort,
        remoteHost,
        remotePort,
    }) {
        Object.assign(this, {
            name,
            remoteHost,
            remotePort,
            port: localPort,
            links: {},
        });

        this.server = net.createServer((client) => {
            const linkOptions = {
                host: remoteHost,
                port: remotePort,
            };

            const link = new Link(client, linkOptions);
            link.on('error', this._onError.bind(this, link))
                .on('connect', this._onConnect.bind(this, link))
                .on('destroy', this._onDestroy.bind(this, link));

            console.log(`${chalk.green(name)}: Connection made (${chalk.yellow(link.id)})`);
            console.dir(Object.assign(linkOptions, {
                clientHost: client.remoteAddress,
                clientPort: client.remotePort,
            }), { depth: null, colors: true });
        });
        console.log(`${chalk.green(name)} proxy target: ${chalk.green(this.remoteHost)}:${chalk.green(this.remotePort)}`);
    }

    start() {
        console.log(`${chalk.green(this.name)}: Starting proxy interface...`);
        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`${chalk.green(this.name)}: Listening on port ${chalk.green.bold(this.port)}`);
        });
    }

    _onConnect(link, data) {
        this.links[link.id] = link;
    }

    _onDestroy(link, data) {
        const { id } = link;

        link.removeAllListeners();
        delete this.links[id];

        console.log(`${chalk.green(this.name)}: connection closed (${chalk.yellow(link.id)})`);
    }

    // eslint-disable-next-line
    _onError(link, err) {
        const { id } = link;
        console.log(chalk.red('An error occurred!'));
        console.dir({
            id,
            error: err.toString(),
            code: err.code || 'N/A',
            errno: err.errno || 'N/A',
        }, { depth: null, colors: true });
    }
}

module.exports = Mirror;
