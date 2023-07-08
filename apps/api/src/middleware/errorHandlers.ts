import { NextFunction, Request, Response } from 'express';
import { AppError } from 'spotify-analytics-errors';

export function errorHandler() {
    return (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
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
