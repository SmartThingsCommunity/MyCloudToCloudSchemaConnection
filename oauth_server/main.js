require('dotenv').config();
const { OauthServer } = require('./lib/server');
const app = new OauthServer();
app.launch();