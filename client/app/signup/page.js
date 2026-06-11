'use client';

import Signup from '@/components/Signup';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    return <Signup onSignup={() => router.push('/dashboard')} />;
}
