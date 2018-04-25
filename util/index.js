const dotenv = require('dotenv');
const isDocker = require('is-docker');

const login = require('./login');
const addToManifest = require('./addToManifest');
const deleteResources = require('./deleteResources');

module.exports = {
    login: login,
    addToManifest: addToManifest,
    deleteResources: deleteResources,
    getConsoleLink: (region, service, subpath) =>
        `https://console.aws.amazon.com/${service}/home?region=${region}#${subpath}`,
    setupEnvironment: () => {
        if (!isDocker()) {
            dotenv.config();
        }
    },
    isFargateRegion: () => process.env.USE_FARGATE === 'true',
    screenshot: async (page, path) => (
        process.env.DEBUG === 'true' ? page.screenshot({ path: path, fullPage: true }) : false
    )
};
