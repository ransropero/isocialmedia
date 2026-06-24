'use client';

import { useEffect, useState, useRef } from 'react';
import { getShortLinks, createShortLink, deleteShortLink, updateShortLink } from '@/services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Plus, Trash2, Edit3, BarChart3, QrCode, Copy, Check, ExternalLink, Calendar, AlertCircle, Info } from 'lucide-react';
import ShortLinkAnalytics from './ShortLinkAnalytics';

export default function ShortenerModule({ user, onShowPlans }) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modais e Estados
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);
    const [analyticsLink, setAnalyticsLink] = useState(null);
    
    // Formulário
    const [originalUrl, setOriginalUrl] = useState('');
    const [title, setTitle] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    
    // Alertas/Feedbacks
    const [copiedId, setCopiedId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const qrRefs = useRef({});

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const res = await getShortLinks();
            setLinks(res.data);
        } catch (err) {
            console.error('Erro ao buscar links:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obter limites de acordo com o plano
    const getPlanLimits = () => {
        switch (user?.plan) {
            case 'pro': return { max: 50, name: 'Pro' };
            case 'growth': return { max: 10, name: 'Growth' };
            default: return { max: 3, name: 'Gratuito' };
        }
    };

    const limits = getPlanLimits();
    const canCreate = links.length < limits.max;

    // Ações de criação/edição/deleção
    const handleCreate = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setActionLoading(true);
        try {
            const payload = {
                originalUrl,
                title,
                customCode: customCode || undefined,
                expiresAt: expiresAt || null
            };
            const res = await createShortLink(payload);
            setLinks([res.data, ...links]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Erro ao criar o link encurtado.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setActionLoading(true);
        try {
            const payload = {
                originalUrl,
                title,
                expiresAt: expiresAt || null
            };
            const res = await updateShortLink(selectedLink.id, payload);
            setLinks(links.map(l => l.id === selectedLink.id ? res.data : l));
            setShowEditModal(false);
            resetForm();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Erro ao atualizar o link.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este link encurtado?')) return;
        try {
            await deleteShortLink(id);
            setLinks(links.filter(l => l.id !== id));
        } catch (err) {
            console.error('Erro ao deletar link:', err);
            alert('Não foi possível excluir o link.');
        }
    };

    const resetForm = () => {
        setOriginalUrl('');
        setTitle('');
        setCustomCode('');
        setExpiresAt('');
        setSelectedLink(null);
        setErrorMsg('');
    };

    const openEdit = (link) => {
        setSelectedLink(link);
        setOriginalUrl(link.originalUrl);
        setTitle(link.title);
        setExpiresAt(link.expiresAt ? link.expiresAt.substring(0, 10) : '');
        setShowEditModal(true);
    };

    // Copiar Link com Fallback de segurança
    const copyToClipboard = (shortCode, id) => {
        const fullLink = `${window.location.origin}/s/${shortCode}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullLink)
                .then(() => {
                    setCopiedId(id);
                    setTimeout(() => setCopiedId(null), 2000);
                })
                .catch(err => {
                    console.error('Falha ao usar clipboard API:', err);
                    fallbackCopyText(fullLink, id);
                });
        } else {
            fallbackCopyText(fullLink, id);
        }
    };

    const fallbackCopyText = (text, id) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // evitar scroll
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Fallback de cópia falhou:', err);
            alert('Não foi possível copiar o link automaticamente. Copie manualmente: ' + text);
        }
    };

    // Download QR Code
    const downloadQRCode = (shortCode) => {
        const svgElement = document.getElementById(`qr-${shortCode}`);
        if (!svgElement) return;

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, 512, 512);
            context.drawImage(image, 0, 0, 512, 512);
            
            const png = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = png;
            downloadLink.download = `qrcode-${shortCode}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        image.src = blobURL;
    };

    if (analyticsLink) {
        return (
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in duration-300">
                <ShortLinkAnalytics link={analyticsLink} onClose={() => setAnalyticsLink(null)} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header com Progresso */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[32px]">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Encurtador de Links</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Crie links amigáveis e acompanhe as métricas de conversão de cliques em tempo real.</p>
                    
                    {/* Barra de Progresso do Limite de Links */}
                    <div className="pt-2 space-y-1 max-w-[300px]">
                        <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase">
                            <span>Uso do Plano ({limits.name})</span>
                            <span>{links.length} de {limits.max}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min((links.length / limits.max) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (!canCreate) {
                            onShowPlans();
                        } else {
                            resetForm();
                            setShowCreateModal(true);
                        }
                    }}
                    className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 cursor-pointer ${
                        canCreate 
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                    }`}
                >
                    {canCreate ? (
                        <>
                            <Plus className="w-4 h-4" /> Novo Link
                        </>
                    ) : (
                        'Fazer Upgrade para criar mais'
                    )}
                </button>
            </div>

            {/* Listagem de Links */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : links.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] space-y-4">
                    <QrCode className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nenhum link encurtado ainda</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">Comece criando o seu primeiro link encurtado agora mesmo e baixe o QR Code!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {links.map((link) => {
                        const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                        return (
                            <div 
                                key={link.id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 relative overflow-hidden"
                            >
                                {isExpired && (
                                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-br-2xl">
                                        Expirado
                                    </div>
                                )}
                                
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[250px] md:max-w-[400px]">
                                            {link.title}
                                        </h3>
                                        <span className="text-xs text-zinc-400 font-medium">/s/{link.shortCode}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="truncate max-w-[200px] md:max-w-[300px]">Destino: {link.originalUrl}</span>
                                    </div>
                                    
                                    {link.expiresAt && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                            Expira em: {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    )}
                                </div>

                                {/* QR Code Oculto usado para download */}
                                <div className="hidden">
                                    <QRCodeSVG
                                        id={`qr-${link.shortCode}`}
                                        value={`${window.location.origin}/s/${link.shortCode}`}
                                        size={256}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>

                                {/* Ações de cada Link */}
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-100 dark:border-zinc-800 pt-3 md:pt-0">
                                    <button
                                        onClick={() => copyToClipboard(link.shortCode, link.id)}
                                        className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition-all relative flex items-center justify-center"
                                        title="Copiar Link"
                                    >
                                        {copiedId === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={() => downloadQRCode(link.shortCode)}
                                        className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition-all flex items-center justify-center"
                                        title="Baixar QR Code"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setAnalyticsLink(link)}
                                        className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition-all flex items-center justify-center"
                                        title="Métricas"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => openEdit(link)}
                                        className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition-all flex items-center justify-center"
                                        title="Editar Link"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="p-3 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 text-red-500 rounded-xl transition-all flex items-center justify-center"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL: CRIAR LINK */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[500px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Novo Link Encurtado</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Gere links amigáveis.</p>
                            </div>

                            {errorMsg && (
                                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Título / Identificação</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ex: Campanha de Vendas de Inverno"
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Original / Destino</label>
                                    <input 
                                        type="url" 
                                        required
                                        placeholder="https://suacampanhadesucesso.com.br"
                                        value={originalUrl} 
                                        onChange={(e) => setOriginalUrl(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Código Customizado (Opcional)</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 bg-zinc-100 dark:bg-zinc-800 border-y border-l border-zinc-200 dark:border-zinc-700 rounded-l-2xl text-xs text-zinc-400 font-bold">
                                            /s/
                                        </span>
                                        <input 
                                            type="text" 
                                            placeholder="inverno"
                                            value={customCode} 
                                            onChange={(e) => setCustomCode(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-r-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Data de Expiração</label>
                                        {(user?.plan !== 'pro' && user?.plan !== 'growth') && (
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Info className="w-3 h-3" /> Max 30 dias (Free)
                                            </span>
                                        )}
                                    </div>
                                    <input 
                                        type="date" 
                                        value={expiresAt} 
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="w-1/2 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-2xl font-black text-sm transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={actionLoading}
                                        className="w-1/2 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Link'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: EDITAR LINK */}
            {showEditModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEditModal(false)}></div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[500px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Editar Link Encurtado</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Atualize as informações do seu link.</p>
                            </div>

                            {errorMsg && (
                                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Título / Identificação</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">URL Original / Destino</label>
                                    <input 
                                        type="url" 
                                        required
                                        value={originalUrl} 
                                        onChange={(e) => setOriginalUrl(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Data de Expiração</label>
                                        {(user?.plan !== 'pro' && user?.plan !== 'growth') && (
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Info className="w-3 h-3" /> Max 30 dias (Free)
                                            </span>
                                        )}
                                    </div>
                                    <input 
                                        type="date" 
                                        value={expiresAt} 
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="w-1/2 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-2xl font-black text-sm transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={actionLoading}
                                        className="w-1/2 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
