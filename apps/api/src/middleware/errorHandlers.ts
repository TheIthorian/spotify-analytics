import { NextFunction, Request, Response } from 'express';
import { makeLogger } from '../logger';
import { AppError } from 'spotify-analytics-errors';

const log = makeLogger(module);

export function errorHandler() {
    return (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
        log.error(error);

        if (error instanceof AppError) {
            res.status(error.status);
            res.json(error.toJson());
            return next();
        }

        res.status(500);
        res.json({ message: 'Internal server error', cause: error.cause, message2: error.message });
        next();
    };
}
