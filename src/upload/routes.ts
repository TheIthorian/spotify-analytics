import expressPromiseRouter from 'express-promise-router';
import { getUploadHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/upload', getUploadHandler);
    return router;
}

module.exports = init();
