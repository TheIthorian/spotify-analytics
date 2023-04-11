import { NextFunction, Request, RequestHandler } from 'express';
import { z } from 'zod';

import { makeLogger } from '../logger';
import * as api from './api';
import { ParsedQueryResponse } from 'util/typescript';

const log = makeLogger(module);

export const getHistoryHandler: RequestHandler[] = [
    SchemaValidator(api.GetStreamHistoryOptionsSchema),
    async (req: Request, res: ParsedQueryResponse<api.GetStreamHistoryOptions>, next: NextFunction) => {
        log.info('(getStreamHistoryHandler)');
        log.info(res.locals.parsedQuery);

        try {
            const streamHistories = await api.getStreamHistory();

            res.status(200);
            res.json(streamHistories);
        } catch (err) {
            log.error(err, 'getStreamHistoryHandler');
            res.sendStatus(500);
        }

        next();
    },
];

function SchemaValidator<SchemaType extends z.ZodType, T>(schema: SchemaType): RequestHandler {
    return function schemaValidation(req: Request, res, next) {
        const result = schema.parse(req.query);
        if (!result.success) {
            log.error(result.error);
        } else {
            res.locals.parsedQuery = result.data as T;
        }

        next();
    };
}
