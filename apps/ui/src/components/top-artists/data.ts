import { CONFIG } from '@/config';

export async function getTopArtists({
    dateFrom,
    dateTo,
    limit,
    groupBy,
}: {
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    groupBy?: 'listenCount' | 'timePlayed';
}) {
    const query = new URLSearchParams();
    if (dateFrom) query.append('dateFrom', dateFrom.toISOString());
    if (dateTo) query.append('dateTo', dateTo.toISOString());
    if (limit) query.append('limit', limit.toString(10));
    if (groupBy) query.append('groupBy', groupBy);

    const res = await fetch(CONFIG.API_BASE + '/top-artists?' + query.toString(), {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const topArtists = (await res.json()).map((record: { count: number; name: string }) => ({
        count: record.count / (1000 * 60 * 60),
        name: record.name,
    }));

    return topArtists;
}
