import { Box, Card, Typography } from '@mui/material';

export function Empty() {
    return (
        <Card variant='outlined'>
            <Box height={150} alignContent='center' justifyContent='center'>
                <Typography variant='h5' sx={{ margin: 1.5 }} textAlign='center'>
                    No Data
                </Typography>
            </Box>
        </Card>
    );
}
