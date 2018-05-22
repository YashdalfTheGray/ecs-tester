const dotenv = require('dotenv');
const isDocker = require('is-docker');
const puppeteer = require('puppeteer');
const { ECR, ECS } = require('aws-sdk');

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
        ['screenshot', 'interactive'].includes(process.env.DEBUG) ?
            page.screenshot({ path: path, fullPage: true }) :
            false
    ),
    getBrowser: async (otherOptions) => {
        let options;

        if (process.env.DEBUG === 'interactive' && !isDocker()) {
            options = { args: ['--no-sandbox'], headless: false, sloMo: 2000 };
        }
        else {
            options = { args: ['--no-sandbox'] };
        }

        return puppeteer.launch(Object.assign(options, otherOptions));
    },
    getEcsClient: () => new ECS({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION
    }),
    getEcrClient: () => new ECR({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION
    })
};
