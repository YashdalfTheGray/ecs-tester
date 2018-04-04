const path = require('path');
const puppeteer = require('puppeteer');
// const faker = require('faker');

const {
    getConsoleLink,
    setupEnvironment,
    login,
    screenshot,
    isFargateRegion,
    addToManifest
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

        await page.waitForSelector('awsui-button#create-cluster-button');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/clusters-page.png'));

        expect(content.length).not.toBe(0);
    });

    test('creates an empty cluster in non-fargate region', async () => {
        if (isFargateRegion(process.env.REGION)) {
            return;
        }

        const clusterName = `cluster-${Date.now()}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-select[items="role.options"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('awsui-checkbox#create-cluster-empty-checkbox');
        await page.click('aws-button[primary-button]');

        // launch status page
        await page.waitForSelector('[configure-cluster-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 5 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('cluster', clusterName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/empty-ec2-cluster.png'));

        expect(errors).toHaveLength(0);
    });
});
