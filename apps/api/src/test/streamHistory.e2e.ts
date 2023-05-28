import { StreamHistory } from '@prisma/client';
import * as request from 'supertest';
import * as fs from 'fs';

import prisma from '../prismaClient';
import { expressApp } from '../main';
import { dequeueAllFiles } from '../upload/fileProcessor';
import { generateStreamHistories, generateStreamHistory } from './testUtils/recordGenerator';

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
            await Promise.all(
                streamHistories.map(history =>
                    prisma.streamHistory.create({
                        data: history,
                    })
                )
            );

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

        expect(res.body[0]).toMatchObject({ count: expect.any(Number), name: expect.any(String) });
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

        expect(res.body[0]).toMatchObject({ count: expect.any(Number), name: expect.any(String) });
    });

    it('/api/top-tracks (GET) - returns stats', async () => {
        const res = await request(app)
            .get('/api/history/stats')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body).toStrictEqual({
            totalPlaytime: expect.any(Number),
            uniqueArtistCount: expect.any(Number),
            uniqueTrackCount: expect.any(Number),
            trackCount: expect.any(Number),
        });

        expect(res.body.totalPlaytime).toBeGreaterThan(0);
        expect(res.body.uniqueArtistCount).toBeGreaterThan(0);
        expect(res.body.uniqueTrackCount).toBeGreaterThan(0);
        expect(res.body.trackCount).toBeGreaterThan(0);
    });

    describe.skip('Performance', () => {
        it(
            'uploads and dequeues many large files',
            async () => {
                const basePath = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8')).exampleDataPath;
                if (!basePath) {
                    throw new Error('exampleDataPath not set in config.json. Please set it to a valid path.');
                }

                const files = new Array(11).fill(0).map((_, i) => basePath + 'endsong_' + i + '.json');

                // Upload files
                const responses = await Promise.all(files.map(filename => request(app).post('/api/upload').attach('file', filename)));
                for (const response of responses) {
                    expect(response.status).toBe(200);
                }

                const uploadQueue = await prisma.uploadFileQueue.findMany();
                expect(uploadQueue.length).toBe(11);

                // Check dequeue perf
                const t1 = performance.now();
                await dequeueAllFiles();
                const t2 = performance.now();

                console.log('Timing complete: ', {
                    time: ((t2 - t1) / 1000).toLocaleString() + 's',
                    numberOfFileProcessed: uploadQueue.length,
                    sizeOfFiles:
                        (uploadQueue.reduce((prev, curr) => prev + curr.size / uploadQueue.length, 0) / (1000 * 1000)).toLocaleString() +
                        'Mb each',
                });

                /**
                 * Process each file in sequence:
                {
                    time: '73.304s',
                    numberOfFileProcessed: 11,
                    sizeOfFiles: '10.524Mb each',
                };

                With streams:
                Timing complete:  {
                    time: '15.762s',
                    numberOfFileProcessed: 11,
                    sizeOfFiles: '10.524Mb each'
                };
                 */
            },
            200 * 1000
        );
    });
});
