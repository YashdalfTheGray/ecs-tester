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

    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/firstRun');
});

afterEach(() => browser.close());

describe('first run', () => {
    test('shows up when navigated to', async () => {
        const page = await login(browser, consoleLink);

        // firstRun
        await page.waitForSelector('.first-run-container');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/screenshotfr.png'));

        expect(content.length).not.toBe(0);
    });

    test('finishes out the first run', async () => {
        const page = await login(browser, consoleLink);

        // containers page
        await page.waitForSelector('.first-run-container');
        await page.click('aws-button[primary-button]');

        // service page
        await page.waitForSelector('.first-run-service');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/screenshotfr1.png'));

        expect(content.length).not.toBe(0);
    });
});
