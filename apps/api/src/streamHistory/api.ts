import { Prisma } from '@prisma/client';

import {
    GetStatsResponseData,
    GetStreamHistoryOptions,
    GetStreamHistoryResponseData,
    GetTopArtistsOptions,
    GetTopArtistsResponseData,
} from 'spotify-analytics-types';

import { makeLogger } from '../logger';
import prisma from '../prismaClient';
import { parseLimit } from '../util/schema';
import config from '../config';

const log = makeLogger(module);

export async function getStreamHistory(
    options: GetStreamHistoryOptions
): Promise<{ streamHistory: GetStreamHistoryResponseData; recordCount: number }> {
    log.info({ options }, `(${getStreamHistory.name})`);

    const queryArgs: Prisma.StreamHistoryFindManyArgs = {};

    if (options.dateFrom || options.dateTo) {
        const dateFilter: { gte?: Date; lte?: Date } = {};
        queryArgs.where = { datePlayed: dateFilter };
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;
    }

    const limit = parseLimit(options.limit, 100);
    const offset = options.offset ?? 0;
    queryArgs.skip = limit * offset;
    queryArgs.take = limit;

    log.debug({ queryArgs }, `(${getStreamHistory.name}) - queryArgs`);

    const streamHistory = await prisma.streamHistory.findMany({
        ...queryArgs,
        orderBy: { datePlayed: 'desc' },
    });

    const recordCount = await prisma.streamHistory.count();

    log.info({ resultCount: streamHistory.length, recordCount }, `(${getStreamHistory.name}) - results`);
    return { streamHistory, recordCount };
}

type TopArtistsListAggregateQueryOptions = { where: { datePlayed?: { gte?: Date; lte?: Date }; isSong: boolean } };

export async function getTopArtist(options: GetTopArtistsOptions): Promise<GetTopArtistsResponseData> {
    log.info({ options }, `(${getTopArtist.name})`);

    const queryArgs: TopArtistsListAggregateQueryOptions = { where: { isSong: true } };
    if (options.dateFrom || options.dateTo) {
        const dateFilter: { gte?: Date; lte?: Date } = {};
        queryArgs.where.datePlayed = dateFilter;
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;
    }

    log.debug({ queryArgs }, `(${getStreamHistory.name}) - queryArgs`);

    if (options.groupBy === 'timePlayed') {
        return getArtistsByTimePlayed(queryArgs, parseLimit(options.limit, 100));
    }

    return getArtistsByPlayCount(queryArgs, parseLimit(options.limit, 100));
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

export async function getStats(): Promise<GetStatsResponseData> {
    log.info(`(${getStats.name})`);

    const [totalPlaytime, uniqueArtistCount, uniqueTrackCount, trackCount] =
        config.databaseType === 'file'
            ? await Promise.all([
                  prisma.streamHistory.aggregate({ _sum: { msPlayed: true }, where: { isSong: true } }),
                  prisma.$queryRaw`SELECT COUNT(DISTINCT ArtistName) as total FROM StreamHistory WHERE IsSong`,
                  prisma.$queryRaw`SELECT COUNT(DISTINCT spotifyTrackUri) as total FROM StreamHistory WHERE IsSong`,
                  prisma.$queryRaw`SELECT COUNT(*) as total FROM StreamHistory WHERE IsSong`,
              ])
            : await Promise.all([
                  prisma.streamHistory.aggregate({ _sum: { msPlayed: true }, where: { isSong: true } }),
                  prisma.$queryRaw`SELECT COUNT(DISTINCT "artistName") as total FROM public."StreamHistory" as SH WHERE "isSong";`,
                  prisma.$queryRaw`SELECT COUNT(DISTINCT "spotifyTrackUri") as total FROM public."StreamHistory" as SH WHERE "isSong";`,
                  prisma.$queryRaw`SELECT COUNT(*) as total FROM public."StreamHistory" WHERE "isSong";`,
              ]);

    return {
        totalPlaytime: totalPlaytime._sum.msPlayed,
        uniqueArtistCount: parseInt(uniqueArtistCount[0].total), // Sqlite returns a bigint
        uniqueTrackCount: parseInt(uniqueTrackCount[0].total),
        trackCount: parseInt(trackCount[0].total),
    };
}
