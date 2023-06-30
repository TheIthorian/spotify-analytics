import { CONFIG } from '@/config';
import { GetUploadResponseData } from 'spotify-analytics-types';

export async function getUploadHistory() {
    const res = await fetch(CONFIG.API_BASE + '/upload', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const streamHistory = (await res.json()) as GetUploadResponseData;

    return streamHistory;
}
