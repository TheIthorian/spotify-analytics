import { HomeLayout } from '@/layout/home';
import { Inter } from 'next/font/google';
import { Nav } from 'c/nav';
import { StreamHistory } from '@/components/stream-history';
import { TopArtists } from '@/components/top-artists';
import { StreamHistoryStats } from '@/components/stream-history-stats';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
    return (
        <HomeLayout>
            <Nav />
            <div className='p-2'>
                <StreamHistoryStats />
                <StreamHistory />
                <TopArtists />
            </div>
        </HomeLayout>
    );
}
