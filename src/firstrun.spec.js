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

jest.setTimeout(600 * 1000);

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

        await screenshot(page, path.resolve(process.cwd(), './artifacts/first-run.png'));

        expect(content.length).not.toBe(0);
    });

    test('finishes out the first run', async () => {
        const page = await login(browser, consoleLink);

        // containers page
        await page.waitForSelector('.first-run-container');
        await page.click('aws-button[primary-button]');

        // service page
        await page.waitForSelector('.first-run-service');
        await page.click('aws-button[primary-button]');

        // cluster page
        await page.waitForSelector('.first-run-cluster');
        await page.click('aws-button[primary-button]');

        // review page
        await page.waitForSelector('.first-run-review');
        await page.click('aws-button[primary-button]');

        // launch page
        await page.waitForSelector('.first-run-launch');
        await page.waitFor(
            () => !document.querySelectorAll('span.awsui-spinner').length,
            { timeout: 300 * 1000 }
        );
        const errors = await page.$$('.awsui-icon.alert-exclamation-circle');

        await screenshot(page, path.resolve(process.cwd(), './artifacts/finished-first-run.png'));

        expect(errors).toHaveLength(0);
    });
});
