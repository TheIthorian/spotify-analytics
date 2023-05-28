/* eslint-disable @typescript-eslint/no-var-requires */
const concurrently = require('concurrently');

// prisma generate && concurrently \"npm run start:api\"  \"jest --config jest.json \" -s=\"last\"

const DATABASE_URL = 'file:./dev_test.db';
// https://dev.to/tylerlwsmith/exiting-node-js-when-programmatically-using-concurrently-to-run-multiple-scripts-1o78
concurrently(
    [
        { command: 'npx prisma db push && npm run start:api', name: 'api setup', env: { DATABASE_URL, INTEGRATION_TEST: 'TRUE' } },
        { command: 'npx jest --config jest.json', name: 'jest', env: { DATABASE_URL } },
    ],
    {
        killOthers: ['failure', 'success'],
        prefixColors: 'auto',
    }
).result.then(
    function onSuccess(exitInfo) {
        // This code is necessary to make sure the parent terminates
        // when the application is closed successfully.
        dropTestDatabase();
        process.exit();
    },
    function onFailure(exitInfo) {
        // This code is necessary to make sure the parent terminates
        // when the application is closed because of a failure.
        dropTestDatabase();
        process.exit(exitInfo[0].exitCode); // Api process is always killed when jest finished. Use exit code of jest process
    }
);

function dropTestDatabase() {
    const fs = require('fs');
    const path = require('path');

    const directory = '../../prisma';
    const filename = 'dev_test.db';

    // Get the absolute path of the code file
    const codeFilePath = module.filename;

    // Get the directory path of the code file
    const codeFileDirectory = path.dirname(codeFilePath);

    // Construct the absolute path of the directory
    const absoluteDirectory = path.resolve(codeFileDirectory, directory);

    // Get the absolute path of the file
    const filePath = path.resolve(absoluteDirectory, filename);

    process.stdout.write(`Dropping test database: ${filePath}\n`);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlinkSync(filePath);
        process.stdout.write(`${filename} has been removed from ${directory}\n`);
    } else {
        process.stdout.write(`${filename} does not exist in ${directory}\n`);
    }
}
