import * as request from 'supertest';

import { start, stop } from '../main';
import config from '../config';
import { USER } from './constants';

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
        const res = await request(app).get('/api/me').set({ username: USER.username, password: USER.password }).expect(200);

        expect(res.body).toMatchObject({
            id: expect.any(Number),
            username: expect.any(String),
            displayName: expect.any(String),
            hasStreamHistoryRecords: expect.any(Boolean),
            hasUploads: expect.any(Boolean),
        });
    });
});
