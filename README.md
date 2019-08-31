# Proxy Service

## Background
If you encounter a situation where you need entities connected on different virtual network adapters (e.g.
Vagrant VMs and Docker containers) to communicate, you can use the **Proxy Service**. Basically, it does two things:
* Serves as a bi-directional bridge between the disparate virtual network adapters (using the host as a dually-connected conduit)
* Modifies the JLV SQL Server Database **ENDPOINTS** table to point the VDS to the **Proxy Service**. (The service will also restore the database table back to its original settings on shutdown)

## Prerequisites
* NodeJS (>= 8.0) / NPM
* Git

## Assumptions
* Docker dev stack
    - _App Server_, _Database_ running as Docker containers
    - Host accessible from Docker containers via `localhost`
* JLV VISTA instances (AINA, KAI) running in Vagrant VMs
    - VMs accessible from host via Vagrant network IP addresses (e.g `10.2.100.101` etc.)

## Installation / Operation
Clone this repo:
```
> git clone https://github.com/hawaiirg/ProxyService
> cd ProxyService
```

From the repo directory:
```
> npm install
> npm start
```

## Configuration
The **Proxy Service** runtime configuration is contained in the `config.json` file, which should contain an array
of JS Objects:

| Field Name | Type | Description |
|---|---|---|
| db | Object | JLV SQL Server Database connection options |
| db.username | String | SQL Server account username |
| db.password | String | SQL Server account password |
| db.hostname | String | Host name or IP address of the SQL Server instance |
| db.dbmand | String | JLV settings database name |
| sites | Array{Object} | Proxy sites |
| sites.name | String | Name of the target proxied system, as entered in the JLV SQL Server **SITES** table. The **Proxy Service** will use this value to query and overwrite (and restore) the database entries associatd with this **SITES** name entry. |
| sites.remoteHost | String | Host name / IP address of the target system |
| sites.remotePort | Number/String | TCP port of the target system |
| sites.localPort | Number/String | TCP port of the proxied interface to the target system. |