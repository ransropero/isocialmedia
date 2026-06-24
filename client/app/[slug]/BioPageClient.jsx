'use client';

import { useState, useEffect } from 'react';
import { trackBioClick, trackBioVisit, verifyLinkPassword } from '@/services/api';
import {
    Instagram, Globe, Facebook, MessageCircle, Twitter,
    Youtube, Mail, Linkedin, Play, Lock, AlertTriangle, ChevronRight, X, MessageSquare, AtSign
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [activeMessage, setActiveMessage] = useState(null);

    const images = page.backgroundImages && page.backgroundImages.length > 0
        ? page.backgroundImages
        : (page.backgroundImageUrl ? [page.backgroundImageUrl] : []);

    useEffect(() => {
        if (!page || !page.id || isPreview) return;

        // Detect source
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || urlParams.get('src');
        let source = utmSource || 'direct';

        if (!utmSource) {
            const ref = document.referrer;
            if (ref) {
                if (ref.includes('instagram.com')) source = 'instagram';
                else if (ref.includes('facebook.com')) source = 'facebook';
                else if (ref.includes('whatsapp.com')) source = 'whatsapp';
                else if (ref.includes('twitter.com') || ref.includes('x.com')) source = 'twitter';
                else if (ref.includes('youtube.com')) source = 'youtube';
                else if (ref.includes('linkedin.com')) source = 'linkedin';
                else if (ref.includes('tiktok.com')) source = 'tiktok';
                else if (ref.includes('google.com')) source = 'google';
                else source = 'other';
            }
        }

        // Track visit
        const trackWithMetadata = () => {
            const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const device = isMobileDevice ? 'Mobile' : 'Desktop';

            trackBioVisit(page.id, source, document.referrer, {
                device
            }).catch(console.error);
        };

        trackWithMetadata();
    }, [page?.id, isPreview]);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

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
        if (lowerUrl.includes('message')) return <MessageSquare className="w-5 h-5" />;
        if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <Twitter className="w-5 h-5" />;
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube className="w-5 h-5" />;
        if (lowerUrl.includes('tiktok.com')) return <Play className="w-5 h-5" />;
        if (lowerUrl.includes('threads.net')) return <AtSign className="w-5 h-5" />;
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

        if (link.type === 'message') {
            trackBioClick(page.id, index).catch(console.error);
            setActiveMessage({ title: link.messageTitle, body: link.messageBody });
            setShowMessageModal(true);
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
            threads: `https://threads.net/@${handle.replace('@', '')}`,
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

            {images.length > 0 && images.map((img, idx) => (
                <div
                    key={idx}
                    className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0 bg-cover bg-center transition-opacity duration-1000`}
                    style={{
                        backgroundImage: `url(${img.startsWith('http') ? img : `${apiBase}${img}`})`,
                        opacity: idx === currentImageIndex ? 1 : 0
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                </div>
            ))}

            <div className="z-10 w-full max-w-[440px] flex flex-col items-center animate-in fade-in duration-700">
                {/* Formato da Imagem de Perfil baseada em profileStyle */}
                {(!page.profileStyle || page.profileStyle === 'instagram') && (
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
                )}

                {page.profileStyle === 'large-circle' && (
                    <div className="relative mb-6">
                        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full p-1 border-4 border-white/20 shadow-2xl animate-in zoom-in duration-700">
                            <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden border-2 border-black/10">
                                {profileImg ? (
                                    <img src={profileImg} alt={page.title || 'Profile'} className="w-full h-full object-cover animate-in fade-in duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-black uppercase text-white tracking-widest">
                                        {(page.title && page.title[0]) || (slug && slug[0]) || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {page.profileStyle === 'large-square' && (
                    <div className="relative mb-6">
                        <div className="w-36 h-36 md:w-40 md:h-40 rounded-[32px] p-1 border-4 border-white/20 shadow-2xl animate-in zoom-in duration-700 overflow-hidden">
                            <div className="w-full h-full rounded-[26px] bg-zinc-900 overflow-hidden border-2 border-black/10">
                                {profileImg ? (
                                    <img src={profileImg} alt={page.title || 'Profile'} className="w-full h-full object-cover animate-in fade-in duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-black uppercase text-white tracking-widest">
                                        {(page.title && page.title[0]) || (slug && slug[0]) || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {page.profileStyle === 'full-header' && (
                    <div className="relative mb-6 w-full px-1">
                        <div className="w-full h-[450px] md:h-[550px] rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in duration-700 overflow-hidden relative">
                            {profileImg ? (
                                <img src={profileImg} alt={page.title || 'Profile'} className="w-full h-full object-cover animate-in fade-in duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-black uppercase text-white tracking-widest bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                                    {(page.title && page.title[0]) || (slug && slug[0]) || 'U'}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 pb-8 text-center">
                                <h1
                                    className="text-3xl font-black tracking-tight mb-2 drop-shadow-md"
                                    style={{ color: page.descriptionColor || page.textColor || 'inherit' }}
                                >
                                    {page.title || (slug ? `@${slug}` : '') || 'Sua Página'}
                                </h1>
                                {page.description && (
                                    <p
                                        className="text-sm font-medium opacity-90 leading-relaxed max-w-[340px] mx-auto drop-shadow whitespace-pre-wrap"
                                        style={{ color: page.descriptionColor || page.textColor || 'inherit' }}
                                    >
                                        {page.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {page.profileStyle !== 'full-header' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 mb-10">
                        <h1
                            className="text-3xl font-black tracking-tight mb-2 drop-shadow-md"
                            style={{ color: page.descriptionColor || page.textColor || 'inherit' }}
                        >
                            {page.title || (slug ? `@${slug}` : '') || 'Sua Página'}
                        </h1>
                        {page.description && (
                            <p
                                className="text-sm font-medium opacity-90 leading-relaxed max-w-[280px] mx-auto drop-shadow whitespace-pre-wrap"
                                style={{ color: page.descriptionColor || page.textColor || 'inherit' }}
                            >
                                {page.description}
                            </p>
                        )}
                    </div>
                )}

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
                                                    platform === 'threads' ? <AtSign className="w-6 h-6" /> :
                                                        platform === 'linkedin' ? <Linkedin className="w-6 h-6" /> :
                                                            platform === 'email' ? <Mail className="w-6 h-6" /> : <Globe className="w-6 h-6" />;

                            return (
                                <a
                                    key={platform}
                                    href={getSocialLink(platform, handle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-90 hover:opacity-100 hover:scale-125 transition-all duration-300 transform drop-shadow-md"
                                    style={{
                                        color: page.descriptionColor || page.textColor || 'inherit'
                                    }}
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
                        
                        // Determinar o estilo da imagem: Legado 'banner' se for Pro, caso contrário o selecionado pelo usuário ou padrão thumbnail
                        const imageStyle = link.imageStyle || (isPro && linkImage ? 'banner' : 'thumbnail');
                        const showBanner = linkImage && imageStyle === 'banner';
                        const showLarge = linkImage && imageStyle === 'large';
                        const showThumbnail = linkImage && imageStyle === 'thumbnail';
                        
                        const hasTitle = !!link.title;

                        return (
                            <button
                                key={index}
                                onClick={() => handleLinkClick(index, link)}
                                className={`group relative w-full transition-all duration-300 transform hover:scale-[1.02] overflow-hidden rounded-2xl border ${page.buttonsTransparent ? 'border-white/20' : 'border-white/10'} ${showBanner ? 'h-48' : (showLarge ? 'h-28' : 'p-4')}`}
                                style={{
                                    backgroundColor: showBanner ? 'transparent' : (page.buttonsTransparent ? 'transparent' : (page.buttonColor || 'rgba(255,255,255,0.05)')),
                                    color: page.textColor || '#ffffff'
                                }}
                            >
                                {/* Banner de Fundo Inteiro */}
                                {showBanner && (
                                    <div className="absolute inset-0 z-0">
                                        <img src={linkImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

                                {showLarge ? (
                                    /* Layout de Destaque Lateral Esquerdo Grande */
                                    <div className="flex h-full w-full items-center relative z-10 text-left">
                                        <div className="w-[40%] h-full flex-shrink-0 overflow-hidden relative">
                                            <img src={linkImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        </div>
                                        {hasTitle ? (
                                            <div className="flex-1 px-5 py-2 flex flex-col justify-center">
                                                <span className="font-bold text-base tracking-wide flex items-center gap-2 drop-shadow-lg leading-snug whitespace-pre-wrap">
                                                    <span>{link.title}</span>
                                                    {link.requireAge && <Lock className="w-3.5 h-3.5 opacity-50 flex-shrink-0" style={{ color: page.textColor || '#ffffff' }} />}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex-1 px-5 py-2 flex items-center justify-end">
                                                <ChevronRight className="w-6 h-6 opacity-45 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        )}
                                        {link.isPasswordProtected && <Lock className="w-3.5 h-3.5 opacity-50 absolute right-4 bottom-4" />}
                                    </div>
                                ) : (
                                    /* Layout Padrão / Miniatura / Sem Imagem */
                                    <div className={`flex items-center space-x-4 relative z-10 w-full text-left h-full ${showBanner ? 'items-end p-6' : ''}`}>
                                        {showThumbnail && (
                                            /* Miniatura maior w-16 h-16 com borda fina e sombra */
                                            <div className="p-0 bg-black/15 rounded-2xl group-hover:bg-black/25 transition-colors shadow-inner w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
                                                <img src={linkImage} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                        {!linkImage && (
                                            <div className="p-0 bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors shadow-inner w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {getIcon(link.url || (link.isPasswordProtected ? 'lock' : ''))}
                                            </div>
                                        )}
                                        
                                        {hasTitle && (
                                            <div className={`flex-1 ${showBanner ? '' : (showThumbnail ? 'pl-2 text-left' : 'text-center pr-10')}`}>
                                                <span className={`font-bold text-sm tracking-wide flex items-center gap-2 drop-shadow-lg whitespace-pre-wrap ${showThumbnail ? 'justify-start text-left' : 'justify-center'}`}>
                                                    <span>{link.title}</span>
                                                    {link.requireAge && <Lock className="w-3.5 h-3.5 opacity-50 flex-shrink-0" style={{ color: page.textColor || '#ffffff' }} />}
                                                </span>
                                            </div>
                                        )}

                                        {!hasTitle && showThumbnail && (
                                            /* Se for miniatura sem título, centralizar a miniatura de forma bonita */
                                            <div className="flex-1 flex justify-center py-1">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                                                    <img src={linkImage} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            </div>
                                        )}

                                        {link.isPasswordProtected && <Lock className="w-3.5 h-3.5 opacity-50 absolute right-4 bottom-6" />}
                                    </div>
                                )}
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

                {showMessageModal && activeMessage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowMessageModal(false)}></div>
                        <div className="bg-zinc-900 border border-white/10 rounded-[32px] w-full max-w-[400px] p-8 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                                    <MessageSquare className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-black mb-3 text-white leading-tight">
                                    {activeMessage.title || 'Mensagem'}
                                </h2>
                                <div className="w-full max-h-[300px] overflow-y-auto no-scrollbar mb-8">
                                    <p className="text-zinc-400 text-sm md:text-base font-medium whitespace-pre-wrap leading-relaxed">
                                        {activeMessage.body}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl shadow-xl transition-all tracking-wide"
                                >
                                    Fechar
                                </button>
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
