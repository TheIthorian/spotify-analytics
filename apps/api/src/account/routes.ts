import expressPromiseRouter from 'express-promise-router';
import { getUserDetailsHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/me', getUserDetailsHandler);
    return router;
}

module.exports = init();
