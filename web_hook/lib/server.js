// Internal dependencies
const { discovery, command, stateRefresh, grantAccess, deleteIntegration } = require('./handlers');
let discoveryResponse = require("../responses/discoveryResponse.json");
// EXternal dependencies
const express = require('express');
const bodyParser = require('body-parser');

class Webhook {

    constructor(options = {}) {
        this.config =  options;
        this.expressApp = express();
        this.setMiddleWare();
        this.setRoutes();
    }
    setMiddleWare() {
        this.expressApp.use(bodyParser.json({type: 'application/json'}));
    }
    setRoutes() {
        this.expressApp
            .get('/', this.discoveryCallback.bind(this))
            .post('/', this.requestHandlerCallback.bind(this));
    }
    discoveryCallback(request, response) {
        console.log('request', request)
        response.writeHead(200, {'Content-Type': 'application/json'})
        response.write(JSON.stringify(discoveryResponse))
        response.end();
    }
    async requestHandlerCallback(request, response, next) {
        console.log('Request received: ' + JSON.stringify(request.body))
        let complete
        const { headers, authentication, devices, callbackAuthentication, globalError, deviceState } = request.body
        const { interactionType, requestId } = headers;
        // Validate token before handling interaction type.
       if(!this.isValidToken(authentication)) {
           return response.status(401).end();
       }
        try {
            switch (interactionType) {
            case "discoveryRequest":
                complete = discovery(requestId);
                break
            case "commandRequest":
                complete = command(requestId, devices);
                break
            case "stateRefreshRequest":
                complete = stateRefresh(requestId, devices);
                break
            case "grantCallbackAccess":
                complete = grantAccess(callbackAuthentication);
                break
            case "integrationDeleted":
                complete = deleteIntegration()
                break
            default:
                complete = "error. not supported interactionType" + interactionType
                break;
            }
        } catch (error) {
            next(error);
        }
        response.send(complete);
    }
    isValidToken(authentication) {
        // Change for proper validation before going to PROD.
        return authentication && authentication.token && authentication.token.length > 0
    }
    launch() {
        const port = process.env && process.env.PORT || 3000;
        const hostname = this.config && this.config.hostname || 'localhost';
        this.expressApp.listen(port, hostname, (err) => {
            if (err) {
                return console.log(err);
            } else {
                return console.log(`Server is running at port ${port}`);
            }
        });
    }
}
module.exports = { Webhook };