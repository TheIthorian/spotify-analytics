import { z } from 'zod';

export type StreamHistory = {
    id: number;
    trackName: string | null;
    albumName: string | null;
    artistName: string | null;
    msPlayed: number;
    datePlayed: Date;
    platform: string;
    spotifyTrackUri: string | null;
    isSong: boolean;
    episodeName: string | null;
    episodeShowName: string | null;
    spotifyShowUri: string | null;
    shuffle: boolean;
    skipped: boolean | null;
    offline: boolean;
    reasonStart: string;
    reasonEnd: string;
    incognitoMode: boolean | null;
};

export type GetStreamHistoryResponseData = StreamHistory[];

export const GetStreamHistoryOptionsSchema = z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    limit: z.coerce.number().positive().optional(),
    offset: z.coerce.number().nonnegative().optional(),
});

export type GetStreamHistoryOptions = z.infer<typeof GetStreamHistoryOptionsSchema>;

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

export type GetTopArtistsResponseData = Array<{
    name: string;
    count: number;
}>;

export type GetStatsResponseData = {
    totalPlaytime: number;
    uniqueArtistCount: number;
    uniqueTrackCount: number;
    trackCount: number;
};
