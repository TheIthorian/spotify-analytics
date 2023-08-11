import { NextFunction, RequestHandler, Response } from 'express';
import { makeLogger } from '../logger';
import * as api from './api';
import { UserAwareRequest } from '../util/typescript';

const log = makeLogger(module);

export const getUserDetailsHandler: RequestHandler[] = [
    async (req: UserAwareRequest, res: Response, next: NextFunction) => {
        const userId = req.user!;
        log.info('getUserDetailsHandler - userId: ' + userId);

        try {
            const userDetails = await api.getUserDetails(userId);

            res.status(200);
            res.json(userDetails);
        } catch (err) {
            log.error(err, 'getUserDetailsHandler');
            res.sendStatus(500);
        }

        next();
    },
];
