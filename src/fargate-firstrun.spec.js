const path = require('path');

const {
    getBrowser,
    getConsoleLink,
    login,
    screenshot,
    isFargateRegion,
    addToManifest
} = require('../util');

let browser;
let consoleLink;

jest.setTimeout(900 * 1000);

beforeEach(async () => {
    browser = await getBrowser();
    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/firstRun');
});

afterEach(() => browser.close());

describe('fargate first run', () => {
    test('shows up when navigated to [@read-only @firstrun @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        await page.waitForSelector('.first-run-container');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/initial-firstrun.png'));

        expect(content.length).not.toBe(0);
    });

    test('runs through the wizard [@read-only @firstrun @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        // containers page
        await page.waitForSelector('.first-run-container');
        await page.click('aws-button[primary-button]');

        // service page
        await page.waitForSelector('.first-run-service');
        await page.click('aws-button[primary-button]');

        // cluster page
        await page.waitForSelector('.first-run-cluster');
        await page.type('awsui-control-group[label="Cluster name"] input', '-ecs-tester');
        await page.click('aws-button[primary-button]');

        // review page
        await page.waitForSelector('.first-run-review');

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-firstrun.png'));
    });

    test('finishes out the process [@create @firstrun @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        // containers page
        await page.waitForSelector('.first-run-container');
        await page.click('aws-button[primary-button]');

        // service page
        await page.waitForSelector('.first-run-service');
        await page.click('aws-button[primary-button]');

        // cluster page
        await page.waitForSelector('.first-run-cluster');
        await page.type('awsui-control-group[label="Cluster name"] input', '-ecs-tester');
        await page.click('aws-button[primary-button]');

        // review page
        await page.waitForSelector('.first-run-review');
        await page.click('aws-button[primary-button]');

        // launch page
        await page.waitForSelector('.first-run-launch');
        await page.waitFor(
            () => !document.querySelectorAll('span.awsui-spinner').length,
            { timeout: 600 * 1000 }
        );
        const errors = await page.$$('.awsui-icon.alert-exclamation-circle');

        await addToManifest('taskDefinition', 'first-run-task-definition');
        await addToManifest('cluster', 'default-ecs-tester');
        await addToManifest('service', 'default-ecs-tester/sample-app-service');
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-firstrun.png'));

        expect(errors).toHaveLength(0);
    });
});
