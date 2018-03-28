const path = require('path');
const puppeteer = require('puppeteer');
// const faker = require('faker');

const {
    getConsoleLink,
    setupEnvironment,
    login,
    screenshot
} = require('../util');

let browser;
let consoleLink;

jest.setTimeout(60 * 1000);

beforeEach(async () => {
    setupEnvironment();
    browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/clusters');
});

afterEach(() => browser.close());

describe('clusters page', () => {
    test('shows up when navigated to', async () => {
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/clusters-page.png'));

        expect(content.length).not.toBe(0);
    });
});
