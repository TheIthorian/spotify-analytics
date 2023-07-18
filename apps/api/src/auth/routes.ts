import { NextFunction, Request, Response } from 'express';
import expressPromiseRouter from 'express-promise-router';
import * as passport from 'passport';

function init() {
    const router = expressPromiseRouter();

    router.post('/login', [
        passport.authenticate('local', { session: true }),
        (req: Request, res: Response, next: NextFunction) => {
            res.status(200);
            res.json({ message: 'Logged in' });
            next();
        },
    ]);

    router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
        res.status(200);
        res.json({ message: 'Logged in' });
        next();
    });

    // router.post('/signup', signupHandler);

    return router;
}

module.exports = init();
