import * as request from 'supertest';

import { expressApp } from '../main';

describe('Account', () => {
    const app = expressApp(3001);

    it('/api/me (GET) - returns user details', async () => {
        const res = await request(app)
            .get('/api/me')
            .expect(200)
            .catch(err => {
                throw err;
            });

        expect(res.body).toMatchObject({
            streamHistoryRecordCount: expect.any(Number),
            id: expect.any(Number),
            username: expect.any(String),
        });
    });
});
