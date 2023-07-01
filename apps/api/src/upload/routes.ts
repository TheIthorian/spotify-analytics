import expressPromiseRouter from 'express-promise-router';
import { getUploadHandler, getUploadStatusHandler, postUploadHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/upload', getUploadHandler);
    router.get('/upload/status', getUploadStatusHandler);
    router.post('/upload', postUploadHandler);
    return router;
}

module.exports = init();
