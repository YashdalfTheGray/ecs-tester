const path = require('path');
const puppeteer = require('puppeteer');
// const faker = require('faker');

const { getConsoleLink, setupEnvironment, login } = require('../util');

let browser;

jest.setTimeout(60 * 1000);

beforeAll(async () => {
    setupEnvironment();
    browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
});

afterAll(() => browser.close());

test('navigates to the cluster page', async () => {
    const page = await login(browser, getConsoleLink(process.env.REGION));

    // clusters page
    await page.waitForSelector('awsui-button#create-cluster-button');
    const content = await page.content();

    await page.screenshot({
        path: path.resolve(process.cwd(), './artifacts/screenshot.png'),
        fullPage: true
    });

    expect(content.length).not.toBe(0);
});
