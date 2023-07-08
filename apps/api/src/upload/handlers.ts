import { RequestHandler } from 'express';
import { GetUploadHistoryOptions, GetUploadHistoryOptionsSchema } from 'spotify-analytics-types';

import { makeLogger } from '../logger';
import { QuerySchemaValidator } from '../util/schema';

import * as uploadApi from './api';
import { ParsedQueryResponse } from 'util/typescript';

const log = makeLogger(module);

export const getUploadHandler: RequestHandler[] = [
    QuerySchemaValidator(GetUploadHistoryOptionsSchema),
    async (req, res: ParsedQueryResponse<GetUploadHistoryOptions>, next) => {
        log.info('(getUploadHandler)');

        try {
            const { uploads, recordCount } = await uploadApi.getUploads(res.locals.parsedQuery);
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
    async (req, res, next) => {
        log.info(`(postUploadHandler)`);

        if (!req.files || !Object.keys(req.files).length) {
            res.status(400);
            res.send('No files uploaded');
            return next();
        }

        try {
            const allFiles = Object.values(req.files);
            const data = await uploadApi.saveFiles(allFiles);
            res.status(200);
            res.json(data);
        } catch (err) {
            log.error(err, 'postUploadHandler');
            res.sendStatus(500);
        }

        next();
    },
];
