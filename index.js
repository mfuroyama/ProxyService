'use strict';

const chalk = require('chalk');
const Mirror = require('./mirror');
const config = require('./config');
const { version } = require('./package');

console.log(chalk.green(`==== Proxy Service, v${version} ====\n`));

config.forEach((options) => {
    const { name } = options;

    console.log(`${chalk.green(name)}: Creating proxy interface...`);
    const mirror = new Mirror(options);
    mirror.start();

    return mirror;
});
