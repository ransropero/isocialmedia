'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Shield, LogOut, User, Sparkles } from 'lucide-react';

export default function Header({ user, onLogout, onShowPlans }) {
    const pathname = usePathname();
    const router = useRouter();
    const isDashboard = pathname === '/dashboard';

    if (!user) return null;

    const getPlanLabel = (plan) => {
        const labels = {
            start: 'Start',
            growth: 'Growth',
            pro: 'Pro',
            trial: 'Trial'
        };
        return labels[plan] || plan?.charAt(0).toUpperCase() + plan?.slice(1) || 'Free';
    };

    return (
        <header className="sticky top-4 z-40 mb-8 rounded-2xl glass-panel px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm p-1">
                    <img src="/logo.png" alt="iSocialMedia Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    iSocialM
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">e</span>
                    di
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">a</span>
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {user.isAdmin && (
                    <button
                        onClick={() => router.push(isDashboard ? '/admin' : '/dashboard')}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${!isDashboard
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
                    >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">{!isDashboard ? 'Dashboard' : 'Admin'}</span>
                    </button>
                )}

                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{user.email.split('@')[0]}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Plano {getPlanLabel(user.plan)}</span>
                            {user.plan !== 'pro' && (
                                <button
                                    onClick={onShowPlans}
                                    className="text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white font-black px-2 py-0.5 rounded-md flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-indigo-500/20"
                                >
                                    <Sparkles className="w-2.5 h-2.5" /> UPGRADE
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>

                    <button
                        onClick={onLogout}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
