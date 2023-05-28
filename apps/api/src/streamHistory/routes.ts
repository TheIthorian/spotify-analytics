import expressPromiseRouter from 'express-promise-router';
import { getHistoryHandler, getStatsHandler, getTopArtistHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/history', getHistoryHandler);
    router.get('/top-artists', getTopArtistHandler);
    router.get('/history/stats', getStatsHandler);
    return router;
}

module.exports = init();
