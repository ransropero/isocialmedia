'use client';

import { useState } from 'react';
import { trackBioClick, verifyLinkPassword } from '@/services/api';
import {
    Instagram, Globe, Facebook, MessageCircle, Twitter,
    Youtube, Mail, Linkedin, Play, Lock, AlertTriangle, ChevronRight, X
} from 'lucide-react';

export default function BioPageClient({ page, slug, apiBase, isPreview = false }) {
    // Modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAgeModal, setShowAgeModal] = useState(false);
    const [pendingLink, setPendingLink] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [modalError, setModalError] = useState('');
    const [dontShowAgeAgain, setDontShowAgeAgain] = useState(false);

    const fonts = [
        { name: 'Inter', family: "'Inter', sans-serif" },
        { name: 'Roboto', family: "'Roboto', sans-serif" },
        { name: 'Outfit', family: "'Outfit', sans-serif" }
    ];

    const getIcon = (url, useGeneric = true) => {
        if (!url) return <Globe className="w-5 h-5" />;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('instagram.com')) return <Instagram className="w-5 h-5" />;
        if (lowerUrl.includes('facebook.com')) return <Facebook className="w-5 h-5" />;
        if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com')) return <MessageCircle className="w-5 h-5" />;
        if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <Twitter className="w-5 h-5" />;
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube className="w-5 h-5" />;
        if (lowerUrl.includes('tiktok.com')) return <Play className="w-5 h-5" />;
        if (lowerUrl.includes('linkedin.com')) return <Linkedin className="w-5 h-5" />;
        if (lowerUrl.includes('google.com/maps') || lowerUrl.includes('maps.app') || lowerUrl.includes('waze.com')) return <Globe className="w-5 h-5" />;
        return useGeneric ? <Globe className="w-5 h-5" /> : null;
    };

    const handleLinkClick = async (index, link) => {
        if (!page || !page.id) return;
        if (isPreview) return; // Disable clicks in preview

        if (link.requireAge) {
            if (localStorage.getItem('hideAgeWarning') === 'true') {
                if (link.isPasswordProtected) {
                    setPendingLink({ index, ...link });
                    setShowPasswordModal(true);
                } else {
                    trackBioClick(page.id, index).catch(console.error);
                    if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer');
                }
                return;
            }
            setPendingLink({ index, ...link });
            setShowAgeModal(true);
            return;
        }

        if (link.isPasswordProtected) {
            setPendingLink({ index, ...link });
            setShowPasswordModal(true);
            return;
        }

        trackBioClick(page.id, index).catch(console.error);
        if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer');
    };

    const handleVerifyPassword = async () => {
        if (!passwordInput) return;
        setVerifying(true);
        setModalError('');
        try {
            const response = await verifyLinkPassword(page.id, pendingLink.index, passwordInput);
            const { url } = response.data;

            trackBioClick(page.id, pendingLink.index).catch(console.error);
            window.open(url, '_blank', 'noopener,noreferrer');
            setShowPasswordModal(false);
            setPasswordInput('');
            setPendingLink(null);
        } catch (err) {
            setModalError('Senha incorreta. Tente novamente.');
        } finally {
            setVerifying(false);
        }
    };

    const handleAgeConfirm = () => {
        if (dontShowAgeAgain) {
            localStorage.setItem('hideAgeWarning', 'true');
        }
        setShowAgeModal(false);
        if (pendingLink.isPasswordProtected) {
            setShowPasswordModal(true);
        } else {
            trackBioClick(page.id, pendingLink.index).catch(console.error);
            if (pendingLink.url) window.open(pendingLink.url, '_blank', 'noopener,noreferrer');
            setPendingLink(null);
        }
    };

    const getSocialLink = (platform, handle) => {
        if (!handle) return null;
        if (typeof handle !== 'string') return null;
        if (handle.startsWith('http')) return handle;

        const maps = {
            instagram: `https://instagram.com/${handle.replace('@', '')}`,
            facebook: `https://facebook.com/${handle}`,
            whatsapp: `https://wa.me/${handle.replace(/\D/g, '')}`,
            twitter: `https://twitter.com/${handle.replace('@', '')}`,
            youtube: handle.includes('/') ? handle : `https://youtube.com/@${handle.replace('@', '')}`,
            tiktok: `https://tiktok.com/@${handle.replace('@', '')}`,
            linkedin: handle.includes('/') ? handle : `https://linkedin.com/in/${handle}`,
            email: `mailto:${handle}`
        };
        return maps[platform] || handle;
    };

    const profileImg = page.profileImageUrl ? (page.profileImageUrl.startsWith('http') ? page.profileImageUrl : `${apiBase}${page.profileImageUrl}`) : null;
    const backgroundImg = page.backgroundImageUrl ? (page.backgroundImageUrl.startsWith('http') ? page.backgroundImageUrl : `${apiBase}${page.backgroundImageUrl}`) : null;

    const selectedFont = fonts.find(f => f.name === page.fontFamily)?.family || "'Inter', sans-serif";

    return (
        <div
            className={`${isPreview ? 'min-h-full' : 'min-h-screen'} flex flex-col items-center py-16 px-6 relative overflow-x-hidden transition-colors duration-500`}
            style={{
                backgroundColor: page.backgroundColor || '#0a0a0a',
                color: page.textColor || '#ffffff',
                fontFamily: selectedFont
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />

            {backgroundImg && (
                <div
                    className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 bg-cover bg-center transition-opacity duration-1000`}
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                </div>
            )}

            <div className="z-10 w-full max-w-[440px] flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-2xl animate-in zoom-in duration-700">
                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden border-2 border-black/10">
                            {profileImg ? (
                                <img src={profileImg} alt={page.title || 'Profile'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black uppercase text-white tracking-widest">
                                    {(page.title && page.title[0]) || (slug && slug[0]) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-3xl font-black tracking-tight mb-2 drop-shadow-md">
                        {page.title || (slug ? `@${slug}` : '') || 'Sua Página'}
                    </h1>
                    {page.description && (
                        <p className="text-sm font-medium opacity-90 leading-relaxed max-w-[280px] mx-auto drop-shadow whitespace-pre-wrap">
                            {page.description}
                        </p>
                    )}
                </div>

                {page.socials && Object.values(page.socials).some(v => v) && (
                    <div className="flex flex-wrap justify-center gap-5 mb-10 w-full animate-in fade-in zoom-in duration-700 delay-200">
                        {Object.entries(page.socials).map(([platform, handle]) => {
                            if (!handle) return null;
                            const icon = platform === 'instagram' ? <Instagram className="w-6 h-6" /> :
                                platform === 'facebook' ? <Facebook className="w-6 h-6" /> :
                                    platform === 'whatsapp' ? <MessageCircle className="w-6 h-6" /> :
                                        platform === 'twitter' ? <Twitter className="w-6 h-6" /> :
                                            platform === 'youtube' ? <Youtube className="w-6 h-6" /> :
                                                platform === 'tiktok' ? <Play className="w-6 h-6" /> :
                                                    platform === 'linkedin' ? <Linkedin className="w-6 h-6" /> :
                                                        platform === 'email' ? <Mail className="w-6 h-6" /> : <Globe className="w-6 h-6" />;

                            return (
                                <a
                                    key={platform}
                                    href={getSocialLink(platform, handle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-80 hover:opacity-100 hover:scale-125 transition-all duration-300 transform drop-shadow-lg"
                                >
                                    {icon}
                                </a>
                            );
                        })}
                    </div>
                )}

                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {page.links && page.links.map((link, index) => {
                        const userPlan = page.userPlan || page.plan || 'start';
                        const isPro = userPlan === 'pro';
                        const linkImage = link.image ? (link.image.startsWith('http') ? link.image : `${apiBase}${link.image.startsWith('/') ? '' : '/'}${link.image}`) : null;
                        const showFullCard = isPro && linkImage;
                        const showIcon = !isPro && linkImage;

                        return (
                            <button
                                key={index}
                                onClick={() => handleLinkClick(index, link)}
                                className={`group relative w-full transition-all duration-300 transform hover:scale-[1.02] overflow-hidden rounded-2xl border border-white/10 ${showFullCard ? 'h-48' : 'p-4'}`}
                                style={{
                                    backgroundColor: showFullCard ? 'transparent' : (page.buttonColor || 'rgba(255,255,255,0.05)'),
                                    color: page.textColor || '#ffffff'
                                }}
                            >
                                {showFullCard && (
                                    <div className="absolute inset-0 z-0">
                                        <img src={linkImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

                                <div className={`flex items-center space-x-4 relative z-10 w-full text-left h-full ${showFullCard ? 'items-end p-6' : ''}`}>
                                    {showIcon && (
                                        <div className="p-0 bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors shadow-inner w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            <img src={linkImage} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    )}
                                    {!linkImage && (
                                        <div className="p-0 bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors shadow-inner w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {getIcon(link.url || (link.isPasswordProtected ? 'lock' : ''))}
                                        </div>
                                    )}
                                    <div className={`flex-1 ${showFullCard ? '' : 'text-center pr-10'}`}>
                                        <span className="font-bold text-sm tracking-wide flex items-center justify-center gap-2 drop-shadow-lg">
                                            {link.title}
                                            {link.requireAge && <Lock className="w-3.5 h-3.5 opacity-50" style={{ color: page.textColor || '#ffffff' }} />}
                                        </span>
                                    </div>
                                    {link.isPasswordProtected && <Lock className="w-3.5 h-3.5 opacity-50 absolute right-4 bottom-6" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPasswordModal(false)}></div>
                        <div className="bg-zinc-900 border border-white/10 rounded-[32px] w-full max-w-[360px] p-8 relative z-10 animate-in zoom-in-95 duration-300">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                                    <Lock className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-black mb-2">Link Protegido</h2>
                                <p className="text-zinc-400 text-sm mb-6">Este link requer uma senha para ser acessado.</p>

                                <input
                                    type="password"
                                    autoFocus
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                                    placeholder="Digite a senha..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />

                                {modalError && <p className="text-red-400 text-xs font-bold mb-4">{modalError}</p>}

                                <button
                                    onClick={handleVerifyPassword}
                                    disabled={verifying || !passwordInput}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {verifying ? 'Verificando...' : 'Acessar Link'}
                                    {!verifying && <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAgeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAgeModal(false)}></div>
                        <div className="bg-white border hover:border-zinc-200 rounded-[32px] w-full max-w-[440px] p-10 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                            <button
                                onClick={() => setShowAgeModal(false)}
                                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <h2 className="text-xl md:text-2xl font-black mb-3 text-zinc-900 leading-tight">Aviso de conteúdo para maiores de 18 anos</h2>
                                <p className="text-zinc-500 text-sm md:text-base font-medium mb-10 max-w-[320px]">Este link pode conter conteúdo inadequado para todos os públicos.</p>

                                <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => setDontShowAgeAgain(!dontShowAgeAgain)}>
                                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${dontShowAgeAgain ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                                        {dontShowAgeAgain && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-600 select-none">Não mostrar este aviso novamente</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <button
                                        onClick={() => setShowAgeModal(false)}
                                        className="py-4 px-6 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold rounded-2xl transition-all"
                                    >
                                        Deixa para lá
                                    </button>
                                    <button
                                        onClick={handleAgeConfirm}
                                        className="py-4 px-6 bg-black hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-xl shadow-black/10 transition-all tracking-wide"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {page.showLogo !== false && (
                    <a
                        href="https://isocialmedia.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-20 py-4 opacity-40 hover:opacity-100 transition-opacity flex flex-col items-center space-y-1 animate-in fade-in duration-1000 delay-500 cursor-pointer"
                    >
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">Powered by</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-sm overflow-hidden bg-white/20 p-0.5">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs font-black tracking-widest text-[#666]">
                                iSocialM
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">i</span>
                                di
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">a</span>
                            </span>
                        </div>
                    </a>
                )}
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
