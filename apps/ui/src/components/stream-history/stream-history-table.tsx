import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { TablePaginationActions } from '../table-pagination-action';
import { getStreamHistory } from './data';
import { TableHead } from '@mui/material';

export default function CustomPaginationActionsTable() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [totalNumberOfRecords, setTotalNumberOfRecords] = React.useState(100);

    const [streamHistoryData, setStreamHistoryData] = React.useState([]);
    const [error, setError] = React.useState<String>();
    const [errorCause, setErrorCause] = React.useState<String>();
    const [loading, setLoading] = React.useState(true);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - streamHistoryData.length) : 0;

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    React.useEffect(() => {
        getStreamHistory({ dateFrom: null, dateTo: null, limit: rowsPerPage, offset: page * rowsPerPage })
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

    console.table(streamHistoryData);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label='stream-history-table' stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell component='th' scope='row'>
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
                    {(rowsPerPage > 0
                        ? streamHistoryData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : streamHistoryData
                    ).map(row => (
                        <TableRow key={row.id}>
                            <TableCell scope='row'>{row.trackName}</TableCell>
                            <TableCell>{row.artistName}</TableCell>
                            <TableCell style={{ width: 160 }} align='right'>
                                {(row.msPlayed / 1000).toFixed(0)}
                            </TableCell>
                            <TableCell style={{ width: 160 }}>{new Date(row.datePlayed).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                        </TableRow>
                    )}
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
    );
}
