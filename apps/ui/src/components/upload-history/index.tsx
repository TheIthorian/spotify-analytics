import * as React from 'react';

import {
    Box,
    Card,
    Divider,
    Paper,
    Stack,
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
import { getUploadHistory } from './data';
import { UploadFiles } from '../upload-file';
import { GetUploadResponseData } from 'spotify-analytics-types';
import { Link } from '@/components/link';

const DEFAULT_ROWS_PER_PAGE = 5;

export function UploadHistory() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
    const [totalNumberOfRecords, setTotalNumberOfRecords] = React.useState(0);

    const [uploadHistoryData, setUploadHistoryData] = React.useState<GetUploadResponseData>([]);
    const [error, setError] = React.useState<String>();
    const [errorCause, setErrorCause] = React.useState<String>();
    const [loading, setLoading] = React.useState(true);

    function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
        setPage(newPage);
    }

    function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    function fetchUploadHistory() {
        console.log('fetchUploadHistory');
        getUploadHistory({ dateFrom: undefined, dateTo: undefined, limit: rowsPerPage, offset: page })
            .then(({ uploads, count, total }) => {
                setUploadHistoryData(uploads);
                setTotalNumberOfRecords(total);
            })
            .catch(err => {
                console.error(err);
                setErrorCause(JSON.stringify(err.cause, null, 2));
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }

    React.useEffect(() => {
        fetchUploadHistory();
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

    return (
        <Stack spacing={2} minHeight='100%' padding={2}>
            <Card sx={{ padding: 2 }}>
                <Typography variant='h6'>Upload Stream History</Typography>
                <Typography variant='body1'>Upload more spotify stream history by adding files below.</Typography>
                <Typography variant='body2'>
                    <Link href='help/upload'>See how to download your stream history from Spotify.</Link>
                </Typography>

                <Box marginTop={2}>
                    <UploadFiles onSubmit={fetchUploadHistory} />
                </Box>
            </Card>
            <UploadHistoryDataTable
                {...{
                    totalNumberOfRecords,
                    uploadHistoryData,
                    onRowsPerPageChange: handleChangeRowsPerPage,
                    onPageChange: handleChangePage,
                    page,
                    rowsPerPage,
                }}
            />
        </Stack>
    );
}

function UploadHistoryDataTable({
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    totalNumberOfRecords,
    uploadHistoryData,
}: {
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    page: number;
    rowsPerPage: number;
    totalNumberOfRecords: number;
    uploadHistoryData: any[];
}) {
    if (uploadHistoryData.length === 0 || totalNumberOfRecords === 0) {
        return <Empty />;
    }

    return (
        <Card variant='outlined'>
            <Typography variant='h5' sx={{ margin: 1.5 }}>
                Uploads
            </Typography>
            <Divider />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 500 }} aria-label='upload-table' stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell component='th'>Id</TableCell>
                            <TableCell component='th'>File Name</TableCell>
                            <TableCell component='th'>Size (Mb)</TableCell>
                            <TableCell component='th'>Status</TableCell>
                            <TableCell component='th'>Upload Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {uploadHistoryData.map(row => (
                            <TableRow key={row.id}>
                                <TableCell scope='row'>{row.id}</TableCell>
                                <TableCell scope='row'>{row.filename}</TableCell>
                                <TableCell scope='row'>{(row.size / (1024 * 1024)).toFixed(2)}</TableCell>
                                <TableCell scope='row'>{row.status}</TableCell>
                                <TableCell style={{ width: 160 }}>{new Date(row.uploadDate).toLocaleDateString()}</TableCell>
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
                                    inputProps: { 'aria-label': 'rows per page' },
                                    native: true,
                                }}
                                onPageChange={onPageChange}
                                onRowsPerPageChange={onRowsPerPageChange}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Card>
    );
}
