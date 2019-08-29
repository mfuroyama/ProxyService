# Proxy Service

## Background
If you encounter a situation where you need entities connected on different virtual network adapters (e.g.
Vagrant VMs and Docker containers) to communicate, you can use the **Proxy Service**. Basically, it serves as
a bi-directional bridge between the disparate adapters. The idea is:
* You configure and start the **Proxy Service** on your development host workstation
* In the system that initiates the connections, point the service to the **Proxy Service** host/port.
* ...
* Profit

## Prerequisites
* NodeJS (>= 8.0) / NPM
* Git

## Configuration
The **Proxy Service** runtime configuration is contained in the `config.json` file, which should contain an array
of JS Objects:

| Field Name | Type | Description |
|---|---|---|
| name | String | Cosmetic name of the target proxied system |
| remoteHost | String | Host name / IP address of the target system |
| remotePort | Number/String | TCP port of the target system |
| localPort | Number/String | TCP port of the proxied interface to the target system. |

If you are developing on a Mac and your connection initiator runs within the Docker context, you can replace the
hostname of the original target system with the following name:
`docker.for.mac.host.internal`

This name is the alias for the main host workstation that the Docker daemon is running on.

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

Good luck!!

