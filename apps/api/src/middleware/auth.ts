import * as crypto from 'crypto';

import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { VerifyFunction } from 'passport-local';

import { makeLogger } from '../logger';
import prisma from '../prismaClient';
import { verifyToken } from '../auth/jwt';
import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';

const log = makeLogger(module);

const ITERATIONS = 100000;
const KEYLEN = 64;

export function verifyUsernamePassword(username, password, done) {
    log.info({ username, password }, `(${verifyUsernamePassword.name})`);

    prisma.user
        .findFirst({ where: { username } })
        .then(user => {
            log.info({ username, user }, `(${verifyUsernamePassword.name})`);

            if (!user) {
                return done(null, false, { message: 'Incorrect credentials provided' });
            }

            crypto.pbkdf2(password, user?.passwordSalt ?? 'salt', ITERATIONS, KEYLEN, 'sha512', (err, derivedKey) => {
                if (err) {
                    log.error({ err }, `(${verifyUsernamePassword.name}) - error hashing`);
                    return done(err, false, { message: 'Incorrect credentials provided' });
                }

                if (derivedKey.toString('hex') === user?.passwordHash) {
                    return done(null, user);
                }

                log.error({ message: 'Incorrect credentials provided' }, `(${verifyUsernamePassword.name})`);
                return done(null, false, { message: 'Incorrect credentials provided' });
            });
        })
        .catch(err => {
            log.error({ err }, `(${verifyUsernamePassword.name})`);
            return done(err);
        });
}

export async function verifyUsernamePasswordAsync(username: string, password: string) {
    return new Promise<User>((resolve, reject) => {
        verifyUsernamePassword(username, password, (err: Error, user: User, info: string) => {
            if (err) {
                return reject(err);
            }

            if (user) {
                return resolve(user);
            }

            return reject(info);
        });
    });
}

// export function sessionAuthenticate(req, res, next) {
//     log.info('sessionAuthenticate ');
//     return passport.authenticate('local', (err, user, info, status) => {
//         log.info({ err, user, info, status }, 'sessionAuthenticate complete');
//     });
// }

export function sessionAuthenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            log.info('sessionAuthenticate - jwt: ' + req.cookies.jwt);
            const token = req.cookies.jwt;

            const verifiedToken = verifyToken(token);

            if (!verifiedToken) {
                throw Error('Invalid token');
            }

            const userId = verifiedToken.body['userId'];

            const user = await prisma.user.findFirst({ where: { id: userId, token } });

            if (!user) {
                res.status(401);
                res.json({ message: 'Invalid token (user not found)' });
            }

            req.user = userId;
            next();
        } catch (error) {
            // TODO : Split by error type
            log.error({ error }, 'sessionAuthenticate');
            res.status(401);
            res.json({ message: 'Invalid token' });
        }
    };
}

// passport.use(new LocalStrategy({ session: false }, verifyUsernamePassword));

// passport.use(
//     new JwtStrategy(
//         {
//             secretOrKey: 'secret',
//             passReqToCallback: true,
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         },
//         async (req, payload, done) => {
//             log.info({ payload }, 'jwt verify');

//             prisma.user
//                 .findFirst({ where: { id: payload.id } })
//                 .then(user => {
//                     if (user) {
//                         req.user = user;
//                         return done(null, user);
//                     }

//                     return done(null, false);
//                 })
//                 .catch(err => {
//                     log.error({ err }, 'jwt verify');
//                     return done(err, false);
//                 });
//         }
//     )
// );
