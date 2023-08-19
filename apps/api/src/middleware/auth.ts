import { makeLogger } from '../logger';
import prisma from '../prismaClient';
import { verifyToken } from '../auth/jwt';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import { UserAwareRequest } from '../util/typescript';
import { AuthenticationError } from 'spotify-analytics-errors';

const log = makeLogger(module);

export async function tokenAuthenticate(token: string): Promise<User | null> {
    log.info('tokenAuthenticate - jwt: ' + token);

    if (process.env.NODE_ENV === 'test') {
        return await prisma.user.findFirst({ where: { id: 1 } });
    }

    const verifiedToken = verifyToken(token);

    if (!verifiedToken) {
        throw Error('Invalid token');
    }

    const userId = verifiedToken.body['userId'];
    const user = await prisma.user.findFirst({ where: { id: userId, token } });
    return user;
}

export function sessionAuthenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const jwt = req.headers['jwt'];
            if (!jwt || typeof jwt !== 'string') {
                throw new AuthenticationError('Invalid token (missing)');
            }

            const user = await tokenAuthenticate(jwt);

            if (!user) {
                throw new AuthenticationError('Invalid token (user not found)');
            }

            const userReq = req as UserAwareRequest;
            userReq.user = user?.id;
            next();
        } catch (error) {
            // TODO : Split by error type
            log.error({ error }, 'sessionAuthenticate');
            res.status(401);
            res.json({ message: 'Invalid token' });
        }
    };
}

export function assertUserAwareRequest(req: Request): asserts req is UserAwareRequest {
    if (!('user' in req) || !req.user) {
        throw new Error('UserAwareRequest is not UserAwareRequest');
    }
}
