import { StreamHistory } from '@prisma/client';
import * as request from 'supertest';
import * as fs from 'fs';

import prisma from '../prismaClient';
import { expressApp } from '../main';
import { dequeueAllFiles } from '../upload/fileProcessor';
import { generateStreamHistory } from './testUtils/recordGenerator';

let streamHistories: Omit<StreamHistory, 'id'>[] = [];
let sortedHistories: Record<string, any>[] = [];

const numberOfStreams = 3;

describe('Stream History', () => {
    beforeAll(async () => {
        streamHistories = [...Array(3)].map(() => generateStreamHistory({ artistName: 'artistName' }));
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

    const app = expressApp(3001);

    describe('Get History', () => {
        it('/api/history (GET) - returns history, sorting by date', async () => {
            const res = await request(app)
                .get('/api/history')
                .expect(200)
                .catch(err => {
                    throw err;
                });

            expect(res.body.length).toBe(Math.min(numberOfStreams, 10));
            expect(res.body).toMatchObject(sortedHistories.slice(0, 10));
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

    it.skip('/api/top-artists (GET) - returns top artists', async () => {
        // Update every other history to have the same artist name
        await prisma.streamHistory.updateMany({
            data: streamHistories
                .filter((_, index) => index % 2)
                .map(history => {
                    history.artistName = 'artistName';
                    return history;
                }), // Every other history
        });

        const res = await request(app)
            .get('/api/top-artists')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(numberOfStreams);
        expect(res.body).toStrictEqual([{ count: numberOfStreams, name: 'artistName' }]);
    });

    it.skip('/api/top-tracks (GET) - returns top tracks', async () => {
        // Update every other history to have the same artist name
        await prisma.streamHistory.updateMany({
            data: streamHistories
                .filter((_, index) => index % 2) // Every other history
                .map(history => {
                    history.trackName = 'trackName';
                    return history;
                }),
        });

        const res = await request(app)
            .get('/api/top-tracks')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(numberOfStreams);
        expect(res.body).toStrictEqual([{ count: Math.floor(numberOfStreams / 2), name: 'trackName' }]);
    });

    it.skip('/api/top-tracks (GET) - returns stats', async () => {
        // Update every other history to have the same artist name
        const res = await request(app)
            .get('/api/history/stats')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body).toStrictEqual({
            totalPlaytime: expect.any(Number),
            uniqueArtistCount: 1,
            uniqueTrackCount: expect.any(Number),
            trackCount: 8,
        });

        expect(res.body.totalPlaytime).toBeGreaterThan(0);
        expect(res.body.uniqueTrackCount).toBeGreaterThan(0);
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
                 */
            },
            200 * 1000
        );
    });
});
