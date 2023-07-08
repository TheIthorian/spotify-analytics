import { StreamHistory } from '@prisma/client';
import * as request from 'supertest';

import prisma from '../prismaClient';
import { start, stop } from '../main';
import { generateStreamHistories, generateStreamHistory } from './testUtils/recordGenerator';
import config from '../config';

let streamHistories: Omit<StreamHistory, 'id'>[] = [];
let sortedHistories: Record<string, any>[] = [];

const numberOfStreams = 20;

async function insertHistory(histories: Omit<StreamHistory, 'id'>[]) {
    return Promise.all(
        histories.map(history =>
            prisma.streamHistory.create({
                data: { ...history, userId: 1 },
            })
        )
    );
}

describe('Stream History', () => {
    let app, server;

    beforeAll(async () => {
        const { app: _app, server: _server } = start(config.port);
        app = _app;
        server = _server;
    });

    afterAll(async () => {
        await stop(server);
    });

    beforeAll(async () => {
        await prisma.streamHistory.deleteMany();
    });

    describe('Get History', () => {
        beforeAll(async () => {
            streamHistories = [...Array(numberOfStreams)].map(() => generateStreamHistory());
            await insertHistory(streamHistories);

            sortedHistories = [...streamHistories]
                .sort((a, b) => b.datePlayed.getTime() - a.datePlayed.getTime())
                .map(history => ({ ...history, datePlayed: history.datePlayed.toISOString() }));
        });

        it('/api/history (GET) - returns history, sorting by date', async () => {
            const res = await request(app).get('/api/history').expect(200);

            expect(res.body.length).toBe(10);
            expect(res.body).toMatchObject(sortedHistories.slice(0, 10)); // Only takes first 10
        });

        it('/api/history (GET) - returns all history when limit is high enough', async () => {
            const res = await request(app)
                .get('/api/history')
                .query({ limit: numberOfStreams + 5 })
                .expect(200);

            expect(res.body.length).toBe(numberOfStreams);
            expect(res.body).toMatchObject(sortedHistories);
        });
    });

    it('/api/top-artists (GET) - returns top artists', async () => {
        await prisma.streamHistory.deleteMany({});
        await insertHistory(generateStreamHistories({ isSong: true, artistName: 'Test Artist' }, 3));
        await insertHistory(generateStreamHistories({ isSong: true, artistName: 'Test Artist 2' }, 1));

        const res = await request(app).get('/api/top-artists').expect(200);

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

        const res = await request(app).get('/api/top-tracks').expect(200);

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

        const res = await request(app).get('/api/history/stats').expect(200);

        expect(res.body).toStrictEqual({
            totalPlaytime: 300 + 200,
            uniqueArtistCount: 3,
            uniqueTrackCount: 3,
            trackCount: 3 + 1 + 1,
        });
    });
});
