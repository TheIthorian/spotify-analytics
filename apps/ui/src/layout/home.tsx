import { ReactNode } from 'react';

export function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <main className='flex min-h-screen flex-col items-center justify-between p-8'>
            <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>{children}</div>
        </main>
    );
}
