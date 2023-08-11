import { create, verify } from 'njwt';
import * as secureRandom from 'secure-random';

import config from '../config';
import { makeLogger } from '../logger';

const log = makeLogger(module);

const signingKey = generateKey();

export function jwt(additionalClaims: Record<string, string | number>) {
    const claims = {
        iss: config.host + ':' + config.port,
        ...additionalClaims,
    };

    const jwt = create(claims, signingKey);
    return jwt;
}

export function generateKey() {
    const signingKey = secureRandom(256, { type: 'Buffer' });
    log.info('jwt signingKey generated: ' + signingKey.toString('base64'));

    return signingKey;
}

export function verifyToken(token: string) {
    if (!token) {
        throw new Error('No token provided');
    }

    return verify(token, signingKey);
}
