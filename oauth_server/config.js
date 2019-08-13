module.exports = {
    CLIENT_ID: process.env.CLIENT_ID || "dummy-client-id",
    CLIENT_SECRET: process.env.CLIENT_SECRET || "dummy-client-secret",
    PERMITTED_REDIRECT_URLS: process.env.PERMITTED_REDIRECT_URLS ? process.env.PERMITTED_REDIRECT_URLS.split(",") : ["https://c2c-us.smartthings.com/oauth/callback"],
    SESSION_SECRET: process.env.SESSION_SECRET || '123'
};