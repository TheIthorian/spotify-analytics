import * as request from 'supertest';
import { start, stop } from '../main';
import config from '../config';

describe('Health', () => {
    const { app, server } = start(config.port);

    afterAll(async () => {
        await stop(server);
    });

    it('/api/health (GET) - responds with ok', async () => {
        await request(app).get('/api/health').expect(200).expect('ok').then();
    });
});
