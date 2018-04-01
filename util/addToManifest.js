const { readFile, writeFile } = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

module.exports = async (type, name) => {
    const readFileAsync = promisify(readFile);
    const writeFileAsync = promisify(writeFile);

    const defaultManifest = { resources: [] };
    const { REGION: region } = process.env;
    const createdAt = new Date().toJSON();
    const entry = { type, name, region, createdAt };
    const manifestPath = resolve(process.cwd(), './artifacts/manifest.json');

    let manifest;

    try {
        const manifestFileContents = await readFileAsync(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestFileContents);
    }
    catch (e) {
        manifest = defaultManifest;
    }

    manifest.resources.push(entry);

    try {
        await writeFileAsync(manifestPath, JSON.stringify(manifest, null, 2));
        return true;
    }
    catch (e) {
        console.log('Could not write manifest file.');
        console.error(e);
        return false;
    }
};
