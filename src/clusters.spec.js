const path = require('path');
const puppeteer = require('puppeteer');
// const faker = require('faker');

const { getConsoleLink, setupEnvironment } = require('../util');

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
    const {
        REGION,
        AWS_ACCOUNT,
        IAM_USERNAME,
        IAM_PASSWORD
    } = process.env;
    const page = await browser.newPage();

    // account or alias page
    await page.goto(getConsoleLink(REGION));
    await page.waitForSelector('#resolver_container #resolving_input');
    await page.type('#resolver_container #resolving_input', AWS_ACCOUNT);
    await page.click('button#next_button');

    // IAM login page
    await page.waitForSelector('#accountFields #username');
    await page.type('#accountFields #username', IAM_USERNAME);
    await page.type('#accountFields #password', IAM_PASSWORD);
    await page.click('a#signin_button');

    // clusters page
    await page.waitForSelector('awsui-button#create-cluster-button');
    const content = await page.content();

    await page.screenshot({
        path: path.resolve(process.cwd(), './artifacts/screenshot.png'),
        fullPage: true
    });

    expect(content.length).not.toBe(0);
});
