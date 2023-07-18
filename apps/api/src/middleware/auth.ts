import { VerifyFunction } from 'passport-local';
import * as crypto from 'crypto';

import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export const verifyUsernamePassword: VerifyFunction = function (username, password, done) {
    log.info({ username, password }, `(${verifyUsernamePassword.name})`);

    prisma.user
        .findFirst({ where: { username } })
        .then(user => {
            log.info({ username, user }, `(${verifyUsernamePassword.name})`);

            if (!user) {
                return done(null, false, { message: 'Incorrect credentials provided' });
            }

            crypto.pbkdf2(password, user?.passwordSalt ?? 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
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
};

export async function verifyUsernamePasswordAsync(username: string, password: string) {
    return new Promise((resolve, reject) => {
        verifyUsernamePassword(username, password, (err, user, info) => {
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
