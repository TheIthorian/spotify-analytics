import expressPromiseRouter from 'express-promise-router';
import { Request, Response, NextFunction } from 'express';

function initRoutes() {
    const router = expressPromiseRouter();
    router.get('/health', getHealthHandler);
    return router;
}

function getHealthHandler(req: Request, res: Response, next: NextFunction) {
    res.status(200);
    res.send('ok');
}

module.exports = initRoutes();
