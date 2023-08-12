import { Request, RequestHandler } from 'express';
import { GetUploadHistoryOptions, GetUploadHistoryOptionsSchema } from 'spotify-analytics-types';

import { makeLogger } from '../logger';
import { QuerySchemaValidator } from '../util/schema';

import * as uploadApi from './api';
import { ParsedQueryResponse } from 'util/typescript';
import { assertUserAwareRequest } from '../middleware/auth';

const log = makeLogger(module);

export const getUploadHandler: RequestHandler[] = [
    QuerySchemaValidator(GetUploadHistoryOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<GetUploadHistoryOptions>, next) => {
        log.info('(getUploadHandler)');
        assertUserAwareRequest(req);

        try {
            const { uploads, recordCount } = await uploadApi.getUploads(req.user, res.locals.parsedQuery ?? {});
            res.status(200);
            res.setHeader('count', uploads.length);
            res.setHeader('total', recordCount);
            res.json(uploads);
        } catch (err) {
            log.error(err, 'getUploadHandler');
            res.sendStatus(500);
        }

        next();
    },
];

export const postUploadHandler: RequestHandler[] = [
    async (req: Request, res, next) => {
        log.info(`(postUploadHandler)`);
        assertUserAwareRequest(req);

        if (!req.files || !Object.keys(req.files).length) {
            res.status(400);
            res.send('No files uploaded');
            return next();
        }

        try {
            const allFiles = Object.values(req.files);
            const data = await uploadApi.saveFiles(req.user, allFiles);
            res.status(200);
            res.json(data);
        } catch (err) {
            log.error(err, 'postUploadHandler');
            res.sendStatus(500);
        }

        next();
    },
];
