import * as React from 'react';

import { Inter } from 'next/font/google';

import { Box, Card, Stack, Typography } from '@mui/material';

import { HomeLayout } from '@/layout/home';
import { Nav } from 'c/nav';
import { StreamHistory } from '@/components/stream-history';
import { TopArtists } from '@/components/top-artists';
import { StreamHistoryStats } from '@/components/stream-history-stats';
import { UploadFiles } from '@/components/upload-file';

import { CONFIG } from '@/config';
import { useRouter } from 'next/router';
import { GetUserDetailsResponseData, UserDetails } from 'spotify-analytics-types';

const inter = Inter({ subsets: ['latin'] });

async function getUserDetails() {
    const res = await fetch(CONFIG.API_BASE + '/me', {});

    if (!res.ok) {
        throw new Error('Error fetching data', { cause: await res.json() });
    }

    return (await res.json()) as GetUserDetailsResponseData;
}

export default function Home() {
    const [userDetails, setUserDetails] = React.useState<UserDetails | undefined>();

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
            {userDetails.streamHistoryRecordCount > 0 ? <Analytics /> : <GetStarted />}
        </HomeLayout>
    );
}

function Analytics() {
    return (
        <Stack spacing={2} minHeight='100%' padding={2}>
            <StreamHistoryStats />
            <StreamHistory />
            <TopArtists />
        </Stack>
    );
}

function GetStarted() {
    const router = useRouter();

    return (
        <Card variant='outlined' sx={{ height: '100%' }}>
            <Box
                display='flex'
                flexDirection='column'
                alignContent='center'
                justifyContent='center'
                alignItems='center'
                paddingY={10}
                paddingX={2}
                textAlign='center'
            >
                <Box marginBottom={3} display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                    <Typography variant='h2' sx={{}}>
                        Get Started!
                    </Typography>
                    <Typography variant='body1' sx={{ margin: 1.5, maxWidth: 800 }}>
                        Upload your stream history from Spotify.
                        <br />
                        We&apos;ll analyse your listening habits and show you some cool charts.
                        <br />
                    </Typography>
                </Box>
                <Box marginBottom={1}>
                    <UploadFiles onSubmit={() => router.push('/upload')} />
                </Box>
                <Typography variant='caption' sx={{ margin: 1.5, maxWidth: 800 }}>
                    Not sure where to get this from? Read our guide on how to download your stream history from Spotify.
                </Typography>
                <Typography variant='caption'>Read our privacy policy to learn more about how we use your data.</Typography>
            </Box>
        </Card>
    );
}
