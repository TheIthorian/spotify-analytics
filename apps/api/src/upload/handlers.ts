import { RequestHandler } from 'express';
import { makeLogger } from '../logger';
import * as uploadApi from './api';
import { Socket } from '../socket';
import { STATUS_BY_ID, UploadStatus } from 'spotify-analytics-types';

const log = makeLogger(module);

export const getUploadHandler: RequestHandler[] = [
    async (req, res, next) => {
        log.info('(getUploadHandler)');

        try {
            const uploads = await uploadApi.getUploads();
            res.status(200);
            res.json(uploads);
        } catch (err) {
            log.error(err, 'getUploadHandler');
            res.sendStatus(500);
        }

        next();
    },
];

export const getUploadStatusHandler: RequestHandler[] = [
    async (req, res, next) => {
        log.info('(getUploadStatusHandler)');

        try {
            log.info({ query: req.query }, 'getUploadStatusHandler query');

            if (!req.query) {
                res.status(400);
                res.send('No query provided');
                return next();
            }

            const { status, id } = req.query;
            if (!status || !id) {
                res.status(400);
                res.send('No status / id provided');
                return next();
            }

            if (!Object.values(STATUS_BY_ID).includes(status as UploadStatus)) {
                res.status(400);
                res.send('Invalid status provided. Must be one of: ' + Object.values(STATUS_BY_ID).join(', '));
                return next();
            }

            Socket().emit('message', { id, status });

            res.status(200);
            res.send('OK');
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
