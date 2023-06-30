import { CONFIG } from '@/config';
import { GetStatsResponseData } from 'spotify-analytics-types';

export async function getStats() {
    const res = await fetch(CONFIG.API_BASE + '/history/stats', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const streamHistory = (await res.json()) as GetStatsResponseData;

    return streamHistory;
}
