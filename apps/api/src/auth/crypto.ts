import * as crypto from 'crypto';
import { makeLogger } from '../logger';
import prisma from '../prismaClient';
import { AuthenticationError } from 'spotify-analytics-errors';
import { User } from '@prisma/client';

const ITERATIONS = 100000;
const KEYLEN = 64;

const log = makeLogger(module);

export function generateSalt(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        crypto.randomBytes(KEYLEN, (err, salt) => {
            if (err) {
                log.error({ err }, `(${generateSalt.name}) - error generating salt`);
                return reject(err);
            }

            return resolve(salt.toString('hex'));
        });
    });
}

export function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, 'sha512', (err, derivedKey) => {
            if (err) {
                log.error({ err }, `(${hashPassword.name}) - error hashing`);
                return reject(err);
            }

            return resolve(derivedKey.toString('hex'));
        });
    });
}

export async function verifyUsernamePassword(username: string, password: string): Promise<User> {
    log.info({ username, password }, `(${verifyUsernamePassword.name})`);

    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
        throw new AuthenticationError('No user with that username');
    }

    const passwordHash = await hashPassword(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) {
        throw new AuthenticationError('Incorrect password');
    }

    return user;
}
