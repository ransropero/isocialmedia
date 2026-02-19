'use client';

import Login from '@/components/Login';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    return <Login onLogin={() => router.push('/dashboard')} />;
}
