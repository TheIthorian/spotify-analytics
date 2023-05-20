import * as request from 'supertest';
import { expressApp } from '../main';

describe('Health', () => {
    const app = expressApp(3001);
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
