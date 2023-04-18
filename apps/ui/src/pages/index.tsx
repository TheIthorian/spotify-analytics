import { HomeLayout } from '@/layout/home';
import { Inter } from 'next/font/google';
import { Nav } from 'c/nav';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    return (
        <HomeLayout>
            <Nav />
            <h1>Home</h1>
            <h1>Another</h1>
        </HomeLayout>
    );
}
