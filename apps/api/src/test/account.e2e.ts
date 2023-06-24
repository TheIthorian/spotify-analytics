import * as request from 'supertest';

import { start, stop } from '../main';
import config from '../config';

describe('Account', () => {
    const { app, server } = start(config.port);

    afterAll(async () => {
        await stop(server);
    });

    it('/api/me (GET) - returns user details', async () => {
        const res = await request(app).get('/api/me').expect(200);

        expect(res.body).toMatchObject({
            streamHistoryRecordCount: expect.any(Number),
            id: expect.any(Number),
            username: expect.any(String),
        });
    });
});
