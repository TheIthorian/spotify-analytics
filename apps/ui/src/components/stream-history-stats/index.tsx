import { ReactNode, useEffect, useState } from 'react';
import { getStats } from './data';

type Stats = {
    totalPlaytime: number;
    uniqueArtistCount: number;
    uniqueTrackCount: number;
    trackCount: number;
};

export function StreamHistoryStats() {
    const [statsData, setStatsData] = useState<Stats | undefined>(undefined);
    const [error, setError] = useState<String>();
    const [errorCause, setErrorCause] = useState<String>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStats()
            .then(setStatsData)
            .catch(err => {
                console.error(err);
                setErrorCause(JSON.stringify(err.cause, null, 2));
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    console.log(statsData);

    if (loading || !statsData) {
        return <span>Loading...</span>;
    }

    if (error) {
        return (
            <div>
                <span>{error}</span>
                <br />
                <pre>{errorCause}</pre>
            </div>
        );
    }

    return (
        <div className='p-3'>
            <div className='flex justify-between flex-wrap max-w-6xl'>
                <StatsCard
                    title='Total Playtime'
                    value={Math.round(statsData.totalPlaytime / (1000 * 60 * 60)).toLocaleString() + ' hours'}
                />
                <StatsCard title='Unique Artists' value={Math.round(statsData.uniqueArtistCount).toLocaleString()} />
                <StatsCard title='Unique Tracks' value={Math.round(statsData.uniqueTrackCount).toLocaleString()} />
                <StatsCard title='Tracks Played ' value={Math.round(statsData.trackCount).toLocaleString()} />
            </div>
        </div>
    );
}

function StatsCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className='block m-2 w-full sm:w-60 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>
            <h5 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{title}</h5>
            <p className='font-normal text-gray-700 dark:text-gray-400'>{value}</p>
        </div>
    );
}
