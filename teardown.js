const { deleteResources } = require('./util');

module.exports = async function jestGlobalTeardown() {
    try {
        const manifest = require('./artifacts/manifest.json'); // eslint-disable-line global-require
        return deleteResources(manifest);
    }
    catch (e) {
        console.log('No resources created');
        return Promise.resolve();
    }
};
