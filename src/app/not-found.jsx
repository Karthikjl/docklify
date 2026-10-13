'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-dark-500">Redirecting...</div>
        </div>
    );
}
