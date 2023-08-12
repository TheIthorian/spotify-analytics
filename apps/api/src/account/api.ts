import { GetUserDetailsResponseData } from 'spotify-analytics-types';
import { ResourceNotFoundError } from 'spotify-analytics-errors';

import { makeLogger } from '../logger';
import prisma from '../prismaClient';

const log = makeLogger(module);

export async function getUserDetails(userId: number): Promise<GetUserDetailsResponseData> {
    log.info({ userId }, `(${getUserDetails.name})`);

    const [streamHistory, upload, userDetails] = await Promise.all([
        prisma.streamHistory.findFirst({ where: { userId } }),
        prisma.uploadFileQueue.findFirst({ where: { userId } }),
        prisma.user.findFirst({
            select: {
                id: true,
                username: true,
                displayName: true,
            },
            where: { id: userId },
        }),
    ]);

    if (!userDetails) {
        throw new ResourceNotFoundError(`User {${userId}} not found`);
    }

    const hasStreamHistoryRecords = !!streamHistory;
    const hasUploads = !!upload;

    const results = {
        ...userDetails,
        hasStreamHistoryRecords,
        hasUploads,
    };

    log.info(results, `(${getUserDetails.name}) - results`);
    return results;
}
