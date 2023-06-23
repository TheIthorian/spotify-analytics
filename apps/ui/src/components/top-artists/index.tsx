import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getTopArtists } from './data';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const CHART_OPTIONS = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Bar Chart',
        },
    },
};

export function TopArtists() {
    const [topArtistsData, setTopArtistsData] = useState<Array<{ name: string; count: number }>>([]);
    const [error, setError] = useState<String>();
    const [errorCause, setErrorCause] = useState<String>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTopArtists({ groupBy: 'timePlayed' })
            .then(setTopArtistsData)
            .catch(err => {
                console.error(err);
                setErrorCause(JSON.stringify(err.cause, null, 2));
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    const labels = topArtistsData.map(d => d.name);

    const data = {
        labels,
        datasets: [
            {
                label: 'Top Artists By Playtime (hours)',
                data: topArtistsData.map(d => d.count),
                backgroundColor: '#1DB954',
            },
        ],
    };

    if (loading) {
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
        <Card variant='outlined'>
            <Bar title='Top Artists By Playtime' options={CHART_OPTIONS} data={data} />
        </Card>
    );
}
