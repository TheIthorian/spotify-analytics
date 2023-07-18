/* eslint-disable @typescript-eslint/no-var-requires */
import * as express from 'express';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { verifyUsernamePassword } from './middleware/auth';

/**
 * Initialise all routes
 */
export default function initialiseRoutes() {
    const router = express.Router();

    router.use('/api/auth/', require('./auth/routes'));
    router.use('/api/', require('./health'));

    passport.use('local', new LocalStrategy(verifyUsernamePassword));

    router.use('/api/', require('./upload/routes'));
    router.use('/api/', require('./streamHistory/routes'));
    router.use('/api/', require('./account/routes'));

    return router;
}
