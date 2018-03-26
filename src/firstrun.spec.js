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

beforeAll(async () => {
    setupEnvironment();
    browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/firstRun');
});

afterAll(() => browser.close());

describe('first run', () => {
    test('shows up when navigated to', async () => {
        const page = await login(browser, consoleLink);

        // firstRun
        await page.waitForSelector('.first-run-container');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/screenshotfr.png'));

        expect(content.length).not.toBe(0);
    });
});
