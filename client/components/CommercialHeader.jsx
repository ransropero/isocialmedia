'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Instagram, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CommercialHeader() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    // List of paths where the header should NOT be shown
    // This includes public bio pages (which are usually /[slug])
    // and potentially dashboard pages if we want them to have their own header.
    const isLoginPage = pathname === '/login';
    const isPublicBioPage = !['/', '/pricing', '/login', '/admin', '/dashboard'].includes(pathname);
    const isInternalPage = ['/dashboard', '/admin'].includes(pathname);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isPublicBioPage || isInternalPage) return null;

    const navClasses = isLoginPage
        ? 'bg-zinc-900 text-white py-4'
        : scrolled
            ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 py-4 text-zinc-900 dark:text-white'
            : 'bg-transparent py-6 text-zinc-900 dark:text-white';

    const linkClasses = isLoginPage
        ? 'text-zinc-300 hover:text-white'
        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white';

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform p-1">
                        <img src="/logo.png" alt="iSocialMidia Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${isLoginPage ? 'text-white' : ''}`}>
                        iSocialM
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">i</span>
                        di
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">a</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#features" className={`text-sm font-bold transition-colors ${linkClasses}`}>Funcionalidades</Link>
                    <Link href="/pricing" className={`text-sm font-bold transition-colors ${linkClasses}`}>Planos</Link>
                    <Link href="/login" className={`text-sm font-bold transition-colors ${linkClasses}`}>Entrar</Link>
                    <Link
                        href="/login?tab=register"
                        className={`${isLoginPage ? 'bg-white text-zinc-900' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'} px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/5`}
                    >
                        Começar Grátis
                    </Link>
                </div>
            </div>
        </nav>
    );
}
