import { makeLogger } from '../logger';
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { z } from 'zod';

const log = makeLogger(module);

const MAX_RECORD_LIMIT = 100;

export const GetStreamHistoryOptionsSchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    limit: z.coerce.number().positive().optional(),
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

    const limit = options.limit === undefined || options.limit > 100 ? MAX_RECORD_LIMIT : options.limit;
    const offset = options.offset ?? 0;
    queryArgs.skip = limit * offset;
    queryArgs.take = limit;

    log.debug({ queryArgs }, `(${getStreamHistory.name}) - queryArgs`);

    const streamHistory = await prisma.streamHistory.findMany({
        ...queryArgs,
        select: { id: true, trackName: true, artistName: true, msPlayed: true, endTime: true, spotifyTrackId: true },
        orderBy: { endTime: 'desc' },
    });

    const recordCount = await prisma.streamHistory.count();

    log.info({ resultCount: streamHistory.length, recordCount }, `(${getStreamHistory.name}) - results`);
    return { streamHistory, recordCount };
}

export const GetTopArtistsOptionsSchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    limit: z.coerce.number().positive().optional(),
    groupBy: z
        .union([z.literal('timePlayed'), z.literal('listenCount')])
        .default('listenCount')
        .optional(),
});

export type GetTopArtistsOptions = z.infer<typeof GetTopArtistsOptionsSchema>;

type ArtistListenAmount = {
    name: string;
    count: number;
};

type TopArtistsListAggregateQueryOptions = { where?: { endTime?: { gte?: Date; lte?: Date } } };

export async function getTopArtist(options: GetTopArtistsOptions): Promise<ArtistListenAmount[]> {
    log.info({ options }, `(${getTopArtist.name})`);

    const queryArgs: TopArtistsListAggregateQueryOptions = {};
    if (options.dateFrom || options.dateTo) {
        const dateFilter: { gte?: Date; lte?: Date } = {};
        queryArgs.where = { endTime: dateFilter };
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;
    }

    log.debug({ queryArgs }, `(${getStreamHistory.name}) - queryArgs`);

    const resultLimit = options.limit ?? 10;
    if (options.groupBy === 'timePlayed') {
        return await getArtistsByTimePlayed(queryArgs, resultLimit);
    }

    return getArtistsByPlayCount(queryArgs, resultLimit);
}

async function getArtistsByTimePlayed(queryArgs: TopArtistsListAggregateQueryOptions, limit: number) {
    const queryResult = await prisma.streamHistory.groupBy({
        by: ['artistName'],
        _sum: { msPlayed: true },
        where: queryArgs?.where,
        orderBy: {
            _sum: { msPlayed: 'desc' },
        },
        take: limit,
    });

    return queryResult.map(a => ({ count: a._sum.msPlayed, name: a.artistName }));
}

async function getArtistsByPlayCount(queryArgs: TopArtistsListAggregateQueryOptions, limit: number) {
    const queryResult = await prisma.streamHistory.groupBy({
        by: ['artistName'],
        _count: { id: true },
        where: queryArgs?.where,
        orderBy: {
            _count: { id: 'desc' },
        },
        take: limit,
    });

    return queryResult.map(a => ({ count: a._count.id, name: a.artistName }));
}
