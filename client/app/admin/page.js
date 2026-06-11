'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
import Header from '@/components/Header';
import { Loader2, Users, BarChart3 } from 'lucide-react';
import SiteAnalyticsDashboard from '@/components/admin/SiteAnalyticsDashboard';

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'analytics'

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Header user={user} onLogout={handleLogout} />
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                
                {/* Custom Tab Navigation */}
                <div className="flex justify-center sm:justify-start">
                    <div className="inline-flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-sm overflow-x-auto select-none">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'users'
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'analytics'
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics Global
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'users' && <AdminPanel />}
                    {activeTab === 'analytics' && <SiteAnalyticsDashboard />}
                </div>
            </main>
        </div>
    );
}
