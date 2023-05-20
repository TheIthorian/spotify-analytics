import * as request from 'supertest';
import { expressApp, start, stop } from '../main';
import { Server } from 'http';

describe('Health', () => {
    let app: ReturnType<typeof expressApp>;
    let server: Server;

    beforeAll(async () => {
        ({ app, server } = start(3002));
    });

    afterAll(async () => {
        app.removeAllListeners();
        await stop(server);
    });

    it('/api/health (GET) - responds with ok', async () => {
        await request(app)
            .get('/api/health')
            .expect(200)
            .expect('ok')
            .then()
            .catch(err => {
                console.error(err);
                throw err;
            });
    });
});
