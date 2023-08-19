import { CONFIG } from '@/config';
import { GetStreamHistoryResponseData } from 'spotify-analytics-types';

export async function getStreamHistory({
    dateFrom,
    dateTo,
    limit,
    offset,
}: {
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
}): Promise<{ streamHistory: GetStreamHistoryResponseData; count: number; total: number }> {
    const query = new URLSearchParams();
    if (dateFrom) query.append('dateFrom', dateFrom.toISOString());
    if (dateTo) query.append('dateTo', dateTo.toISOString());
    if (limit) query.append('limit', limit.toString(10));
    if (offset) query.append('offset', offset.toString(10));

    const res = await fetch(CONFIG.API_BASE + '/history?' + query.toString(), {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', jwt: localStorage.getItem('jwt') ?? '' },
    });

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const count = Number(res.headers.get('Count'));
    const total = Number(res.headers.get('Total'));

    const streamHistory = (await res.json()) as GetStreamHistoryResponseData; // TODO - Make fetch interface

    console.log({ streamHistory, count, total });

    return { streamHistory, count, total };
}
