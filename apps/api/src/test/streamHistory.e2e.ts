import * as request from 'supertest';
import prisma from '../prismaClient';
import { expressApp } from '../main';
import { dequeueAllFiles } from '../upload/fileProcessor';
import * as fs from 'fs';

const today = new Date();

async function insertStreamHistory() {
    await prisma.streamHistory.create({
        data: {
            trackName: 'trackName',
            albumName: 'albumName',
            artistName: 'artistName',
            msPlayed: 100,
            datePlayed: today,
            platform: 'platform',
            spotifyTrackUri: 'spotifyTrackUri',
            isSong: true,
            episodeName: null,
            episodeShowName: null,
            spotifyShowUri: null,
            shuffle: false,
            skipped: false,
            offline: false,
            reasonStart: 'unknown',
            reasonEnd: 'unknown',
            incognitoMode: false,
        },
    });
}

describe('Stream History', () => {
    beforeAll(async () => {
        await insertStreamHistory();
    });

    const app = expressApp(3001);

    it('/api/history (GET) - returns history', async () => {
        const res = await request(app)
            .get('/api/history')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(1);
        expect(res.body).toStrictEqual([
            {
                id: 1,
                trackName: 'trackName',
                albumName: 'albumName',
                artistName: 'artistName',
                msPlayed: 100,
                datePlayed: today.toISOString(),
                platform: 'platform',
                spotifyTrackUri: 'spotifyTrackUri',
                isSong: true,
                episodeName: null,
                episodeShowName: null,
                spotifyShowUri: null,
                shuffle: false,
                skipped: false,
                offline: false,
                reasonStart: 'unknown',
                reasonEnd: 'unknown',
                incognitoMode: false,
            },
        ]);
    });

    it('/api/top-artists (GET) - returns top artists', async () => {
        const res = await request(app)
            .get('/api/top-artists')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body.length).toBe(1);
        expect(res.body).toStrictEqual([{ count: 1, name: 'artistName' }]);
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
