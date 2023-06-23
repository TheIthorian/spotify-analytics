import { Box } from '@mui/material';
import { ReactNode } from 'react';

export function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
            }}
        >
            {children}
        </Box>
    );
}
