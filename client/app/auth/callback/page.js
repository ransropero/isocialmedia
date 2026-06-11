'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userData = searchParams.get('user');

        if (token && userData) {
            try {
                // Save to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', decodeURIComponent(userData));

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('Error processing login callback:', error);
                router.push('/login?error=callback_error');
            }
        } else {
            router.push('/login?error=missing_data');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                Finalizando login...
            </h1>
            <p className="text-sm text-zinc-500">
                Aguarde um momento enquanto preparamos seu acesso.
            </p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
