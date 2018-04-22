const { ECR, ECS } = require('aws-sdk');

module.exports = async manifest => Promise.all(manifest.resources.map((r) => {
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

const deleteCluster = async (r) => {
    const ecs = new ECS({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION
    });

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

const deleteRespository = async r => new ECR({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
}).deleteRepository({ force: true, repositoryName: r.name }).promise();
