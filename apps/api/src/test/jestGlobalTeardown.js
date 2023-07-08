import * as fs from 'fs';
import * as path from 'path';

import * as dotEnv from 'dotenv';

dotEnv.config();

export default async function teardown() {
    dropTestDatabase();
}

function dropTestDatabase() {
    const directory = '../../prisma';
    const filename = process.env.E2E_DATABASE_URL.split(':./').pop();

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
