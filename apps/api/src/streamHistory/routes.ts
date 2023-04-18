import expressPromiseRouter from 'express-promise-router';
import { getHistoryHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/history', getHistoryHandler);
    return router;
}

module.exports = init();
