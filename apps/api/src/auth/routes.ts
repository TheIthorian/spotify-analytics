import expressPromiseRouter from 'express-promise-router';
import { loginHandler, logoutHandler } from './handlers';

function init() {
    const router = expressPromiseRouter();
    router.post('/login', loginHandler); // TODO - finish this
    router.post('/logout', logoutHandler);
    // router.post('/signup', signupHandler);
    return router;
}

module.exports = init();
