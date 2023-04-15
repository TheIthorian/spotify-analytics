import expressPromiseRouter from 'express-promise-router';
import { getUploadHandler, postUploadHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/upload', getUploadHandler);
    router.post('/upload', postUploadHandler);
    return router;
}

module.exports = init();
