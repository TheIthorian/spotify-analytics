import * as React from 'react';

import { HomeLayout } from '@/layout/home';
import { Inter } from 'next/font/google';

import { Nav } from 'c/nav';
import { StreamHistory } from '@/components/stream-history';
import { TopArtists } from '@/components/top-artists';
import { StreamHistoryStats } from '@/components/stream-history-stats';

import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { CONFIG } from '@/config';
import { UploadFiles } from '@/components/upload-file';

const inter = Inter({ subsets: ['latin'] });

async function getUserDetails() {
    const res = await fetch(CONFIG.API_BASE + '/me', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    return res.json();
}

export default function Home() {
    const [userDetails, setUserDetails] = React.useState(null);

    React.useEffect(() => {
        getUserDetails()
            .then(setUserDetails)
            .catch(error => {
                console.error(error);
            });
    }, []);

    if (!userDetails) {
        return (
            <HomeLayout>
                <Nav />
                <p>Loading...</p>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            <Nav />
            <Stack sx={{ padding: 2 }} spacing={2}>
                {userDetails.streamHistoryRecordCount > 0 ? <Analytics /> : <GetStarted />}
            </Stack>
        </HomeLayout>
    );
}

function Analytics() {
    return (
        <>
            <StreamHistoryStats />
            <StreamHistory />
            <TopArtists />
        </>
    );
}

function GetStarted() {
    return (
        <Card variant='outlined'>
            <Box
                display='flex'
                flexDirection='column'
                alignContent='center'
                justifyContent='center'
                alignItems='center'
                padding={5}
                textAlign='center'
            >
                <Typography variant='h5' sx={{ margin: 1.5 }}>
                    Get started by uploading your stream history!
                </Typography>
                <Typography variant='body1' sx={{ margin: 1.5 }}>
                    Upload your stream history from Spotify.
                </Typography>
                <Box>
                    <UploadFiles />
                </Box>
            </Box>
        </Card>
    );
}
