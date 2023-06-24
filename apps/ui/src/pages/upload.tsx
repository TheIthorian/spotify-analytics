import { Nav } from '@/components/nav';
import { UploadFiles } from '@/components/upload-file';
import { UploadHistory } from '@/components/upload-history';
import { HomeLayout } from '@/layout/home';
import { Box, Card, Stack, Typography } from '@mui/material';

export default function Upload() {
    return (
        <HomeLayout>
            <Nav />
            <Stack spacing={2} minHeight='100%' padding={2}>
                <Card sx={{ padding: 2 }}>
                    <Typography variant='h6'>Upload Stream History</Typography>
                    <Typography variant='body1'>Upload more spotify stream history by adding files below.</Typography>
                    <Box marginTop={2}>
                        <UploadFiles />
                    </Box>
                </Card>
                <UploadHistory />
            </Stack>
        </HomeLayout>
    );
}
