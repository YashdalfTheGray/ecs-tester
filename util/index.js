const dotenv = require('dotenv');
const isDocker = require('is-docker');

const login = require('./login');

module.exports = {
    getConsoleLink: (region, service, subpath) =>
        `https://console.aws.amazon.com/${service}/home?region=${region}#${subpath}`,
    setupEnvironment: () => {
        if (!isDocker()) {
            dotenv.config();
        }
    },
    screenshot: async (page, path) => (
        process.env.DEBUG === 'true' ? page.screenshot({ path: path, fullPage: true }) : false
    ),
    isFargateRegion: region => ['us-east-1'].includes(region),
    login: login
};
