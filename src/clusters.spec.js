const puppeteer = require('puppeteer');
const faker = require('faker');

const { getConsoleLink } = require('../util');

let browser;

beforeAll(async () => {
    browser = await puppeteer.launch();
});

afterAll(() => browser.close());

test('this works', async () => {
    const page = await browser.newPage();

    console.log(faker.name.findName());

    await page.goto(getConsoleLink('us-east-1'));
    const content = await page.content();

    console.log(content);

    expect(content.length).not.toBe(0);
});
