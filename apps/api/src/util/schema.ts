import { RequestHandler } from 'express';
import { makeLogger } from '../logger';
import { z } from 'zod';

const log = makeLogger(module);

export function QuerySchemaValidator<SchemaType extends z.ZodType>(schema: SchemaType): RequestHandler {
    return function schemaValidation(req, res, next) {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const error = (result as z.SafeParseError<typeof req.query>).error;
            log.error(error);
            res.status(400);
            res.json(error);
        } else {
            res.locals.parsedQuery = result.data;
        }

        next();
    };
}

export function parseLimit(limit?: number, maxLimit = 100) {
    const DEFAULT_LIMIT = 10;

    if (limit === undefined) {
        return DEFAULT_LIMIT;
    }

    if (limit > maxLimit) {
        return maxLimit;
    }

    return limit;
}
