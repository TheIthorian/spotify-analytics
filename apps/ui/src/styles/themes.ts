import { createTheme } from '@mui/material';

const baseTheme = {
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
};

export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
        },
    },
    typography: { ...baseTheme.typography, allVariants: { color: 'white' } },
});

export const lightTheme = createTheme({
    ...baseTheme,
    typography: { ...baseTheme.typography, allVariants: { color: 'black' } },
});
