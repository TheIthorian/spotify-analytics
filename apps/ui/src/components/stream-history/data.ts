import { CONFIG } from '@/config';

export async function getStreamHistory({
    dateFrom,
    dateTo,
    limit,
    offset,
}: {
    dateFrom: Date;
    dateTo: Date;
    limit: number;
    offset: number;
}) {
    const query = new URLSearchParams();
    // query.append('dateFrom', dateFrom.toISOString());
    // query.append('dateTo', dateTo.toISOString());
    query.append('limit', limit.toString(10));
    query.append('offset', offset.toString(10));

    const res = await fetch(CONFIG.API_BASE + '/history?' + query.toString(), {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    const count = Number(res.headers.get('Count'));
    const total = Number(res.headers.get('Total'));

    const streamHistory = await res.json();

    console.log({ streamHistory, count, total });

    return { streamHistory, count, total };
}
