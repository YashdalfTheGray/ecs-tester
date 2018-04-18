module.exports = async function jestGlobalTeardown() {
    try {
        const manifest = require('./artifacts/manifest.json'); // eslint-disable-line global-require
        console.log('Created resources:');
        console.log(JSON.stringify(manifest, null, 2));
    }
    catch (e) {
        console.log('No resources created');
    }
};
