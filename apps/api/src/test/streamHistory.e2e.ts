import { StreamHistory, UploadFileQueue } from '@prisma/client';
import * as request from 'supertest';
import * as fs from 'fs';
import * as memLog from '../logger/memoryLogger';

import prisma from '../prismaClient';
import { expressApp } from '../main';
import { dequeueAllFiles } from '../upload/fileProcessor';
import { generateRawStreamHistory, generateStreamHistories, generateStreamHistory } from './testUtils/recordGenerator';
import { ReadStrategy } from '../upload/fileProcessor/types';
import { JOB_STATUS } from '../upload/constants';
import config from '../config';

let streamHistories: Omit<StreamHistory, 'id'>[] = [];
let sortedHistories: Record<string, any>[] = [];

const numberOfStreams = 20;

async function insertHistory(histories: Omit<StreamHistory, 'id'>[]) {
    return Promise.all(
        histories.map(history =>
            prisma.streamHistory.create({
                data: history,
            })
        )
    );
}

describe('Stream History', () => {
    const app = expressApp(3001);

    describe('Get History', () => {
        beforeAll(async () => {
            streamHistories = [...Array(numberOfStreams)].map(() => generateStreamHistory());
            await insertHistory(streamHistories);

            sortedHistories = [...streamHistories]
                .sort((a, b) => b.datePlayed.getTime() - a.datePlayed.getTime())
                .map(history => ({ ...history, datePlayed: history.datePlayed.toISOString() }));
        });

        it('/api/history (GET) - returns history, sorting by date', async () => {
            const res = await request(app)
                .get('/api/history')
                .expect(200)
                .catch(err => {
                    throw err;
                });

            expect(res.body.length).toBe(10);
            expect(res.body).toMatchObject(sortedHistories.slice(0, 10)); // Only takes first 10
        });

        it('/api/history (GET) - returns all history when limit is high enough', async () => {
            const res = await request(app)
                .get('/api/history')
                .query({ limit: numberOfStreams + 5 })
                .expect(200)
                .catch(err => {
                    throw err;
                });

            expect(res.body.length).toBe(numberOfStreams);
            expect(res.body).toMatchObject(sortedHistories);
        });
    });

    it('/api/top-artists (GET) - returns top artists', async () => {
        await prisma.streamHistory.deleteMany({});
        await insertHistory(generateStreamHistories({ isSong: true, artistName: 'Test Artist' }, 3));
        await insertHistory(generateStreamHistories({ isSong: true, artistName: 'Test Artist 2' }, 1));

        const res = await request(app)
            .get('/api/top-artists')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(2);
        expect(res.body).toStrictEqual([
            { count: 3, name: 'Test Artist' },
            { count: 1, name: 'Test Artist 2' },
        ]);
    });

    it.skip('/api/top-tracks (GET) - returns top tracks', async () => {
        await prisma.streamHistory.deleteMany({});
        await insertHistory(generateStreamHistories({ isSong: true, trackName: 'Test Track' }, 3));
        await insertHistory(generateStreamHistories({ isSong: true, trackName: 'Test Track 2' }, 1));

        const res = await request(app)
            .get('/api/top-tracks')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(2);
        expect(res.body).toStrictEqual([
            { count: 3, name: 'Test Artist' },
            { count: 1, name: 'Test Artist 2' },
        ]);
    });

    it('/api/top-tracks (GET) - returns stats', async () => {
        await prisma.streamHistory.deleteMany({});
        const isSong = true;
        await insertHistory(
            generateStreamHistories({ isSong, trackName: 'Test Track', spotifyTrackUri: '1', artistName: 'artist 1', msPlayed: 100 }, 3)
        );
        await insertHistory(
            generateStreamHistories({ isSong, trackName: 'Test Track 2', spotifyTrackUri: '2', artistName: 'artist 2', msPlayed: 200 }, 1)
        );
        await insertHistory(
            generateStreamHistories({ isSong, trackName: 'Test Track', spotifyTrackUri: '3', artistName: 'artist 3', msPlayed: 0 }, 1)
        );

        const res = await request(app)
            .get('/api/history/stats')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body).toStrictEqual({
            totalPlaytime: 300 + 200,
            uniqueArtistCount: 3,
            uniqueTrackCount: 3,
            trackCount: 3 + 1 + 1,
        });
    });

    describe.skip('Upload performance', () => {
        const numberOfRawFiles = 10;
        const fileLength = 15_000;
        const assetDir = `${__dirname}/assets/rawStreamHistory`;
        const filePaths = [];

        beforeAll(() => {
            // Generate files
            config.skipDuplicateUploads = false;

            for (let i = 0; i < numberOfRawFiles; i++) {
                const data = new Array(fileLength).fill(0).map(() => generateRawStreamHistory({ isSong: true }));
                const filePath = `${assetDir}/endsong_${i}.json`;
                filePaths.push(filePath);
                fs.writeFileSync(`${assetDir}/endsong_${i}.json`, JSON.stringify(data));
            }
        });

        afterAll(() => {
            config.skipDuplicateUploads = true;
        });

        function getPerformanceLog(startTime: number, uploadQueue: UploadFileQueue[] = [], options: Record<string, any> = {}) {
            const endTime = performance.now();
            const data = {
                numberOfRawFiles,
                fileLength,
                time: ((endTime - startTime) / 1000).toLocaleString() + 's',
                sizeOfFiles:
                    (uploadQueue.reduce((prev, curr) => prev + curr.size / uploadQueue.length, 0) / (1000 * 1000)).toLocaleString() +
                    'Mb each',
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
            fs.writeFileSync(__dirname + `/performance.json`, JSON.stringify(existingData, null, 2), { encoding: 'utf-8', flag: 'w' });
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

        const validateFieldsOptions = [true, false];
        const readStrategyOptions = [ReadStrategy.ReadFileAsync, ReadStrategy.StreamFile];
        const batchSizes = [1, 5, 20];

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

                console.log(runs);
            },
            200 * 1000 * 1000
        );
    });
});
