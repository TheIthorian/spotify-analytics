import expressPromiseRouter from 'express-promise-router';
import { getHistoryHandler, getTopArtistHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/history', getHistoryHandler);
    router.get('/top-artists', getTopArtistHandler);
    return router;
}

module.exports = init();
