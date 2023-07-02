import { Link } from '@/components/link';
import { Nav } from '@/components/nav';
import { HomeLayout } from '@/layout/home';
import { Card, Container, Typography } from '@mui/material';
import Image from 'next/image';

import DownloadScreenshot from 'public/assets/privacy_snap.png';

export default function UploadHelpPage() {
    return (
        <HomeLayout>
            <Nav />
            <Help />
        </HomeLayout>
    );
}

const SPOTIFY_PRIVACY_URL = 'https://www.spotify.com/us/account/privacy/';

function Help() {
    return (
        <Container sx={{ color: 'white', mb: 20 }} maxWidth='md'>
            <Typography sx={{ mb: 1 }} variant='h3'>
                Upload Guide
            </Typography>
            <Typography variant='body1'>
                This guide will show you how to download your stream history from spotify and upload into [App Name]. Before you start, you
                should already have a spotify account.
            </Typography>
            <br />

            <Typography sx={{ mb: 1 }} variant='h4'>
                Step 1: Download Stream History
            </Typography>
            <Typography variant='body1'>
                To get your stream history from spotify, head to your{' '}
                <Link href={SPOTIFY_PRIVACY_URL} target='_blank'>
                    spotify account privacy
                </Link>{' '}
                and scroll down to &quot;Download your data&quot;. Ensure the &quot;Extended streaming history&quot; option is selected and
                click &quot;Request data&quot;.
            </Typography>
            <Typography variant='body1'>You will receive an email from spotify when your data is ready to download.</Typography>

            <Container sx={{ marginY: 2 }}>
                <Card>
                    <Image src={DownloadScreenshot} alt='Screenshot of the spotify privacy page' />
                </Card>
            </Container>

            <Typography sx={{ mb: 1 }} variant='h4'>
                Step 2: Upload Stream History
            </Typography>
            <Typography variant='body1'>
                Once you have received the email from Spotify, download the zip file and extract it. You should see a folder called
                &quot;MyData&quot;.
            </Typography>
            <Typography variant='body1'>
                Go to the <Link href='/upload'>upload page</Link> and click &quot;Choose files&quot;, select all the files in the folder and
                click &quot;SUBMIT&quot;.
            </Typography>
            <Typography variant='body1'>
                Your files will be processed and, after some time, your stream history will be available in{' '}
                <Link href='/'>the dashboard</Link>.
            </Typography>
        </Container>
    );
}
