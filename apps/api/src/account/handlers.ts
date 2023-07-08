import { NextFunction, Request, RequestHandler, Response } from 'express';

import { makeLogger } from '../logger';
import * as api from './api';
import { QuerySchemaValidator, validateData } from '../util/schema';
import { LoginRequestQuery, LoginRequestQuerySchema, PasswordLoginRequestBodySchema } from 'spotify-analytics-types';
import { ParsedQueryResponse } from '../util/typescript';

const log = makeLogger(module);

export const getUserDetailsHandler: RequestHandler[] = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userDetails = await api.getUserDetails(1);

            res.status(200);
            res.json(userDetails);
        } catch (err) {
            log.error(err, 'getUserDetailsHandler');
            res.sendStatus(500);
        }

        next();
    },
];

export const loginHandler: RequestHandler[] = [
    QuerySchemaValidator(LoginRequestQuerySchema),
    async (req: Request, res: ParsedQueryResponse<LoginRequestQuery>, next: NextFunction) => {
        try {
            if (res.locals.parsedQuery?.provider === 'github') {
                log.info({ body: req.body, query: res.locals.parsedQuery?.provider }, 'loginHandler - github login');

                await api.webFlowLogin(res.locals.parsedQuery?.provider);

                res.cookie('session-id', 'xxxxx');
                res.status(201);
                res.json();
                return next();
            }

            log.info({ body: req.body }, 'loginHandler - password login');
            const parsedBody = validateData(PasswordLoginRequestBodySchema, req.body);

            if (!parsedBody.success) {
                res.status(parsedBody.code);
                res.json({ error: parsedBody.error });
                return next();
            }

            await api.login(parsedBody.data);

            res.cookie('session-id', 'xxxxx');
            res.status(201);
            res.json();
        } catch (err) {
            log.error(err, 'loginHandler');
            return next(err);
        }

        next();
    },
];

export const logoutHandler: RequestHandler[] = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await api.logout('xxxxx');
            res.status(202);
            res.json();
        } catch (err) {
            log.error(err, 'logoutHandler');
            return next(err);
        }

        next();
    },
];
