const path = require('path');

const taskDefSample = require('../util/sample-taskdef.json');

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

jest.setTimeout(300 * 1000);

beforeEach(async () => {
    browser = await getBrowser();
    consoleLink = getConsoleLink(process.env.REGION, 'ecs', '/taskDefinitions');
});

afterEach(() => browser.close());

describe('taskdef page', () => {
    test('shows up when navigated to [@read-only @taskdef @ec2 @fargate]', async () => {
        const page = await login(browser, consoleLink);

        await page.waitForSelector('awsui-button#create-new-task-def-button');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/initial-taskdef.png'));

        expect(content.length).not.toBe(0);
    });

    test('creates a new task def revision in non-fargate region [@create @taskdef @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        // taskdef list page
        await page.waitForSelector('awsui-button#create-new-task-def-button');
        await page.click('awsui-button#create-new-task-def-button');

        // taskdef create page
        await page.waitForSelector('awsui-button[text="Configure via JSON"]');
        await page.click('awsui-button[text="Configure via JSON"]');

        // taskdef json panel
        await page.waitFor(() => {
            document.querySelector('awsui-textarea.json-content-textarea textarea').value = '';
            return document.querySelector('awsui-textarea.json-content-textarea textarea').value === '';
        });
        await page.type('awsui-textarea.json-content-textarea textarea', JSON.stringify(taskDefSample, null, 2));
        await page.click('awsui-button[text="Save"]');
        await page.waitFor(1000); // pretty sure we disable the create button for some reason
        await page.click('awsui-button[text="Create"]');

        // results page
        await page.waitForSelector('div.view-task-definition');
        const success = await page.$$('awsui-alert[type="success"]');

        await addToManifest('taskDefinition', 'ecs-tester-taskdef');
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-taskdef-ec2.png'));

        expect(success).toHaveLength(1);
    });

    test('creates a new task def revision in fargate region [@create @taskdef @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const page = await login(browser, consoleLink);

        // taskdef list page
        await page.waitForSelector('awsui-button#create-new-task-def-button');
        await page.click('awsui-button#create-new-task-def-button');

        // taskded type page
        await page.waitForSelector('#create-task-def-fargate-card');
        await page.click('aws-button[primary-button]');

        // taskdef create page
        await page.waitForSelector('awsui-button[text="Configure via JSON"]');
        await page.click('awsui-button[text="Configure via JSON"]');

        // taskdef json panel
        await page.waitFor(() => {
            document.querySelector('awsui-textarea.json-content-textarea textarea').value = '';
            return document.querySelector('awsui-textarea.json-content-textarea textarea').value === '';
        });
        await page.type('awsui-textarea.json-content-textarea textarea', JSON.stringify(taskDefSample, null, 2));
        await page.click('awsui-button[text="Save"]');
        await page.waitFor(1000); // pretty sure we disable the create button for some reason
        await page.click('aws-button[primary-button]');

        // results page
        await page.waitFor(
            () => !document.querySelectorAll('awsui-alert[type="info"]').length,
            { timeout: 5 * 1000 }
        );
        const errors = await page.$$('awsui-alert[type="error"]');

        await addToManifest('taskDefinition', 'ecs-tester-taskdef');
        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-taskdef-fargate.png'));

        expect(errors).toHaveLength(0);
    });
});
