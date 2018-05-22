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
        default:
            return Promise.resolve();
        }
    }));
};

const deleteCluster = async (r) => {
    const ecs = getEcsClient();

    // 1. find CloudFormation stack
    // 2. find all services
    // 3. batch scale all services down to 0
    // 4. find all container instances
    // 5. deregister all container instances
    // 6. find all services, again
    // 7. delete all services
    // 8. delete CloudFormation stack
    // 9. poll CloudFormation until stack deleted
    // 10. delete cluster

    return Promise.resolve(r);
};

const deleteRespository = async r =>
    getEcrClient().deleteRepository({ force: true, repositoryName: r.name }).promise();
