import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export type UserDetails = {
    id: number;
    username: string;
    streamHistoryRecordCount: number;
};

export async function getUserDetails(): Promise<UserDetails> {
    log.info(`(${getUserDetails.name})`);

    const streamHistoryRecordCount = await prisma.streamHistory.count();

    const id = 1;
    const username = 'user@example.com';

    log.info({ streamHistoryRecordCount, id, username }, `(${getUserDetails.name}) - results`);
    return { streamHistoryRecordCount, id, username };
}
