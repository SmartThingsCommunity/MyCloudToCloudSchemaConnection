# My Clout to Cloud Schema Connection
This repository contains two Node.js applications, one that corresponds to a st-chema cloud to cloud web-hook, and a OAuth server.

## Table of Contents
I.   [General Considerations](#general)

II.  [Stack and Dependencies](#stack)

III. [Initial Setup](#setup)

IV.  [Web hook](#web-hook)

V.   [OAuth server](#oaut)

## General Considerations <a name="general"></a>
Please make sure to have completed the correspoding workspace configuration for a new cloud to cloud integration with st-schema before going through this example.

## Stack and Dependencies <a name="stack"></a>

| Name                  |
|-                      |
| Node.js               |
| dotenv                |
| express               |
| st-schema             |
| express-session       |
| randomstring          |

## Initial setup <a name="setup"></a>
To configure this project please have the following considerations.
1. API uses .env to set environment variables, such as CLIENT_ID & CLIENT_SECRET, please change them accordingly.
2. Create the .env file inside:
```
[MY_LOCATION]/MyCloudToCloudSchemaConnection/oauth_server
```
Content example:
```
NAME=[...]
PORT=[...]
CLIENT_ID=[...]
CLIENT_SECRET=[...]
SESSION_SECRET=[...]
```

## Web Hook <a name="web-hook"></a>

1. Navigate to path:
```
[MY_LOCATION]/MyCloudToCloudSchemaConnection/web_hook
```
2. execute the following bash script:
```bash
npm i
```
3. After Node modules have been installed execute:
```bash
node .
```
4. Open a new terminal tab and run the following script:
```bash
ssh -R webhook:80:localhost:3000 serveo.net
```

## OAuth Server <a name="oaut"></a>

1. Navigate to path:
```
[MY_LOCATION]/MyCloudToCloudSchemaConnection/oauth_server
```
2. execute the following bash script:
```bash
npm i
```
3. After Node modules have been installed execute:
```bash
node .
```
4. Open a new terminal tab and run the following script:
```bash
ssh -R oauthexample:80:localhost:7000 serveo.net
```