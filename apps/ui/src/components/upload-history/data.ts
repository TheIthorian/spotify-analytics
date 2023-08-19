import { CONFIG } from '@/config';
import { GetUploadResponseData } from 'spotify-analytics-types';

export async function getUploadHistory({
    dateFrom,
    dateTo,
    limit,
    offset,
}: {
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
}) {
    const query = new URLSearchParams();
    if (dateFrom) query.append('dateFrom', dateFrom.toISOString());
    if (dateTo) query.append('dateTo', dateTo.toISOString());
    if (limit) query.append('limit', limit.toString(10));
    if (offset) query.append('offset', offset.toString(10));

    const res = await fetch(CONFIG.API_BASE + '/upload?' + query.toString(), {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', jwt: localStorage.getItem('jwt') ?? '' },
    });

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const count = Number(res.headers.get('Count'));
    const total = Number(res.headers.get('Total'));

    const uploads = (await res.json()) as GetUploadResponseData;

    console.log({ uploads, count, total });

    return { uploads, count, total };
}
