# Overview
This is a client part of the Sora Farm project. It is a SPA (single page application) that communicates with the server via HTTP requests.

# Build, test & run
`yarn` To install all project dependencies
`yarn build` Compiles an application

# Integration
Application depends on other project named [sora-farming-gateway](https://github.com/sora-xor/sora-farming-gateway).

# Configuration parameters
All configuration settings are saved in the file `config.json` in the folder `public`.

`eth-node-service` - Address of etherum node. (ex. `https://mainnet.infura.io/v3/<TOKEN>`)
`gateway-service` - Address of [sora-farming-gateway](https://github.com/sora-xor/sora-farming-gateway). (ex. `localhost:3000`)
