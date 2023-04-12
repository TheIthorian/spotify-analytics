import { makeLogger } from '../logger';
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { z } from 'zod';

const log = makeLogger(module);

const MAX_PAGE_SIZE = 100;

export const GetStreamHistoryOptionsSchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    pageSize: z.coerce.number().positive().optional(),
    offset: z.coerce.number().nonnegative().optional(),
});

export type GetStreamHistoryOptions = z.infer<typeof GetStreamHistoryOptionsSchema>;

export async function getStreamHistory(options: GetStreamHistoryOptions) {
    log.info({ options }, `(${getStreamHistory.name})`);

    const queryArgs: Prisma.StreamHistoryFindManyArgs = {};

    if (Boolean(options.dateFrom || options.dateTo)) {
        const dateFilter: { gte?: Date; lte?: Date } = {};
        queryArgs.where = { endTime: dateFilter };
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;
    }

    const pageSize = options.pageSize ?? MAX_PAGE_SIZE;
    const offset = options.offset ?? 0;
    queryArgs.skip = pageSize * offset;
    queryArgs.take = pageSize;

    log.info({ queryArgs }, `(${getStreamHistory.name}) - queryArgs`);

    return await prisma.streamHistory.findMany({
        ...queryArgs,
        select: { id: true, trackName: true, artistName: true, msPlayed: true, endTime: true, spotifyTrackId: true },
        orderBy: { endTime: 'desc' },
    });
}
