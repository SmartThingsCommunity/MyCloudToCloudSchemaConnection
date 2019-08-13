// External Dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const _ = require('underscore');
const fs = require('fs');
const randomstring = require('randomstring');
// Internal Dependencies
const { CLIENT_SECRET, SESSION_SECRET } = require('../config');
const { generateErrorMsg, validateAuthRequest, validateClientId} = require('./util');
const view = _.template(fs.readFileSync(`${__dirname}/login.html`).toString());
// Custom OAuth Server
class OauthServer {

    constructor(config = {}) {
        this.config = config;
        this.code = {};
        this.refreshData = {};
        this.authHeaderData = {};
        this.tokenIdData = {};
        this.redirectUri = '';
        this.expressApp = express();
        this.setMiddleWare();
        this.setRoutes();
    }

    setMiddleWare() {
        this.expressApp.use(bodyParser.urlencoded({
            extended: false
        }));
        this.expressApp.use(session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false
            }
        }));
    }
    setRoutes() {
        this.expressApp
            .get('/oauth2/v1/authorize', this.authenticationCallback.bind(this))
            .get('/login', this.loginAsCallback.bind(this))
            .post('/oauth2/v1/token', this.tokenCallback.bind(this));

    }
    authenticationCallback(request, response) {
        if (validateAuthRequest(request, response)) {
            const { redirect_uri, state } = request.query;
            request.session.redirect_uri = redirect_uri;
            this.redirectUri = redirect_uri;
            if (state) {
                request.session.client_state = state ;
            }
            response.send(view({
                query: request.query
            })).end();
        } else {
            response.status(400).end();
        }
    }
    tokenCallback(request, response) {
        if (this.validateAccessTokenRequest(request, response)) {
            let code = null;
            const { body: { grant_type, refresh_token } } = request;
            if (grant_type === "refresh_token") {
                const refresh = refresh_token;
                const personData = this.refreshData[refresh];
                code = this.createToken(personData.name, personData.email, personData.expires_in, null);
                delete this.refreshData[refresh];
            } else {
                code = request.body.code;
            }
            const token = this.code[code];
            if (token !== undefined) {
                console.log("access token response body: ", token);
                response.send(token);
            }
        }
        response.end();
    }
    loginAsCallback(request, response) {
        const { query: { name, email, expires_in }, session: { client_state, redirect_uri } } = request;
        const code = this.createToken(name, email, expires_in, client_state);
        if (redirect_uri) {
            let redirectUri = redirect_uri;
            let location = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=${code}`;
            if (client_state) {
                location += "&state=" + client_state;
            }
            response.writeHead(307, {
                "Location": location
            });
            response.end();
        }
        response.status(400).end();
    }
    createToken(name, email, expires_in, client_state) {
        const code = "C-" + randomstring.generate(3);
        const accesstoken = "ACCT-" + randomstring.generate(6);
        const refreshtoken = "REFT-" + randomstring.generate(6);
        const id_token = "IDT-" + randomstring.generate(6);
        const token = {
            access_token: accesstoken,
            expires_in: expires_in,
            refresh_token: refreshtoken,
            id_token: id_token,
            state: client_state,
            token_type: "Bearer"
        };
        this.tokenIdData[id_token] = this.authHeaderData["Bearer " + accesstoken] = {
            email: email,
            email_verified: true,
            name: name
        };
        this.code[code] = token;
        this.refreshData[refreshtoken] = {
            name: name,
            email: email,
            expires_in: expires_in
        };
        return code;
    }
    validateAccessTokenRequest(request, response) {
        let success = true;
        let msg;
        const { body: { grant_type, client_id, client_secret, redirect_uri, refresh_token } }  = request;
        if (grant_type !== "authorization_code" && grant_type !== "refresh_token") {
            success = false;
            msg = generateErrorMsg("grant_type", "authorization_code or refresh_token", grant_type);
        }
        if (grant_type === "refresh_token") {
            let personData = this.refreshData[refresh_token];
            if (personData === undefined) {
                success = false;
                msg = "invalid refresh token";
            }
        }
        if (!validateClientId(client_id, response)) {
            success = false;
        }
        if (client_secret !== CLIENT_SECRET) {
            success = false;
            msg = generateErrorMsg("client_secret", CLIENT_SECRET, client_secret);
        }
        if (this.redirectUri !== redirect_uri) {
            success = false;
            msg = generateErrorMsg("redirect_uri", request.session.redirect_uri, redirect_uri);
        }
        if (!success) {
            const params = {};
            if (msg) {
                params["X-Debug"] = msg;
            }
            response.writeHead(401, params);
        }
        return success;
    }
    launch() {
        const port = process.env && process.env.PORT || 7000;
        const hostname = this.config && this.config.hostname || 'localhost';
        this.expressApp.listen(port, hostname, (err) => {
            if (err) {
                return console.log(err);
            } else {
                return console.log(`Server is running at port ${port}`);
            }
        });
    }
};

module.exports = {
    OauthServer
};