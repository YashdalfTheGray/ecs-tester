const path = require('path');
const puppeteer = require('puppeteer');
// const faker = require('faker');

const {
    getConsoleLink,
    setupEnvironment,
    login,
    screenshot,
    isFargateRegion
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

describe('ec2 first run', () => {
    test('shows up when navigated to', async () => {
        if (isFargateRegion(process.env.REGION)) {
            return;
        }

        const page = await login(browser, consoleLink);

        // firstRun
        await page.waitForSelector('[create-first-task-definition-v2]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/ec2-firstrun.png'));

        expect(content.length).not.toBe(0);
    });

    test('finishes out the process', async () => {
        if (isFargateRegion(process.env.REGION)) {
            return;
        }

        const page = await login(browser, consoleLink);

        // firstRun
        await page.waitForSelector('[create-first-task-definition-v2]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/ec2-firstrun.png'));

        expect(content.length).not.toBe(0);
    });
});
