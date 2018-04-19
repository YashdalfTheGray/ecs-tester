const { ECR } = require('aws-sdk');

module.exports = async manifest => Promise.all(manifest.resources.map((r) => {
    console.log(`Deleting ${r.type} ${r.name}`);
    switch (r.type) {
    case 'taskDefinition':
        return deleteTaskDefinition(r);
    case 'cluster':
        return deleteCluster(r);
    case 'repository':
        return deleteRespository(r);
    default:
        return Promise.resolve();
    }
}));

const deleteTaskDefinition = async r => Promise.resolve(r);

const deleteCluster = async r => Promise.resolve(r);

const deleteRespository = async r => new ECR({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
}).deleteRepository({ force: true, repositoryName: r.name }).promise();
