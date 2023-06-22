import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// https://react-redux.js.org/tutorials/quick-start
const store = configureStore({
    reducer: {},
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <Component {...pageProps} />{' '}
        </Provider>
    );
}
