const path = require('path');
const puppeteer = require('puppeteer');
const { hacker } = require('faker');

const {
    getConsoleLink,
    login,
    screenshot,
    addToManifest
} = require('../util');

let browser;
let consoleLink;

jest.setTimeout(300 * 1000);

beforeEach(async () => {
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

    test('finishes out the flow', async () => {
        const repoName = `repo-${hacker.verb()}`;
        const page = await login(browser, consoleLink);

        // repositories page
        await page.waitForSelector('awsui-button#create-repository-button');
        const ecrPictures = await page.$$('.ecr-key-function-img');
        if (ecrPictures.length > 0) {
            // on the get started page
            await page.click('awsui-button[text="Get Started"]');
        }
        else {
            // on the list repositories page
            await page.click('awsui-button#create-repository-button');
        }

        // create repository page
        await page.waitForSelector('awsui-textfield[ng-model="wizardValues.repositoryName"]');
        await page.type('awsui-textfield[ng-model="wizardValues.repositoryName"] input', repoName);
        await page.click('aws-button[primary-button]');

        // push image page
        await page.waitForSelector('awsui-alert[type="success"]');
        const content = await page.content();

        await addToManifest('repository', repoName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/repository.png'));

        expect(content.length).not.toBe(0);
    });
});
