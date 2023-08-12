import { Prisma, PrismaPromise } from '@prisma/client';

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
    userId: number,
    options: GetStreamHistoryOptions
): Promise<{ streamHistory: GetStreamHistoryResponseData; recordCount: number }> {
    log.info({ options }, `(${getStreamHistory.name})`);

    const selector: Prisma.StreamHistoryFindManyArgs = {
        where: { userId },
    };

    if (options.dateFrom || options.dateTo) {
        const dateFilter: { gte?: Date; lte?: Date } = {};
        selector.where!.datePlayed = dateFilter;
        if (options.dateFrom) dateFilter.gte = options.dateFrom;
        if (options.dateTo) dateFilter.lte = options.dateTo;
    }

    const limit = parseLimit(options.limit, 100);
    const offset = options.offset ?? 0;
    selector.skip = limit * offset;
    selector.take = limit;

    log.debug({ selector }, `(${getStreamHistory.name}) - selector`);

    const streamHistory = await prisma.streamHistory.findMany({
        ...selector,
        orderBy: { datePlayed: 'desc' },
    });

    const recordCount = await prisma.streamHistory.count();

    log.info({ resultCount: streamHistory.length, recordCount }, `(${getStreamHistory.name}) - results`);
    return { streamHistory, recordCount };
}

type TopArtistsListAggregateQueryOptions = { where: { datePlayed?: { gte?: Date; lte?: Date }; isSong: boolean; userId: number } };

export async function getTopArtist(userId: number, options: GetTopArtistsOptions): Promise<GetTopArtistsResponseData> {
    log.info({ options }, `(${getTopArtist.name})`);

    const queryArgs: TopArtistsListAggregateQueryOptions = { where: { isSong: true, userId } };
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

    return queryResult.map(a => ({ count: a._sum.msPlayed ?? 0, name: a.artistName ?? 'unknown' }));
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

    return queryResult.map(a => ({ count: a._count.id ?? 0, name: a.artistName ?? 'unknown' }));
}

export async function getStats(userId: number): Promise<GetStatsResponseData> {
    log.info(`(${getStats.name})`);

    type CountQueryResult = PrismaPromise<[{ total: string }]>;

    const [totalPlaytime, uniqueArtistCount, uniqueTrackCount, trackCount] =
        config.databaseType === 'file'
            ? await Promise.all([
                  prisma.streamHistory.aggregate({ _sum: { msPlayed: true }, where: { isSong: true, userId } }),
                  prisma.$queryRaw`SELECT COUNT(DISTINCT ArtistName) as total FROM StreamHistory WHERE IsSong AND UserId = ${userId}` as CountQueryResult,
                  prisma.$queryRaw`SELECT COUNT(DISTINCT spotifyTrackUri) as total FROM StreamHistory WHERE IsSong AND UserId = ${userId}` as CountQueryResult,
                  prisma.$queryRaw`SELECT COUNT(*) as total FROM StreamHistory WHERE IsSong AND UserId = ${userId}` as CountQueryResult,
              ])
            : await Promise.all([
                  prisma.streamHistory.aggregate({ _sum: { msPlayed: true }, where: { isSong: true, userId } }),
                  prisma.$queryRaw`SELECT COUNT(DISTINCT "artistName") as total FROM public."StreamHistory" as SH WHERE "isSong" AND UserId = ${userId};` as CountQueryResult,
                  prisma.$queryRaw`SELECT COUNT(DISTINCT "spotifyTrackUri") as total FROM public."StreamHistory" as SH WHERE "isSong" AND UserId = ${userId};` as CountQueryResult,
                  prisma.$queryRaw`SELECT COUNT(*) as total FROM public."StreamHistory" WHERE "isSong" AND UserId = ${userId};` as CountQueryResult,
              ]);

    return {
        totalPlaytime: totalPlaytime._sum.msPlayed ?? 0,
        uniqueArtistCount: parseInt(uniqueArtistCount[0].total), // Sqlite returns a bigint
        uniqueTrackCount: parseInt(uniqueTrackCount[0].total),
        trackCount: parseInt(trackCount[0].total),
    };
}
