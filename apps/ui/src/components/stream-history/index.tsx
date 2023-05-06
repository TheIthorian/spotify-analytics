import { ReactNode, useEffect, useState } from 'react';
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
        <div className='p-3 max-w-full overflow-x-auto'>
            <table className='border-solid border-4 border-gray-800 table-fixed w-full'>
                <tbody>
                    <tr className='border-b-2 border-solid border-gray-800'>
                        <Th>Track Name</Th>
                        <Th>Artist Name</Th>
                        <Th>Ms Played</Th>
                        <Th>End Time</Th>
                        <Th>Spotify TrackId</Th>
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
        <tr key={id} className='p-2 border-b border-solid border-gray-800 odd:bg-gray-200 hover:bg-stone-100'>
            <Td>{trackName}</Td>
            <Td>{artistName}</Td>
            <Td>{msPlayed}</Td>
            <Td>{new Date(endTime).toLocaleDateString()}</Td>
            <Td>{spotifyTrackId}</Td>
        </tr>
    );
}

function Th({ children }: { children: ReactNode }) {
    // return <th className='p-1 text-left border-r border-gray-800'>{children}</th>;
    return <th className='p-1 border-r border-gray-800'>{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
    // return <td className='p-1 text-left align-top border-r border-gray-800'>{children}</td>;
    return <td className='p-1 border-r border-gray-800'>{children}</td>;
}
