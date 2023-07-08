import { RequestHandler } from 'express';
import { makeLogger } from '../logger';
import { z } from 'zod';

const log = makeLogger(module);

export function QuerySchemaValidator<SchemaType extends z.ZodType>(schema: SchemaType): RequestHandler {
    return function schemaValidation(req, res, next) {
        const result = validateData(schema, req.query);

        if (!result.success) {
            const error = result.error;
            log.error(error, 'QuerySchemaValidator - validation failed');
            res.status(400);
            res.json(error);
        } else {
            res.locals.parsedQuery = result.data;
        }

        next();
    };
}

type ValidationResult<T> = { success: false; code: number; error: z.ZodError<z.ZodIssue> } | { success: true; data: T };

export function validateData<SchemaType extends z.ZodType>(schema: SchemaType, data: unknown): ValidationResult<z.infer<SchemaType>> {
    const result = schema.safeParse(data);

    if (!result.success) {
        const error = (result as z.SafeParseError<typeof data>).error;
        log.error(error, 'QuerySchemaValidator - validation failed');

        return {
            success: false,
            code: 400,
            error,
        };
    }

    return { success: true, data: result.data };
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
