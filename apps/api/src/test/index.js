/* eslint-disable @typescript-eslint/no-var-requires */
const concurrently = require('concurrently');
const dotEnv = require('dotenv');

dotEnv.config();

// prisma generate && concurrently \"npm run start:api\"  \"jest --config jest.json \" -s=\"last\"

const DATABASE_URL = process.env.E2E_DATABASE_URL;

// https://dev.to/tylerlwsmith/exiting-node-js-when-programmatically-using-concurrently-to-run-multiple-scripts-1o78
concurrently(
    [
        {
            command: 'npx prisma db push && npx jest --config jest.json --runInBand --detectOpenHandles --forceExit',
            name: 'jest',
            env: { DATABASE_URL, NODE_ENV: 'test', PORT: 4001 },
        },
    ],
    {
        killOthers: ['failure', 'success'],
        prefixColors: 'auto',
    }
).result.then(
    function onSuccess(exitInfo) {
        // This code is necessary to make sure the parent terminates
        // when the application is closed successfully.
        process.exit();
    },
    function onFailure(exitInfo) {
        // This code is necessary to make sure the parent terminates
        // when the application is closed because of a failure.
        process.exit(exitInfo[0].exitCode); // Api process is always killed when jest finished. Use exit code of jest process
    }
);
