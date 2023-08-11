import { NextFunction, Request, Response } from 'express';
import expressPromiseRouter from 'express-promise-router';
import * as api from './api';
import { makeLogger } from '../logger';

const log = makeLogger(module);

function init() {
    const router = expressPromiseRouter();

    router.post('/login', [
        async (req: Request, res: Response, next: NextFunction) => {
            log.info('login handler');

            const token = await api.login(req.body);

            res.cookie('jwt', token.compact(), { httpOnly: true, secure: true });
            res.status(200);
            res.json({ message: 'Logged in' });
            next();
        },
    ]);

    router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
        await api.logout(req.cookies.jwt).catch(err => {
            log.error({ err }, 'logout error');
            res.status(400);
            res.json({ message: 'Unable to log out. Token not valid' });
        });

        res.clearCookie('jwt');
        res.status(200);
        res.json({ message: 'Logged out' });
        next();
    });

    // router.post('/signup', [
    //     async (req: Request, res: Response, next: NextFunction) => {
    //         log.info('signup handler');
    //         next();
    //     },
    // ]);

    return router;
}

module.exports = init();
