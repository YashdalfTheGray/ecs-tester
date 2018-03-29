const dotenv = require('dotenv');
const isDocker = require('is-docker');

module.exports = {
    getConsoleLink: (region, service, subpath) =>
        `https://console.aws.amazon.com/${service}/home?region=${region}#${subpath}`,
    setupEnvironment: () => {
        if (!isDocker()) {
            dotenv.config();
        }
    },
    login: async (browser, url) => {
        const { AWS_ACCOUNT, IAM_USERNAME, IAM_PASSWORD } = process.env;
        const page = await browser.newPage();

        // AWS account id or alias page
        await page.goto(url);
        await page.waitForSelector('#resolver_container #resolving_input');
        await page.type('#resolver_container #resolving_input', AWS_ACCOUNT);
        await page.click('button#next_button');

        // IAM account login page
        await page.waitForSelector('#accountFields #username');
        await page.type('#accountFields #username', IAM_USERNAME);
        await page.type('#accountFields #password', IAM_PASSWORD);
        await page.click('a#signin_button');

        return page;
    },
    screenshot: async (page, path) => (
        process.env.DEBUG === 'true' ? page.screenshot({ path: path, fullPage: true }) : false
    ),
    isFargateRegion: region => ['us-east-1'].includes(region)
};
