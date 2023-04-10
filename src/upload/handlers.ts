import { STATUS_BY_ID } from './constants';
import { RequestHandler } from 'express';
import { makeLogger } from '../logger';
import * as uploadApi from './api';

const log = makeLogger(module);

export const getUploadHandler: RequestHandler[] = [
    async (req, res, next) => {
        log.info('(getUploadHandler)');
        try {
            const uploads = await uploadApi.getUploads();
            uploads.forEach(upload => (upload.status = STATUS_BY_ID[upload.status]));

            res.status(200);
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
        } else {
            const allFiles = Object.values(req.files);
            uploadApi.saveFiles(allFiles);
            res.status(200);
            res.json({ message: 'File uploaded', status: 'Processing' });
        }

        next();
    },
];
