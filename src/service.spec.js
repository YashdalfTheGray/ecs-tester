const path = require('path');
// const { hacker } = require('faker');

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
    test('shows up when navigated to [@read-only @services @ec2]', async () => {
        if (isFargateRegion()) {
            return;
        }

        // const serviceName = `cluster-${hacker.noun()}`;
        const page = await login(browser, consoleLink);

        await page.waitForSelector('[ecs-cluster-services]');
        const content = await page.content();

        await screenshot(page, path.resolve(process.cwd(), './artifacts/initial-service.png'));

        expect(content).not.toHaveLength(0);
    });
});
