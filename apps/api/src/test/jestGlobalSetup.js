import * as crypto from 'crypto';
import prisma from '../prismaClient';
import { USER } from './constants';

export default async function setup() {
    const username = USER.username;
    const password = USER.password;
    const salt = 'test salt';

    const passwordHash = await hashPassword(password, salt);

    await prisma.user.create({
        data: {
            username,
            displayName: 'test user display name',
            passwordHash,
            passwordSalt: salt,
        },
    });
}

// TODO - move this to a util file
const ITERATIONS = 100000;
const KEYLEN = 64;

async function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, 'sha512', (err, derivedKey) => {
            if (err) {
                return reject(err);
            }

            resolve(derivedKey.toString('hex'));
        });
    });
}
