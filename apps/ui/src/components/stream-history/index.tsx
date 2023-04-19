import { useEffect, useState } from 'react';
import { getStreamHistory } from './data';

export function StreamHistory() {
    const [streamHistoryData, setStreamHistoryData] = useState([]);
    const [error, setError] = useState<String>();
    const [errorCause, setErrorCause] = useState<String>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStreamHistory({ dateFrom: new Date(2020, 0, 1), dateTo: new Date(2023, 0, 1), limit: 10, offset: 0 })
            .then(setStreamHistoryData)
            .catch(err => {
                console.error(err);
                setErrorCause(JSON.stringify(err.cause, null, 2));
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

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
        <div>
            <table>
                <tbody>
                    <tr>
                        <th>id</th>
                        <th>trackName</th>
                        <th>artistName</th>
                        <th>msPlayed</th>
                        <th>endTime</th>
                        <th>spotifyTrackId</th>
                    </tr>
                    {streamHistoryData.map(item => streamHistoryDataRow(item))}
                </tbody>
            </table>
        </div>
    );
}

function streamHistoryDataRow({
    endTime,
    id,
    trackName,
    artistName,
    msPlayed,
    spotifyTrackId,
}: {
    endTime: Date;
    id: number;
    trackName: string;
    artistName: string;
    msPlayed: number;
    spotifyTrackId: number;
}) {
    return (
        <tr>
            <td>{id}</td>
            <td>{trackName}</td>
            <td>{artistName}</td>
            <td>{msPlayed}</td>
            <td>{new Date(endTime).toLocaleDateString()}</td>
            <td>{spotifyTrackId}</td>
        </tr>
    );
}
