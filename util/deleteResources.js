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

    return Promise.resolve(r);
};

const deleteRespository = async r => new ECR({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
}).deleteRepository({ force: true, repositoryName: r.name }).promise();
