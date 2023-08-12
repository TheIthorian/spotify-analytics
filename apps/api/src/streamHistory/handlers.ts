import {
    GetStreamHistoryOptions,
    GetStreamHistoryOptionsSchema,
    GetTopArtistsOptions,
    GetTopArtistsOptionsSchema,
} from 'spotify-analytics-types';
import { NextFunction, Request, RequestHandler, Response } from 'express';

import { makeLogger } from '../logger';
import * as api from './api';
import { ParsedQueryResponse } from '../util/typescript';
import { QuerySchemaValidator } from '../util/schema';
import { cache } from '../util/cache';
import { assertUserAwareRequest } from '../middleware/auth';

const log = makeLogger(module);

export const getHistoryHandler: RequestHandler[] = [
    QuerySchemaValidator(GetStreamHistoryOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<GetStreamHistoryOptions>, next: NextFunction) => {
        log.info({ url: req.url }, '(getStreamHistoryHandler)');
        assertUserAwareRequest(req);

        try {
            const { streamHistory, recordCount } = await api.getStreamHistory(req.user, res.locals.parsedQuery ?? {});

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
    QuerySchemaValidator(GetTopArtistsOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<GetTopArtistsOptions>, next: NextFunction) => {
        log.info({ url: req.url }, '(getTopArtistHandler)');
        assertUserAwareRequest(req);

        try {
            const topArtists = await api.getTopArtist(req.user, res.locals.parsedQuery ?? {});

            res.status(200);
            res.json(topArtists);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];

export const getStatsHandler: RequestHandler[] = [
    async (req: Request, res: Response, next: NextFunction) => {
        log.info({ url: req.url }, '(getStatsHandler)');
        assertUserAwareRequest(req);

        try {
            const stats = await cache(api.getStats)(req.user);

            res.status(200);
            res.json(stats);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];
