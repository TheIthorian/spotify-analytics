import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Help() {
    const router = useRouter();
    useEffect(() => {
        router.push('/help/upload');
    }, [router]);

    return <></>;
}
