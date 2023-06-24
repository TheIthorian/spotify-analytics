import { UploadFileQueue } from '@prisma/client';
import * as request from 'supertest';
import * as fs from 'fs';
import * as memLog from '../logger/memoryLogger';

import prisma from '../prismaClient';
import { expressApp } from '../main';
import { dequeueAllFiles } from '../upload/fileProcessor';
import { generateRawStreamHistory } from './testUtils/recordGenerator';
import { ReadStrategy } from '../upload/fileProcessor/types';
import { JOB_STATUS } from '../upload/constants';
import config from '../config';
import { deleteTempFile } from '../util/file';

describe('Upload performance', () => {
    const numberOfRawFiles = 10;
    const fileLength = 15;
    const assetDir = `${__dirname}/assets/rawStreamHistory`;
    const filePaths: string[] = [];

    const app = expressApp(3001);

    beforeAll(async () => {
        await prisma.streamHistory.deleteMany();

        // Generate files
        config.skipDuplicateUploads = false;

        for (let i = 0; i < numberOfRawFiles; i++) {
            const data = new Array(fileLength).fill(0).map(() => generateRawStreamHistory({ isSong: true }));
            const filePath = `${assetDir}/endsong_${i}.json`;
            filePaths.push(filePath);
            fs.writeFileSync(`${assetDir}/endsong_${i}.json`, JSON.stringify(data));
        }
    });

    afterAll(async () => {
        config.skipDuplicateUploads = true;
        await prisma.streamHistory.deleteMany();
        await Promise.all(filePaths.map(async path => await deleteTempFile(path)));
    });

    function getPerformanceLog(startTime: number, uploadQueue: UploadFileQueue[] = [], options: Record<string, any> = {}) {
        const endTime = performance.now();
        const data = {
            numberOfRawFiles,
            fileLength,
            time: ((endTime - startTime) / 1000).toLocaleString(),
            sizeOfFiles:
                (uploadQueue.reduce((prev, curr) => prev + curr.size / uploadQueue.length, 0) / (1000 * 1000)).toLocaleString() + 'Mb each',
            database: process.env.DATABASE_URL?.split(':')[0],
            date: new Date().toLocaleString(),
            ...options,
        };
        return data;
    }

    async function writeToPerformanceFile(runs: any[]) {
        if (!fs.existsSync(__dirname + `/performanceTesting`)) {
            fs.mkdirSync(__dirname + `/performanceTesting`);
        }

        const existingData = JSON.parse(
            await fs.promises.readFile(__dirname + `/performanceTesting/performance.json`, { encoding: 'utf-8' }).catch(() => '[]')
        );
        existingData.push(...runs);
        fs.writeFileSync(__dirname + `/performanceTesting/performance.json`, JSON.stringify(existingData, null, 2), {
            encoding: 'utf-8',
            flag: 'w',
        });
    }

    async function uploadAllFiles() {
        const responses = await Promise.all(
            filePaths.map(async filename => await request(app).post('/api/upload').attach('file', filename))
        );

        for (const response of responses) {
            expect(response.status).toBe(200);
        }

        const uploadQueue = await prisma.uploadFileQueue.findMany({ where: { status: JOB_STATUS.WAITING } });
        expect(uploadQueue.length).toBe(numberOfRawFiles);

        return uploadQueue;
    }

    const validateFieldsOptions = [false, true];
    const readStrategyOptions = [ReadStrategy.ReadFileAsync, ReadStrategy.StreamFile];
    const batchSizes = [1, 10, 25];

    it(
        'uploads and dequeues many large files',
        async () => {
            // Upload files
            const runs = [];

            for (const readStrategy of readStrategyOptions) {
                for (const batchSize of batchSizes) {
                    for (const validateFields of validateFieldsOptions) {
                        memLog.reset();
                        const uploadQueue = await uploadAllFiles();
                        const options = { validateFields, readStrategy, error: false };
                        const startTime = performance.now();
                        await dequeueAllFiles(batchSize, options).catch(err => {
                            options.error = true;
                        });
                        const perf = getPerformanceLog(startTime, uploadQueue, { ...options, batchSize, memLog: memLog.get() });
                        runs.push(perf);
                        await writeToPerformanceFile([perf]).catch(err => console.error(err));
                    }
                }
            }
        },
        200 * 1000 * 1000
    );
});
