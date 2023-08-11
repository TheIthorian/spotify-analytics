import * as crypto from 'crypto';
import prisma from '../prismaClient';

export async function bootstrap() {
    const username = 'test user';
    const password = 'test password';
    const salt = 'test salt';

    const passwordHash = await hashPassword(password, salt);

    const user = await prisma.user.create({
        data: {
            username,
            displayName: 'test user display name',
            passwordHash,
            passwordSalt: salt,
        },
    });

    return { user, password };
}

// TODO - move this to a util file
const ITERATIONS = 100000;
const KEYLEN = 64;

async function hashPassword(password: string, salt: string) {
    return new Promise<string>((resolve, reject) => {
        crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, 'sha512', (err, derivedKey) => {
            if (err) {
                return reject(err);
            }

            resolve(derivedKey.toString('hex'));
        });
    });
}
