// eslint-disable-next-line @typescript-eslint/no-var-requires
const concurrently = require('concurrently');

// prisma generate && concurrently \"npm run start:api\"  \"jest --config jest.json \" -s=\"last\"

// https://dev.to/tylerlwsmith/exiting-node-js-when-programmatically-using-concurrently-to-run-multiple-scripts-1o78
concurrently(['npm run start:api', 'npx jest --config jest.json'], {
    killOthers: ['failure', 'success'],
}).result.then(
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
