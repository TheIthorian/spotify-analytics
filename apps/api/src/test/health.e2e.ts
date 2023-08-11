import * as request from 'supertest';
import { start, stop } from '../main';
import config from '../config';

describe('Health', () => {
    let app, server;

    beforeAll(async () => {
        const { app: _app, server: _server } = start(config.port);
        app = _app;
        server = _server;
    });

    afterAll(async () => {
        await stop(server);
    });

    it('/api/health (GET) - responds with ok', async () => {
        await request(app).get('/api/health').expect(200).expect('ok');
    });
});
