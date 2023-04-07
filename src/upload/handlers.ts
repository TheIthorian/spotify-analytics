import { RequestHandler } from 'express';

export const getUploadHandler: RequestHandler[] = [
    (req, res, next) => {
        res.send('upload');
        next();
    },
];
