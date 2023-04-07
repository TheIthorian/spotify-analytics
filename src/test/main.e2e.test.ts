import * as request from 'supertest';
import { expressApp, start } from '../main';
import { Server } from 'http';

describe('Home (e2e)', () => {
    let app: ReturnType<typeof expressApp>;
    let server: Server;

    beforeAll(async () => {
        ({ app, server } = start(3001));
    });

    afterAll(() => {
        app.removeAllListeners();
        server.close();
    });

    it('/ (GET)', async () => {
        await request(app)
            .get('/')
            .expect(200)
            .expect('Hello')
            .then()
            .catch(err => {
                throw err;
            });
    });
});
