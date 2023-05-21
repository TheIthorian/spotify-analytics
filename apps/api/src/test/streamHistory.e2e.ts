import * as request from 'supertest';
import prisma from '../prismaClient';
import { expressApp } from '../main';

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
});
