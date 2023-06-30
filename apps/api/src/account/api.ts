import { GetUserDetailsResponseData } from 'spotify-analytics-types';
import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export async function getUserDetails(): Promise<GetUserDetailsResponseData> {
    log.info(`(${getUserDetails.name})`);

    const streamHistoryRecordCount = await prisma.streamHistory.count();

    const id = 1;
    const username = 'user@example.com';

    log.info({ streamHistoryRecordCount, id, username }, `(${getUserDetails.name}) - results`);
    return { streamHistoryRecordCount, id, username };
}
