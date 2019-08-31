'use strict';

const sql = require('mssql');
const chalk = require('chalk');

// =====================================================================================================================
// This value id hard-coded now for the current JLV Docker/Vagrant dev environment, but it could be made into
// a configuration parameter
const PROXY_HOSTNAME = 'docker.for.mac.host.internal';
// =====================================================================================================================

const convertToStringList = (values) => {
    const quotedValues = values.map(value => `'${value}'`);
    return `(${quotedValues.join(', ')})`;
};


const modifyEndpoints = async (config, db) => {
    const siteMap = config.reduce((map, site) => {
        const { name, localPort: port, localHost: host = PROXY_HOSTNAME } = site;
        map[name] = { host, port };
        return map;
    }, {});

    // Connect to the database here
    const {
        username, password, hostname, dbname,
    } = db;
    const connectURL = `mssql://${username}:${password}@${hostname}/${dbname}`;
    await sql.connect(connectURL);

    // Query the database for the SITES, based on the site names in the configuration
    const sites = Object.keys(siteMap);
    const siteQueryResults = await sql.query(`SELECT id, name FROM SITES WHERE name IN ${convertToStringList(sites)}`);

    // Create a site map from the data retrieved. We'll use this later when we create the set of "restore" settings.
    const updateMap = siteQueryResults.recordset.reduce((map, obj) => {
        const { id, name } = obj;
        const site = siteMap[name];

        map[id] = Object.assign({ name }, site);
        return map;
    }, {});

    // With the data we have, modify the database tables with the values in our configuration.
    const originalValues = await Promise.all(Object.keys(updateMap).map(async (siteId) => {
        const { name, host, port } = updateMap[siteId];

        const endpoint = await sql.query(`SELECT id, siteid, host, port FROM ENDPOINTS WHERE siteid = ${siteId} AND host NOT LIKE '%jdbc%'`);
        const [currentValues] = endpoint.recordset;

        // Make nice-nice strings to show the user what we're doing, then run the SQL update query on the ENDPOINT table
        const { id, host: originalHost, port: originalPort } = currentValues;
        const originalEndpoint = `${originalHost}:${originalPort}`;
        const newEndpoint = `${host}:${port}`;

        console.log(`${chalk.green(name)}: ${chalk.green.bold(originalEndpoint)} ==> ${chalk.green.bold(newEndpoint)}`);
        await sql.query(`UPDATE ENDPOINTS SET host = '${host}', port = ${port} WHERE id = ${id}`);

        // Return the original values for restoration
        return { name, localHost: originalHost, localPort: originalPort };
    }));

    console.log();
    await sql.close();

    // Build a 'restoration' config object with the original values retrieved from the ENDPOINT query. We'll use
    // this configuration back into this function to retore the DB settings to its original values.
    return originalValues;
};

module.exports = { modifyEndpoints };
