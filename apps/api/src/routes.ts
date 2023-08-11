/* eslint-disable @typescript-eslint/no-var-requires */
import * as express from 'express';
import { sessionAuthenticate } from './middleware/auth';

/**
 * Initialise all routes
 */
export default function initialiseRoutes() {
    const router = express.Router();

    router.use('/auth/', require('./auth/routes'));
    router.use('/api/', require('./health'));

    router.use('/api/', sessionAuthenticate());

    router.use('/api/', require('./upload/routes'));
    router.use('/api/', require('./streamHistory/routes'));
    router.use('/api/', require('./account/routes'));

    return router;
}
