import { GetUserDetailsResponseData } from 'spotify-analytics-types';
import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export async function getUserDetails(): Promise<GetUserDetailsResponseData> {
    log.info(`(${getUserDetails.name})`);

    const [streamHistory, upload] = await Promise.all([prisma.streamHistory.findFirst(), prisma.uploadFileQueue.findFirst()]);
    const hasStreamHistoryRecords = !!streamHistory;
    const hasUploads = !!upload;

    const id = 1;
    const username = 'user@example.com';

    log.info({ id, username, hasStreamHistoryRecords, hasUploads }, `(${getUserDetails.name}) - results`);
    return { id, username, hasStreamHistoryRecords, hasUploads };
}
