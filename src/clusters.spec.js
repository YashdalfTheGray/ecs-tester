const path = require('path');
const puppeteer = require('puppeteer');
const faker = require('faker');

const { getConsoleLink, setupEnvironment } = require('../util');

let browser;

beforeAll(async () => {
    setupEnvironment();
    browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
});

afterAll(() => browser.close());

test('this works', async () => {
    const page = await browser.newPage();

    console.log(faker.name.findName());

    await page.goto(getConsoleLink(process.env.REGION));
    const content = await page.content();

    await page.screenshot({
        path: path.resolve(process.cwd(), './artifacts/screenshot.png'),
        fullPage: true
    });

    expect(content.length).not.toBe(0);
});
