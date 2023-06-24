import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';

export function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 250,
                minHeight: '100vh',
            }}
            id='home-layout'
        >
            {children}
        </Box>
    );
}
