'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Shield } from 'lucide-react';

export default function Header({ user, onLogout }) {
    const pathname = usePathname();
    const router = useRouter();
    const isDashboard = pathname === '/';

    if (!user) return null;

    return (
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl text-white">
                    <Layout className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Agendador de Postagem Instagram</h1>
            </div>
            <div className="flex items-center gap-4">
                {user.isAdmin && (
                    <button
                        onClick={() => router.push(isDashboard ? '/admin' : '/')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isDashboard ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
                    >
                        <Shield className="w-4 h-4" />
                        {!isDashboard ? 'Dashboard' : 'Painel Admin'}
                    </button>
                )}
                <div className="text-sm font-medium">
                    {user.email}
                </div>
                <button
                    onClick={onLogout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                    Sair
                </button>
            </div>
        </header>
    );
}
