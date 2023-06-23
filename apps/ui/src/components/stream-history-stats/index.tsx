import { useEffect, useState } from 'react';
import { getStats } from './data';
import { Card, CardContent, Paper, Stack, Typography } from '@mui/material';

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
        <Stack direction={{ sm: 'column', md: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }} justifyContent='space-between'>
            <StatsCard title='Total Playtime' value={Math.round(statsData.totalPlaytime / (1000 * 60 * 60)).toLocaleString() + ' hours'} />
            <StatsCard title='Unique Artists' value={Math.round(statsData.uniqueArtistCount).toLocaleString()} />
            <StatsCard title='Unique Tracks' value={Math.round(statsData.uniqueTrackCount).toLocaleString()} />
            <StatsCard title='Tracks Played' value={Math.round(statsData.trackCount).toLocaleString()} />
        </Stack>
    );
}

function StatsCard({ title, value }: { title: string; value: string | number }) {
    return (
        <Card component={Paper} variant='outlined'>
            <CardContent>
                <Typography variant='h6'>{title}</Typography>
                <Typography variant='subtitle1'>{value}</Typography>
            </CardContent>
        </Card>
    );
}
