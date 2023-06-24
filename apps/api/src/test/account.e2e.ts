import * as request from 'supertest';

import { start, stop } from '../main';
import config from '../config';

describe('Account', () => {
    let app, server;

    beforeAll(async () => {
        const { app: _app, server: _server } = start(config.port);
        app = _app;
        server = _server;
    });

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
