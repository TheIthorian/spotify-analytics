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
            const { streamHistory, recordCount } = await api.getStreamHistory(res.locals.parsedQuery);

            res.status(200);
            res.setHeader('count', streamHistory.length);
            res.setHeader('total', recordCount);
            res.json(streamHistory);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];

export const getTopArtistHandler: RequestHandler[] = [
    QuerySchemaValidator(api.GetTopArtistsOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<api.GetTopArtistsOptions>, next: NextFunction) => {
        log.info({ url: req.url }, '(getTopArtistHandler)');

        try {
            const topArtists = await api.getTopArtist(res.locals.parsedQuery);

            res.status(200);
            res.json(topArtists);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];
