const dotenv = require('dotenv');
const isDocker = require('is-docker');

module.exports = {
    getConsoleLink: (region, service = 'ecs') => `https://${region}.console.aws.amazon.com/${service}`,
    setupEnvironment: () => {
        if (!isDocker()) {
            dotenv.config();
        }
    }
};
