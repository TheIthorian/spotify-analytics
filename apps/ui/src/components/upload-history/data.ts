import { CONFIG } from '@/config';

export async function getUploadHistory() {
    const res = await fetch(CONFIG.API_BASE + '/upload', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const streamHistory = await res.json();

    return streamHistory;
}
