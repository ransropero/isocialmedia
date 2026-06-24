'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { resolveShortLink } from '@/services/api';
import { Loader2, AlertTriangle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function ShortLinkRedirect() {
    const params = useParams();
    const router = useRouter();
    const shortCode = params.shortCode;

    const [status, setStatus] = useState('loading'); // 'loading' | 'expired' | 'not_found' | 'error'
    const [originalUrl, setOriginalUrl] = useState('');

    useEffect(() => {
        if (!shortCode) return;

        const handleResolve = async () => {
            try {
                const res = await resolveShortLink(shortCode);
                if (res.data) {
                    if (res.data.expired) {
                        setStatus('expired');
                        setOriginalUrl(res.data.originalUrl);
                    } else {
                        // Redirecionamento limpo
                        window.location.href = res.data.originalUrl;
                    }
                }
            } catch (err) {
                console.error('Erro ao resolver link:', err);
                if (err.response?.status === 404) {
                    setStatus('not_found');
                } else {
                    setStatus('error');
                }
            }
        };

        handleResolve();
    }, [shortCode]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
                    <h2 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">Redirecionando...</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Você está sendo levado ao seu destino.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>
                
                <div className="relative z-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {status === 'expired' ? 'Link Expirado' : 'Link Não Encontrado'}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                            {status === 'expired' 
                                ? 'Este link encurtado atingiu a data de validade limite estabelecida pelo criador e não está mais disponível.' 
                                : 'O link que você está tentando acessar não existe ou foi removido pelo proprietário.'}
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Link 
                            href="/"
                            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Ir para a Home
                        </Link>
                        <a 
                            href="https://isocialmedia.com.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-2xl font-black text-sm transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"
                        >
                            Criar meus próprios links <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
