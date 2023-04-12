import { NextFunction, Request, RequestHandler } from 'express';

import { makeLogger } from '../logger';
import * as api from './api';
import { ParsedQueryResponse } from '../util/typescript';
import { QuerySchemaValidator } from '../util/schema';

const log = makeLogger(module);

export const getHistoryHandler: RequestHandler[] = [
    QuerySchemaValidator(api.GetStreamHistoryOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<api.GetStreamHistoryOptions>, next: NextFunction) => {
        log.info({ url: req.url }, '(getStreamHistoryHandler)');

        try {
            const streamHistories = await api.getStreamHistory(res.locals.parsedQuery);

            res.status(200);
            res.setHeader('count', streamHistories.length);
            res.json(streamHistories);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];
