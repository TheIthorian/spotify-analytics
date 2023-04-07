/* eslint-disable @typescript-eslint/no-var-requires */
import * as express from 'express';

/**
 * Initialise all routes
 */
export default function initialiseRoutes() {
    const router = express.Router();

    router.use('/api/', require('./upload/routes'));
    router.use('/api/', require('./health'));

    return router;
}
