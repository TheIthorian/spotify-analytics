import { Nav } from '@/components/nav';
import { UploadHistory } from '@/components/upload-history';
import { HomeLayout } from '@/layout/home';

export default function Upload() {
    return (
        <HomeLayout>
            <Nav />
            <UploadHistory />
        </HomeLayout>
    );
}
