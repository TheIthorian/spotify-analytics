import { CONFIG } from '@/config';
import { GetStatsResponseData } from 'spotify-analytics-types';

export async function getStats() {
    const res = await fetch(CONFIG.API_BASE + '/history/stats', {
        headers: { jwt: localStorage.getItem('jwt') ?? '' },
    });

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const streamHistory = (await res.json()) as GetStatsResponseData;

    return streamHistory;
}
