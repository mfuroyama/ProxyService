'use strict';

const chalk = require('chalk');
const Mirror = require('./mirror');
const config = require('./config');
const { modifyEndpoints } = require('./db');
const { Process } = require('./process');
const { version } = require('./package');

console.log(chalk.green(`==== Proxy Service, v${version} ====\n`));

const { db, sites } = config;

(async () => {
    // ================== Update the JLV SQL Server 'ENDPOINT' table with the correct proxy settings ===================
    console.log(chalk.green(`Modifying JLV ${chalk.white.bold('ENDPOINT')} database table...`));
    const restoreConfig = await modifyEndpoints(sites, db);

    let isShuttingDown = false;
    Process.onShutdown(({ type, reason, code }) => {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;

        if (code === -1) {
            console.log(chalk.red(reason.toString()));
            console.log(chalk.red.bold(reason.stack));
        }

        console.log(chalk.green(`\nRestoring JLV ${chalk.white.bold('ENDPOINT')} database table...`));
        modifyEndpoints(restoreConfig, db).then((setConfig) => {
            console.log(chalk.green('Restored JLV database!'));
            process.exit(code);
        }).catch((err) => {
            console.log(err);
            process.exit(-1);
        });
    });

    // ============================== Start the proxy services for each configured system ==============================
    sites.forEach((options) => {
        const { name } = options;

        console.log(`${chalk.green(name)}: Creating proxy interface...`);
        const mirror = new Mirror(options);
        mirror.start();

        return mirror;
    });
})();
