const { ClusterCleanup } = require('cluster-cleanup');

const { getEcrClient, getEcsClient } = require('.');

module.exports = async (manifest) => {
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env;
    if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
        console.log('No API access, skipping resource deletion');
        return Promise.resolve();
    }

    return Promise.all(manifest.resources.map((r) => {
        console.log(`Deleting ${r.type} ${r.name}`);
        switch (r.type) {
        case 'cluster':
            return deleteCluster(r);
        case 'repository':
            return deleteRespository(r);
        case 'taskDefinition':
            return deregisterTaskDef(r);
        default:
            return Promise.resolve();
        }
    }));
};

const deleteCluster = async (r) => {
    const cleanup = new ClusterCleanup({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION,
        enableFargate: process.env.USE_FARGATE
    });

    const events = cleanup.deleteClusterAndResources(r.name, { verbose: true });

    return new Promise((resolve, reject) => {
        events.onDone((clusterName) => {
            resolve(clusterName);
        });
        events.onError((error) => {
            reject(error);
        });
    });
};

const deregisterTaskDef = async (r) => {
    const ecs = getEcsClient();

    const describeResponse = await ecs.describeTaskDefinition({
        taskDefinition: r.name
    }).promise();

    return ecs.deregisterTaskDefinition({
        taskDefinition: describeResponse.taskDefinition.taskDefinitionArn
    }).promise();
};

const deleteRespository = async r =>
    getEcrClient().deleteRepository({ force: true, repositoryName: r.name }).promise();
