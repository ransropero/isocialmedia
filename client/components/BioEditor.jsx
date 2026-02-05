'use client';

import { useState, useEffect } from 'react';
import { getMyBioPages, createBioPage, updateBioPage, deleteBioPage, uploadBioImage } from '@/services/api';
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Loader2, Save, Link as LinkIcon } from 'lucide-react';

export default function BioEditor() {
    const [bioPage, setBioPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [links, setLinks] = useState([{ title: '', url: '' }]);
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#ffffff');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

    useEffect(() => {
        fetchBioPage();
    }, []);

    const fetchBioPage = async () => {
        try {
            const response = await getMyBioPages();
            if (response.data && response.data.length > 0) {
                const page = response.data[0];
                setBioPage(page);
                setSlug(page.slug);
                setTitle(page.title || '');
                setDescription(page.description || '');
                setLinks(page.links && page.links.length > 0 ? page.links : [{ title: '', url: '' }]);
                setBackgroundColor(page.backgroundColor || '#000000');
                setTextColor(page.textColor || '#ffffff');
                setProfileImageUrl(page.profileImageUrl || '');
                setBackgroundImageUrl(page.backgroundImageUrl || '');
            }
        } catch (err) {
            console.error('Error fetching bio page:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = () => {
        if (links.length >= 5) {
            setError('Máximo de 5 links permitidos.');
            return;
        }
        setLinks([...links, { title: '', url: '' }]);
    };

    const handleRemoveLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks.length > 0 ? newLinks : [{ title: '', url: '' }]);
    };

    const handleLinkChange = (index, field, value) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setSaving(true);
            const response = await uploadBioImage(formData);
            if (type === 'profile') setProfileImageUrl(response.data.url);
            else setBackgroundImageUrl(response.data.url);
        } catch (err) {
            setError('Falha no upload da imagem.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const data = {
            slug,
            title,
            description,
            links: links.filter(l => l.title && l.url),
            backgroundColor,
            textColor,
            profileImageUrl,
            backgroundImageUrl
        };

        try {
            if (bioPage) {
                await updateBioPage(bioPage.id, data);
            } else {
                await createBioPage(data);
            }
            setSuccess('Página de links salva com sucesso!');
            fetchBioPage();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao salvar página.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <LinkIcon className="w-5 h-5 text-purple-500" />
                        iSocialMidia Links
                    </h2>
                    <p className="text-sm text-zinc-500">Sua página personalizada para bio</p>
                </div>
                {slug && (
                    <a
                        href={`/${slug}`}
                        target="_blank"
                        className="text-purple-500 hover:text-purple-600 flex items-center text-sm font-medium transition-colors"
                    >
                        Ver página <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slug da URL</label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-lg text-sm text-zinc-500 font-mono">/</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="flex-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-zinc-900 dark:text-zinc-100"
                                placeholder="boxsportsan"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Título da Página</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-zinc-900 dark:text-zinc-100"
                            placeholder="Nome ou Título"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição (Bio)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 h-20 text-zinc-900 dark:text-zinc-100"
                        placeholder="Conte um pouco sobre você..."
                    />
                </div>

                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Foto de Perfil / Logo</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl.startsWith('http') ? profileImageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${profileImageUrl}`}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                                )}
                            </div>
                            <label className="flex-1 flex items-center justify-center p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Alterar Foto</span>
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} accept="image/*" />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Imagem de Fundo</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {backgroundImageUrl ? (
                                    <img
                                        src={backgroundImageUrl.startsWith('http') ? backgroundImageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${backgroundImageUrl}`}
                                        className="w-full h-full object-cover"
                                        alt="Background"
                                    />
                                ) : (
                                    <Plus className="w-5 h-5 text-zinc-400" />
                                )}
                            </div>
                            <label className="flex-1 flex items-center justify-center p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Escolher Fundo</span>
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'background')} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cor de Fundo</label>
                        <div className="flex items-center space-x-2 p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 w-fit">
                            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer border-none bg-transparent" />
                            <span className="text-xs font-mono pr-2 text-zinc-500 uppercase">{backgroundColor}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cor do Texto</label>
                        <div className="flex items-center space-x-2 p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 w-fit">
                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer border-none bg-transparent" />
                            <span className="text-xs font-mono pr-2 text-zinc-500 uppercase">{textColor}</span>
                        </div>
                    </div>
                </div>

                {/* Links Section */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Links (Máximo 5)</label>
                        <button
                            type="button"
                            onClick={handleAddLink}
                            disabled={links.length >= 5}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-all hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {links.map((link, index) => (
                            <div key={index} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col space-y-2 relative group">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLink(index)}
                                    className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <input
                                    type="text"
                                    value={link.title}
                                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-zinc-900 dark:text-zinc-100"
                                    placeholder="Título (ex: Meu WhatsApp)"
                                />
                                <input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-zinc-900 dark:text-zinc-100"
                                    placeholder="URL (https://wa.me/...)"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">{error}</p>}
                {success && <p className="text-xs text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/20">{success}</p>}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {bioPage ? 'Salvar Alterações' : 'Criar minha Página de Bio'}
                </button>
            </form>
        </div>
    );
}
