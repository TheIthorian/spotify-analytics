import { RequestHandler } from 'express';
import { makeLogger } from '../logger';
import { z } from 'zod';

const log = makeLogger(module);

export function QuerySchemaValidator<SchemaType extends z.ZodType>(schema: SchemaType): RequestHandler {
    return function schemaValidation(req, res, next) {
        const result = schema.parse(req.query);

        if (!result.success) {
            log.error(result.error);
        } else {
            res.locals.parsedQuery = result.data;
        }

        next();
    };
}
