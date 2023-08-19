import { NextFunction, Request, Response } from 'express';
import expressPromiseRouter from 'express-promise-router';
import * as api from './api';
import { makeLogger } from '../logger';

const log = makeLogger(module);

function init() {
    const router = expressPromiseRouter();

    router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
        log.info('login handler');

        const token = await api.login(req.body);

        res.status(200);
        res.json({ message: 'Logged in', token: token.compact() });
        next();
    });

    router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
        await api.logout(req.cookies.jwt).catch(error => {
            log.error({ error }, 'logout error');
            throw error;
        });

        res.status(200);
        res.json({ message: 'Logged out' });
        next();
    });

    // TODO - add schema validation
    router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
        log.info('signup handler');
        const user = await api.signup(req.body);
        res.status(200);
        res.json({ message: 'Signed up', user });
        next();
    });

    return router;
}

module.exports = init();
