'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PlansModal from '@/components/PlansModal';
import { Loader2, ShieldAlert, CreditCard, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPlans, setShowPlans] = useState(false);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const { getCurrentUser } = await import('@/services/api');
                const userData = await getCurrentUser();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (e) {
                console.error('Error fetching user data', e);
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
        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleManageSubscription = async () => {
        try {
            setLoadingPortal(true);
            const { createStripePortalSession } = await import('@/services/api');
            const res = await createStripePortalSession();
            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                alert('Erro ao redirecionar para o portal de faturamento.');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Não foi possível carregar o portal. Verifique se você possui uma assinatura ativa.');
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText.toLowerCase() !== 'excluir') {
            alert('Por favor, digite "excluir" para confirmar.');
            return;
        }

        try {
            setDeletingAccount(true);
            const { deleteUserAccount } = await import('@/services/api');
            await deleteUserAccount();
            
            // Limpa armazenamento e redireciona
            localStorage.clear();
            alert('Sua conta foi excluída com sucesso.');
            router.push('/signup');
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Não foi possível excluir sua conta no momento. Tente novamente mais tarde.');
        } finally {
            setDeletingAccount(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return null;

    const planNames = {
        start: 'Start (Gratuito)',
        growth: 'Growth',
        pro: 'Pro',
        trial: 'Trial'
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-16">
            <Header
                user={user}
                onLogout={handleLogout}
                onShowPlans={() => setShowPlans(true)}
            />

            <main className="max-w-4xl mx-auto px-6 pt-8">
                {/* Back button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-sm font-bold uppercase tracking-wider mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
                </Link>

                <h1 className="text-3xl font-black tracking-tight mb-8">Minha Conta</h1>

                <div className="space-y-6">
                    {/* Perfil Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Informações do Perfil</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">E-mail</label>
                                <div className="text-sm font-medium">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-500" /> Assinatura e Planos
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                                    Gerencie seu plano atual, faturas e métodos de pagamento.
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black uppercase tracking-wider">
                                    Plano Atual: <span className="text-indigo-600 dark:text-indigo-400">{planNames[user.plan] || user.plan}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {user.plan === 'start' || user.plan === 'trial' ? (
                                    <button
                                        onClick={() => setShowPlans(true)}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                                    >
                                        Upgrade de Plano ⚡
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={loadingPortal}
                                        className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:opacity-95 text-white dark:text-black rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {loadingPortal ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Gerenciar Assinatura & Cancelamentos'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-[32px] p-8">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" /> Zona de Perigo
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            A exclusão da sua conta cancelará imediatamente qualquer assinatura ativa e excluirá de forma permanente todas as suas Bio Pages e posts configurados. Essa ação não pode ser desfeita.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" /> Excluir Minha Conta
                        </button>
                    </div>
                </div>
            </main>

            <PlansModal
                isOpen={showPlans}
                onClose={() => setShowPlans(false)}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[500px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl p-8">
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6" /> Confirmar Exclusão
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                            Esta ação é <span className="font-bold text-red-500">irreversível</span>. Todos os seus links, estatísticas de acesso e agendamentos serão excluídos permanentemente de nossos servidores. Qualquer assinatura recorrente será cancelada imediatamente.
                        </p>
                        <div className="mb-6">
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                                Digite <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">excluir</span> abaixo para confirmar:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-red-500"
                                placeholder="Digite 'excluir'"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-black text-sm text-center cursor-pointer hover:opacity-90"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount || deleteConfirmationText.toLowerCase() !== 'excluir'}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm text-center cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deletingAccount ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Excluir Definitivamente'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
