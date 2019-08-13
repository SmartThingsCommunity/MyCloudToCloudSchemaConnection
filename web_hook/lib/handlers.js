const refreshResponse = require("../responses/refreshResponse.json");
let discoveryResponse = require("../responses/discoveryResponse.json");
const { partnerHelper, CommandResponse } = require("st-schema");
const stPartnerHelper = new partnerHelper({}, {});

function discovery(requestId) {
    discoveryResponse.headers.requestId = requestId;
    return discoveryResponse
}
function command(requestId, devices) {
    let response = new CommandResponse(requestId)
    devices.map(({ externalDeviceId, deviceCookie, commands }) => {
    const parsedDeviceCookie =  Array.isArray(deviceCookie) ? deviceCookie : [deviceCookie];
    const device = response.addDevice(externalDeviceId, parsedDeviceCookie);
    stPartnerHelper.mapSTCommandsToState(device, commands)
    });
    console.log("response: %j", response);
    return response;
}
function stateRefresh(requestId, devices) {
    let response = { "headers": { "schema": "st-schema", "version": "1.0", "interactionType": "stateRefreshResponse", "requestId": requestId }, "deviceState": [] }
    devices.map(({ externalDeviceId, deviceCookie }) => {
    let deviceResponse = refreshResponse[externalDeviceId]
    response.deviceState.push(deviceResponse);
    });
    console.log(response);
    return response;
}
function grantAccess() {
    console.log("grantCallbackAccess token is:", callbackAuthentication.code)
    console.log("grantCallbackAccess clientId is:", callbackAuthentication.clientId)
    return {};
}
function deleteIntegration() {
    return {};
}

module.exports = {
    discovery,
    command,
    stateRefresh,
    grantAccess,
    deleteIntegration
};