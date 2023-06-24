import { NextFunction, Request, RequestHandler, Response } from 'express';

import { makeLogger } from '../logger';
import * as api from './api';

const log = makeLogger(module);

export const getUserDetailsHandler: RequestHandler[] = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userDetails = await api.getUserDetails();

            res.status(200);
            res.json(userDetails);
        } catch (err) {
            log.error(err, 'getUserDetailsHandler');
            res.sendStatus(500);
        }

        next();
    },
];
