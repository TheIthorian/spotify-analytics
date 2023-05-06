import { HomeLayout } from '@/layout/home';
import { Inter } from 'next/font/google';
import { Nav } from 'c/nav';
import { StreamHistory } from '@/components/stream-history';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    return (
        <HomeLayout>
            <Nav />
            <div className='p-2'>
                <StreamHistory />
            </div>
        </HomeLayout>
    );
}
