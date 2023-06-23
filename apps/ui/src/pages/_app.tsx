import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// https://react-redux.js.org/tutorials/quick-start
const store = configureStore({
    reducer: {},
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
        },
    },
});

const lightTheme = createTheme({});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <ThemeProvider theme={lightTheme}>
                <CssBaseline />
                <Component {...pageProps} />{' '}
            </ThemeProvider>
        </Provider>
    );
}
