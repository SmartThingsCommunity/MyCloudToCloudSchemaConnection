const _ = require('underscore');
const { CLIENT_ID, PERMITTED_REDIRECT_URLS } = require('../config');

function validateClientId(actualClientId, response) {
    if (actualClientId === CLIENT_ID) {
        return true;
    }
    response.writeHead(400, {
        "X-Debug": generateErrorMsg("client_id", CLIENT_ID, actualClientId)
    });
    return false;
}

function generateErrorMsg(descr, expected, actual) {
  return "expected " + descr + ": " + expected + ", actual: " + actual;
}

function validatePermittedRedirectURLs() {
    return _.reduce(PERMITTED_REDIRECT_URLS, (a, b) => a === "" ? b : a + ", " + b, "" );
}

function validateAuthRequest(request, response) {
    const actualClientId = request.query.client_id;
    if (validateClientId(actualClientId, response)) {
      if (request.query.response_type !== "code") {
        response.writeHead(401, {
          "X-Debug": generateErrorMsg("response_type", "code", request.query.response_type)
        });
        return false;
      }
      if (request.query.redirect_uri && ! _.contains(PERMITTED_REDIRECT_URLS, request.query.redirect_uri)) {
        response.writeHead(401, {
          "X-Debug" : generateErrorMsg("redirect_uri", "one of " + validatePermittedRedirectURLs(), request.query.redirect_uri)
        });
        return false;
      }
      return true;
    }
    return false;
}

module.exports = {
  generateErrorMsg,
  validateClientId,
  validateAuthRequest
};