module.exports = async manifest => Promise.all(manifest.resources.map((r) => {
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

const deleteTaskDefinition = async (r) => {
    console.log('deleting taskdef');
    return Promise.resolve(r);
};

const deleteCluster = async (r) => {
    console.log('deleting cluster');
    return Promise.resolve(r);
};

const deleteRespository = async (r) => {
    console.log('deleting repository');
    return Promise.resolve(r);
};
