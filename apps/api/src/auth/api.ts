import { NotImplementedError } from 'spotify-analytics-errors';
import { makeLogger } from '../logger';
import { generateSalt, hashPassword, tokenAuthenticate, verifyUsernamePasswordAsync } from '../middleware/auth';
import { jwt } from './jwt';
import prisma from '../prismaClient';

const log = makeLogger(module);

export async function webFlowLogin(provider: string) {
    log.info({ provider }, `(${webFlowLogin.name})`);
    throw new NotImplementedError(webFlowLogin.name + ' not implemented');
}

export type LoginInputs = { username: string; password: string };
export async function login({ username, password }: LoginInputs) {
    const user = await verifyUsernamePasswordAsync(username, password);

    const token = await jwt({ userId: user.id, permission: 'user' });

    await prisma.user.update({
        where: { id: user.id },
        data: { token: token.compact() },
    });

    return token;
}

export async function logout(session: string) {
    log.info({ session }, `(${logout.name})`);

    await tokenAuthenticate(session);

    // TODO - fix this
    // await prisma.user.update({
    //     where: { token: session },
    //     data: { token: null },
    // });
}

export async function signup({ username, password }: LoginInputs) {
    log.info(`(${signup.name})`);

    const passwordSalt = await generateSalt();
    const passwordHash = await hashPassword(password, passwordSalt);

    return await prisma.user.create({
        data: {
            username,
            displayName: username,
            passwordSalt,
            passwordHash,
        },
    });
}
