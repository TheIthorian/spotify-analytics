import { CONFIG } from '@/config';
import { GetUploadResponseData } from 'spotify-analytics-types';
import { io } from 'socket.io-client';

export async function getUploadHistory() {
    const res = await fetch(CONFIG.API_BASE + '/upload', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const streamHistory = (await res.json()) as GetUploadResponseData;

    return streamHistory;
}

const socket = io('ws://127.0.0.1:2999/');

export function getSocketConnection() {
    return socket;
}
