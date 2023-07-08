import expressPromiseRouter from 'express-promise-router';
import { getUserDetailsHandler, loginHandler, logoutHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.get('/me', getUserDetailsHandler);
    router.post('/login', loginHandler);
    router.post('/logout', logoutHandler);
    return router;
}

module.exports = init();
