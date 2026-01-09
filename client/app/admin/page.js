'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!storedUser || !token) {
                router.push('/login');
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser);
                if (!parsedUser.isAdmin) {
                    router.push('/');
                    return;
                }
                setUser(parsedUser);
            } catch (e) {
                localStorage.clear();
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <Header user={user} onLogout={handleLogout} />
            <AdminPanel />
        </>
    );
}
