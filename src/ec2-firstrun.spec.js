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

describe('ec2 first run', () => {
    test('shows up when navigated to', async () => {
        if (isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        await page.waitForSelector('[create-first-task-definition-v2]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/ec2-firstrun.png'));

        expect(content.length).not.toBe(0);
    });

    test('finishes out the process', async () => {
        if (isFargateRegion()) {
            return;
        }

        const clusterName = 'default-ecs-tester';
        const page = await login(browser, consoleLink);

        // task def page
        await page.waitForSelector('[create-first-task-definition-v2]');
        await page.click('.aws-button .btn-primary');

        // service page
        await page.waitForSelector('[configure-runtime-v2]');
        await page.click('.aws-button .btn-primary');

        // cluster page
        await page.waitForSelector('[configure-cluster-v2]');
        await page.evaluate(() => {
            document.querySelector('awsui-textfield[ng-model="wizardValues.clusterName"] input').value = '';
        });
        await page.type('awsui-textfield[ng-model="wizardValues.clusterName"] input', clusterName);
        await page.focus('awsui-textfield[ng-model="wizardValues.numberOfInstances"] input'); // Change focus
        await page.waitFor(1000); // because we disable our buttons
        await page.click('.aws-button .btn-primary');

        // review page
        await page.waitForSelector('[review-first-run-v2]');
        await page.waitFor(1000); // because another disabled button
        await page.click('.aws-button .btn-primary');

        // launch page
        await page.waitForSelector('[wizard-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 600 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('taskDefinition', 'console-sample-app-static');
        await addToManifest('cluster', clusterName);
        await addToManifest('service', 'sample-webapp');
        await screenshot(page, path.resolve(process.cwd(), './artifacts/finished-ec2-firstrun.png'));

        expect(errors).toHaveLength(0);
    });
});
