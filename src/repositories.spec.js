const path = require('path');
const puppeteer = require('puppeteer');
// const { hacker } = require('faker');

const {
    getConsoleLink,
    setupEnvironment,
    login,
    screenshot
    // isFargateRegion,
    // addToManifest
} = require('../util');

let browser;
let consoleLink;

jest.setTimeout(600 * 1000);

beforeEach(async () => {
    setupEnvironment();
    browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/repositories');
});

afterEach(() => browser.close());

describe('repositories page', () => {
    test('shows up when navigated to', async () => {
        const page = await login(browser, consoleLink);

        await page.waitForSelector('awsui-button#create-repository-button');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/repositories-page.png'));

        expect(content.length).not.toBe(0);
    });
});
