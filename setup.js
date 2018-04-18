const { setupEnvironment } = require('./util');

module.exports = async function jestGlobalSetup() {
    setupEnvironment();

    const { REGION } = process.env;
    console.log(`running tests in ${REGION}`);
};
