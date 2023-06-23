import { useEffect, useState } from 'react';
import { getStats } from './data';
import { CardContent, Grid, Paper, Stack, Typography, styled } from '@mui/material';

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
        <Grid container spacing={2}>
            <StatsCard title='Total Playtime' value={Math.round(statsData.totalPlaytime / (1000 * 60 * 60)).toLocaleString() + ' hours'} />
            <StatsCard title='Unique Artists' value={Math.round(statsData.uniqueArtistCount).toLocaleString()} />
            <StatsCard title='Unique Tracks' value={Math.round(statsData.uniqueTrackCount).toLocaleString()} />
            <StatsCard title='Tracks Played' value={Math.round(statsData.trackCount).toLocaleString()} />
        </Grid>
    );
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

function StatsCard({ title, value }: { title: string; value: string | number }) {
    return (
        <Grid item xs={12} sm={6} md={3} key={title}>
            <Item>
                <CardContent>
                    <Typography variant='h6'>{title}</Typography>
                    <Typography variant='subtitle1'>{value}</Typography>
                </CardContent>
            </Item>
        </Grid>
    );
}
