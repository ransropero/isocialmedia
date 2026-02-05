'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getBioPageBySlug } from '@/services/api';
import { Instagram, Globe, Facebook, MessageCircle, Twitter } from 'lucide-react';

export default function BioPageRender() {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const response = await getBioPageBySlug(slug);
                setPage(response.data);
            } catch (err) {
                console.error(err);
                setError('Página não encontrada');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error || !page) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400">{error || 'Página não encontrada'}</p>
            </div>
        </div>
    );

    const getIcon = (url) => {
        if (url.includes('instagram.com')) return <Instagram className="w-5 h-5" />;
        if (url.includes('facebook.com')) return <Facebook className="w-5 h-5" />;
        if (url.includes('wa.me') || url.includes('whatsapp.com')) return <MessageCircle className="w-5 h-5" />;
        if (url.includes('twitter.com') || url.includes('x.com')) return <Twitter className="w-5 h-5" />;
        return <Globe className="w-5 h-5" />;
    };

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const profileImg = page.profileImageUrl ? (page.profileImageUrl.startsWith('http') ? page.profileImageUrl : `${apiBase}${page.profileImageUrl}`) : null;
    const backgroundImg = page.backgroundImageUrl ? (page.backgroundImageUrl.startsWith('http') ? page.backgroundImageUrl : `${apiBase}${page.backgroundImageUrl}`) : null;

    return (
        <div
            className="min-h-screen font-sans flex flex-col items-center py-16 px-6 relative overflow-x-hidden transition-colors duration-500"
            style={{
                backgroundColor: page.backgroundColor || '#0a0a0a',
                color: page.textColor || '#ffffff'
            }}
        >
            {/* Background Image with animated gradient overlay */}
            {backgroundImg && (
                <div
                    className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                </div>
            )}

            <div className="z-10 w-full max-w-[440px] flex flex-col items-center">
                {/* Profile Section */}
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-2xl animate-in zoom-in duration-700">
                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden border-2 border-black/10">
                            {profileImg ? (
                                <img src={profileImg} alt={page.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black uppercase text-white tracking-widest">
                                    {page.title ? page.title[0] : slug[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-3xl font-black tracking-tight mb-2 drop-shadow-md">
                        {page.title || `@${slug}`}
                    </h1>
                    {page.description && (
                        <p className="text-sm font-medium opacity-90 leading-relaxed max-w-[280px] mx-auto drop-shadow">
                            {page.description}
                        </p>
                    )}
                </div>

                {/* Links Section */}
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {page.links && page.links.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center w-full p-4  bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden"
                            style={{
                                color: page.textColor || '#ffffff'
                            }}
                        >
                            {/* Hover effect light */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

                            <div className="flex items-center space-x-4 relative z-10 w-full">
                                <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors shadow-inner">
                                    {getIcon(link.url)}
                                </div>
                                <span className="font-bold text-sm tracking-wide flex-1 text-center pr-10">
                                    {link.title}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Simplified Footer */}
                <div className="mt-20 py-4 opacity-40 hover:opacity-100 transition-opacity flex flex-col items-center space-y-1 animate-in fade-in duration-1000 delay-500">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">Powered by</span>
                    <span className="text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                        ISOCIALMIDIA
                    </span>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
