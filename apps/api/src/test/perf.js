// npx 0x -o -- node -r ts-node/register .\src\test\perf.js

process.env.DATABASE_URL = 'file:./dev_test.db';

const { dequeueAllFiles } = require('../upload/fileProcessor');
const { generateRawStreamHistory } = require('./testUtils/recordGenerator');
const prisma = require('../prismaClient').default;
const fs = require('fs');

const numberOfRawFiles = 4;
const fileLength = 17_000;
const assetDir = `${__dirname}/assets/rawStreamHistory`;
const filePaths = [];

for (let i = 0; i < numberOfRawFiles; i++) {
    const data = [];
    for (let j = 0; j < fileLength; j++) {
        data.push(generateRawStreamHistory({ isSong: true }));
    }
    const filePath = `${assetDir}/endsong_${i}.json`;
    filePaths.push(filePath);
    fs.writeFileSync(`${assetDir}/endsong_${i}.json`, JSON.stringify(data));
}

async function main() {
    // Upload files
    await Promise.all(
        filePaths.map(async filename => {
            await prisma.uploadFileQueue.create({
                data: {
                    filePath: filename,
                    status: 0,
                    filename: filename.split('/').pop(),
                    mimetype: 'application/json',
                    size: fs.statSync(filename).size,
                    md5: 'md5',
                },
            });
        })
    );

    const uploadQueue = await prisma.uploadFileQueue.findMany();
    console.log('uploadQueue: ', uploadQueue);

    // Check dequeue perf
    const t1 = performance.now();
    await dequeueAllFiles(1);
    const t2 = performance.now();

    console.log('Timing complete: ', {
        time: ((t2 - t1) / 1000).toLocaleString() + 's',
        numberOfFileProcessed: uploadQueue.length,
        sizeOfFiles:
            (uploadQueue.reduce((prev, curr) => prev + curr.size / uploadQueue.length, 0) / (1000 * 1000)).toLocaleString() + 'Mb each',
    });
}

main();
