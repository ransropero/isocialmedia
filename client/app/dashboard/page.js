'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import PlansModal from '@/components/PlansModal';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPlans, setShowPlans] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const { getCurrentUser, verifyStripeSubscription } = await import('@/services/api');
                
                // Se retornar de um pagamento de sucesso, força a verificação no Stripe
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('payment') === 'success') {
                    try {
                        await verifyStripeSubscription();
                    } catch (verifyErr) {
                        console.error('Erro na verificação automática da assinatura:', verifyErr);
                    }
                    // Limpar os parâmetros de busca da URL de forma limpa
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                const userData = await getCurrentUser();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (e) {
                console.error('Auth refresh failed', e);
                
                // If it's a 401, the token is definitely invalid
                if (e.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                    return;
                }

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    localStorage.clear();
                    router.push('/login');
                }
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
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header
                user={user}
                onLogout={handleLogout}
                onShowPlans={() => setShowPlans(true)}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Dashboard user={user} onShowPlans={() => setShowPlans(true)} />
            </main>

            <PlansModal
                isOpen={showPlans}
                onClose={() => setShowPlans(false)}
            />
        </div>
    );
}
