import * as React from 'react';

import {
    Card,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import { Empty } from 'c/empty';

import { TablePaginationActions } from '../table-pagination-action';
import { getStreamHistory } from './data';

const DEFAULT_ROWS_PER_PAGE = 5;

export function StreamHistory() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
    const [totalNumberOfRecords, setTotalNumberOfRecords] = React.useState(0);

    const [streamHistoryData, setStreamHistoryData] = React.useState([]);
    const [error, setError] = React.useState<String>();
    const [errorCause, setErrorCause] = React.useState<String>();
    const [loading, setLoading] = React.useState(true);

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    React.useEffect(() => {
        getStreamHistory({ dateFrom: null, dateTo: null, limit: rowsPerPage, offset: page })
            .then(({ streamHistory, count, total }) => {
                setStreamHistoryData(streamHistory);
                setTotalNumberOfRecords(total);
            })
            .catch(err => {
                console.error(err);
                setErrorCause(JSON.stringify(err.cause, null, 2));
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [rowsPerPage, page]);

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

    if (streamHistoryData.length === 0 || totalNumberOfRecords === 0) {
        return <Empty />;
    }

    return (
        <Card variant='outlined'>
            <Typography variant='h5' sx={{ margin: 1.5 }}>
                Stream History
            </Typography>
            <Divider />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 500 }} aria-label='stream-history-table' stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell component='th' style={{ width: 400 }}>
                                Track name
                            </TableCell>
                            <TableCell component='th'>Artist name</TableCell>
                            <TableCell component='th' style={{ width: 160 }} align='right'>
                                Song duration (s)
                            </TableCell>
                            <TableCell style={{ width: 160 }}>Date played</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {streamHistoryData.map(row => (
                            <TableRow key={row.id}>
                                <TableCell scope='row' style={{ width: 400 }}>
                                    {row.trackName}
                                </TableCell>
                                <TableCell>{row.artistName}</TableCell>
                                <TableCell style={{ width: 160 }} align='right'>
                                    {(row.msPlayed / 1000).toFixed(0)}
                                </TableCell>
                                <TableCell style={{ width: 160 }}>{new Date(row.datePlayed).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                colSpan={3}
                                count={totalNumberOfRecords}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: {
                                        'aria-label': 'rows per page',
                                    },
                                    native: true,
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Card>
    );
}
