const path = require('path');
const { hacker } = require('faker');

const { getEcsClient } = require('../util');

const {
    getBrowser,
    getConsoleLink,
    screenshot,
    login,
    isFargateRegion
} = require('../util');

const clusterName = 'ecs-tester-services';
const taskDef = {
    family: 'ecs-tester-taskdef',
    networkMode: 'awsvpc',
    containerDefinitions: [{
        name: 'test-container',
        image: 'nginx',
        memoryReservation: '256',
        portMappings: [{ containerPort: 80, protocol: 'tcp' }]
    }],
    requiresCompatibilities: ['EC2', 'FARGATE'],
    cpu: '256',
    memory: '512'
};

let browser;
let consoleLink;
let ecs;

jest.setTimeout(900 * 1000);

beforeEach(async () => {
    ecs = getEcsClient();

    // await ecs.registerTaskDefinition(taskDef).promise();
    try {
        await ecs.describeTaskDefinition({ taskDefinition: taskDef.family }).promise();
    }
    catch (e) {
        await ecs.registerTaskDefinition(taskDef).promise();
    }

    await ecs.createCluster({ clusterName }).promise();

    browser = await getBrowser();
    consoleLink = getConsoleLink(process.env.REGION, 'ecs', `/clusters/${clusterName}`);
});

afterEach(async () => {
    await ecs.deleteCluster({ cluster: clusterName }).promise();
    await browser.close();
});

describe('services page', () => {
    test('shows up when navigated to [@read-only @services @ec2 @fargate]', async () => {
        const page = await login(browser, consoleLink);

        await page.waitForSelector('[ecs-cluster-services]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/initial-service.png'));

        expect(content).not.toHaveLength(0);
    });

    test('runs through ec2 service creation [@read-only @services @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const serviceName = `service-${hacker.noun()}`;
        const page = await login(browser, consoleLink);

        // list services
        await page.waitForSelector('[ecs-cluster-services]');
        await page.click('awsui-button[text="Create"]');

        // create service step 1
        await page.waitForSelector('[ecs-service-required-config]');
        await page.type('awsui-textfield[ng-model="config.serviceName"] > input', serviceName);
        await page.type('awsui-textfield[ng-model="config.desiredCount"] > input', '0');
        await page.click('label.awsui-control-group-label');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 2
        await page.waitForSelector('[network-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 3
        await page.waitForSelector('[asg-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service review
        await page.waitForSelector('[ecs-review-create-service]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-service.png'));

        expect(content).not.toHaveLength(0);
    });

    test('runs through ec2 service creation with fargate [@read-only @services @fargate]', async () => {
        if (!isFargateRegion()) {
            return;
        }

        const serviceName = `service-${hacker.noun()}`;
        const page = await login(browser, consoleLink);

        // list services
        await page.waitForSelector('[ecs-cluster-services]');
        await page.click('awsui-button[text="Create"]');

        // create service step 1
        await page.click('awsui-radio-button[value="EC2"] input');
        await page.waitForSelector('[ecs-service-required-config]');
        await page.type('awsui-textfield[ng-model="config.serviceName"] > input', serviceName);
        await page.type('awsui-textfield[ng-model="config.desiredCount"] > input', '0');
        await page.click('label.awsui-control-group-label');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 2
        await page.waitForSelector('[network-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 3
        await page.waitForSelector('[asg-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service review
        await page.waitForSelector('[ecs-review-create-service]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/complete-service.png'));

        expect(content).not.toHaveLength(0);
    });

    test.skip('finishes ec2 service creation [@create @services @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        const serviceName = `service-${hacker.noun()}`;
        const page = await login(browser, consoleLink);

        // list services
        await page.waitForSelector('[ecs-cluster-services]');
        await page.click('awsui-button[text="Create"]');

        // create service step 1
        await page.waitForSelector('[ecs-service-required-config]');
        await page.type('awsui-textfield[ng-model="config.serviceName"] > input', serviceName);
        await page.type('awsui-textfield[ng-model="config.desiredCount"] > input', '0');
        await page.click('label.awsui-control-group-label');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 2
        await page.waitForSelector('[network-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service step 3
        await page.waitForSelector('[asg-config]');
        await page.click('aws-button div.btn.btn-primary');

        // create service review
        await page.waitForSelector('[ecs-review-create-service]');
        await page.click('aws-button div.btn.btn-primary');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/created-service.png'));

        expect(content).not.toHaveLength(0);
    });
});
