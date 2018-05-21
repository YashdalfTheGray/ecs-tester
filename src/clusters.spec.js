const path = require('path');
const { hacker } = require('faker');

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
    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/clusters');
});

afterEach(() => browser.close());

describe('clusters page', () => {
    test('shows up when navigated to [@read-only @clusters @ec2 @fargate]', async () => {
        const page = await login(browser, consoleLink);

        await page.waitForSelector('awsui-button#create-cluster-button');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/initial-cluster.png'));

        expect(content.length).not.toBe(0);
    });

    test('runs through the ec2 cluster wizard [@read-only @clusters @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
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
        await page.click('label.awsui-control-group-label');

        const errors = await page.$$('.awsui-control-group-controls > .awsui-control-group-validation-message');

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-cluster-ec2.png'));

        expect(errors).toHaveLength(0);
    });

    test('runs through the fargate cluster wizard [@read-only @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-control-group[label="Create VPC"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('awsui-control-group[label="Create VPC"] awsui-checkbox');

        const errors = await page.$$('.awsui-control-group-controls > .awsui-control-group-validation-message');

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-cluster-fargate.png'));

        expect(errors).toHaveLength(0);
    });

    test('runs through the ec2 cluster wizard when fargate enabled [@read-only @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('div#create-cluster-ec2-card');
        await page.click('div#create-cluster-ec2-card');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-select[items="role.options"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('label.awsui-control-group-label');

        const errors = await page.$$('.awsui-control-group-controls > .awsui-control-group-validation-message');

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-cluster-ec2.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates an empty cluster in non-fargate region [@create @clusters @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
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
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-ec2-empty.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates a cluster in non-fargate region [@create @clusters @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
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
        await page.click('aws-button[primary-button]');

        // launch status page
        await page.waitForSelector('[configure-cluster-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 600 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('cluster', clusterName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-ec2.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates an empty fargate cluster in fargate region [@create @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-control-group[label="Create VPC"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('aws-button[primary-button]');

        // launch status page
        await page.waitForSelector('[configure-cluster-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 5 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('cluster', clusterName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-fargate-empty.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates a fargate cluster in fargate region [@create @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-control-group[label="Create VPC"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('awsui-control-group[label="Create VPC"] awsui-checkbox');
        await page.click('aws-button[primary-button]');

        // launch status page
        await page.waitForSelector('[configure-cluster-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 600 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('cluster', clusterName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-fargate.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates an empty ec2 cluster in fargate region [@create @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('div#create-cluster-ec2-card');
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
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-ec2-empty.png'));

        expect(errors).toHaveLength(0);
    });

    test('creates a ec2 cluster in fargate region [@create @clusters @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const clusterName = `cluster-${hacker.noun().replace(/ /g, '-')}`;
        const page = await login(browser, consoleLink);

        // clusters page
        await page.waitForSelector('awsui-button#create-cluster-button');
        await page.click('awsui-button#create-cluster-button');

        // cluster type page
        await page.waitForSelector('aws-button[primary-button]');
        await page.click('div#create-cluster-ec2-card');
        await page.click('aws-button[primary-button]');

        // create cluster page
        await page.waitForSelector('awsui-select[items="role.options"]');
        await page.type('input#awsui-textfield-0', clusterName);
        await page.click('aws-button[primary-button]');

        // launch status page
        await page.waitForSelector('[configure-cluster-launch-status]');
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 600 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('cluster', clusterName);
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-cluster-ec2.png'));

        expect(errors).toHaveLength(0);
    });
});
