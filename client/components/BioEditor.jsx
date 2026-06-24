'use client';

import { useState, useEffect } from 'react';
import { getMyBioPages, createBioPage, updateBioPage, deleteBioPage, uploadBioImage, importLinktree as importLinktreeApi } from '@/services/api';
import {
    Plus, Trash2, ExternalLink, Image as ImageIcon, Loader2,
    Save, Link as LinkIcon, Smartphone, Palette, Layout,
    Type, CalendarClock, ChevronDown, Check, AlertCircle, Layers,
    Instagram, Facebook, Twitter, Youtube, Mail, MessageCircle, Linkedin, Play,
    QrCode, Download, X, GripVertical, MessageSquare, Globe, AtSign
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BioPageClient from '../app/[slug]/BioPageClient';

function SortableItem({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            {typeof children === 'function' ? children({ attributes, listeners }) : children}
        </div>
    );
}

export default function BioEditor({ onShowPlans, user }) {
    const [bioPages, setBioPages] = useState([]);
    const [selectedPageId, setSelectedPageId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [successTimeout, setSuccessTimeout] = useState(null);
    const [showNewPageForm, setShowNewPageForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Form state
    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [links, setLinks] = useState([{ title: '', url: '', scheduleStart: '', scheduleEnd: '', password: '', requireAge: false }]);
    const [socials, setSocials] = useState({
        instagram: '',
        facebook: '',
        whatsapp: '',
        twitter: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
        threads: '',
        email: ''
    });
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#ffffff');
    const [descriptionColor, setDescriptionColor] = useState('#ffffff');
    const [buttonColor, setButtonColor] = useState('#6366f1');
    const [buttonsTransparent, setButtonsTransparent] = useState(false);
    const [fontFamily, setFontFamily] = useState('Inter');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
    const [profileStyle, setProfileStyle] = useState('instagram');
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [showLogo, setShowLogo] = useState(true);
    const [userPlan, setUserPlan] = useState('trial');
    const [linktreeUrl, setLinktreeUrl] = useState('');
    const [importing, setImporting] = useState(false);

    const fonts = [
        { name: 'Inter', family: "'Inter', sans-serif" },
        { name: 'Roboto', family: "'Roboto', sans-serif" },
        { name: 'Outfit', family: "'Outfit', sans-serif" }
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (user?.plan) {
            setUserPlan(user.plan);
        }
    }, [user]);

    useEffect(() => {
        fetchBioPages();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUserPlan(JSON.parse(storedUser).plan || 'trial');
            } catch (e) {
                console.error('Error parsing user plan', e);
            }
        }
    }, []);

    useEffect(() => {
        if (success) {
            if (successTimeout) clearTimeout(successTimeout);
            const timeout = setTimeout(() => {
                setSuccess('');
            }, 3000);
            setSuccessTimeout(timeout);
        }
        return () => {
            if (successTimeout) clearTimeout(successTimeout);
        };
    }, [success]);

    const fetchBioPages = async (selectId = null) => {
        try {
            setLoading(true);
            const response = await getMyBioPages();
            const pages = response.data || [];
            setBioPages(pages);

            if (pages.length > 0) {
                const targetPage = selectId
                    ? pages.find(p => p.id === selectId) || pages[0]
                    : pages[0];
                loadPageData(targetPage);
            } else {
                setSelectedPageId(null);
                resetForm();
            }
        } catch (err) {
            console.error('Error fetching bio pages:', err);
            setError('Falha ao carregar páginas.');
        } finally {
            setLoading(false);
        }
    };

    const loadPageData = (page) => {
        setSelectedPageId(page.id);
        setSlug(page.slug);
        setTitle(page.title || '');
        setDescription(page.description || '');
        setLinks(page.links && page.links.length > 0 ? page.links : [{ title: '', url: '', scheduleStart: '', scheduleEnd: '', password: '', requireAge: false }]);
        setSocials(page.socials || {
            instagram: '',
            facebook: '',
            whatsapp: '',
            twitter: '',
            youtube: '',
            tiktok: '',
            linkedin: '',
            threads: '',
            email: ''
        });
        setBackgroundColor(page.backgroundColor || '#000000');
        setTextColor(page.textColor || '#ffffff');
        setDescriptionColor(page.descriptionColor || page.textColor || '#ffffff');
        setButtonColor(page.buttonColor || '#6366f1');
        setButtonsTransparent(page.buttonsTransparent || false);
        setFontFamily(page.fontFamily || 'Inter');
        setProfileImageUrl(page.profileImageUrl || '');
        setBackgroundImageUrl(page.backgroundImageUrl || '');
        setProfileStyle(page.profileStyle || 'instagram');
        setBackgroundImages(page.backgroundImages || []);
        setShowLogo(page.showLogo !== undefined ? page.showLogo : true);
        setShowNewPageForm(false);
    };

    const resetForm = () => {
        setSlug('');
        setTitle('');
        setDescription('');
        setLinks([{ title: '', url: '', scheduleStart: '', scheduleEnd: '', password: '', requireAge: false }]);
        setSocials({
            instagram: '',
            facebook: '',
            whatsapp: '',
            twitter: '',
            youtube: '',
            tiktok: '',
            linkedin: '',
            threads: '',
            email: ''
        });
        setBackgroundColor('#000000');
        setTextColor('#ffffff');
        setDescriptionColor('#ffffff');
        setButtonColor('#6366f1');
        setButtonsTransparent(false);
        setFontFamily('Inter');
        setProfileImageUrl('');
        setBackgroundImageUrl('');
        setProfileStyle('instagram');
        setBackgroundImages([]);
        setShowLogo(true);
    };

    const handleNewPage = () => {
        const pageLimits = { start: 1, trial: 1, growth: 1, pro: 5 };
        const currentLimit = pageLimits[userPlan] || 1;

        if (bioPages.length >= currentLimit) {
            setError(`Seu plano permite apenas ${currentLimit} página(s).`);
            onShowPlans();
            return;
        }
        setSelectedPageId(null);
        resetForm();
        setShowNewPageForm(true);
    };

    const handleSelectPage = (id) => {
        const page = bioPages.find(p => p.id === id);
        if (page) loadPageData(page);
    };

    const handleLinktreeImport = async () => {
        if (!linktreeUrl || !linktreeUrl.includes('linktr.ee')) {
            setError('Por favor, insira um URL válido do Linktree.');
            return;
        }

        setImporting(true);
        setError('');
        try {
            const response = await importLinktreeApi(linktreeUrl);
            const data = response.data;

            if (data.name) setTitle(data.name);
            if (data.username) setSlug(data.username);
            if (data.bio) setDescription(data.bio);
            if (data.profileImageUrl) setProfileImageUrl(data.profileImageUrl);
            if (data.links && data.links.length > 0) {
                // Prepend imported links to current links, or replace if current is empty/default
                const filteredLinks = data.links.map(l => ({
                    ...l,
                    scheduleStart: '',
                    scheduleEnd: '',
                    password: '',
                    requireAge: false
                }));

                setLinks(prev => {
                    const isDefault = prev.length === 1 && !prev[0].title && !prev[0].url;
                    return isDefault ? filteredLinks : [...filteredLinks, ...prev];
                });
            }
            setSuccess('Dados importados com sucesso do Linktree!');
            setLinktreeUrl('');
        } catch (err) {
            console.error('Import error:', err);
            setError(err.response?.data?.message || 'Falha ao importar do Linktree. Verifique o URL.');
        } finally {
            setImporting(false);
        }
    };

    const handleAddLink = () => {
        const linkLimits = { start: 5, trial: 10, growth: 10, pro: 20 };
        const currentLimit = linkLimits[userPlan] || 5;

        if (links.length >= currentLimit) {
            setError(`O plano ${userPlan.toUpperCase()} permite até ${currentLimit} links.`);
            onShowPlans();
            return;
        }
        setLinks([...links, { title: '', url: '', type: 'url', messageTitle: '', messageBody: '', phone: '', whatsappMessage: '', address: '', scheduleStart: '', scheduleEnd: '', password: '', requireAge: false }]);
    };

    const handleRemoveLink = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks.length > 0 ? newLinks : [{ title: '', url: '', type: 'url', messageTitle: '', messageBody: '', phone: '', whatsappMessage: '', address: '', scheduleStart: '', scheduleEnd: '', password: '', requireAge: false }]);
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
        formData.append('slug', slug);

        try {
            setSaving(true);
            const response = await uploadBioImage(formData);
            if (type === 'profile') setProfileImageUrl(response.data.url);
            else if (type === 'background') setBackgroundImageUrl(response.data.url);
            else if (type === 'carousel') {
                if (backgroundImages.length >= 5) {
                    setError('Máximo de 5 imagens no carrossel.');
                    return;
                }
                setBackgroundImages([...backgroundImages, response.data.url]);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Falha no upload da imagem.');
        } finally {
            setSaving(false);
        }
    };

    const handleMapsHelper = (index) => {
        const address = prompt('Digite o endereço (Rua, Número, Cidade):');
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            handleLinkChange(index, 'url', mapsUrl);
            if (!links[index].title) {
                handleLinkChange(index, 'title', 'Ver no Google Maps');
            }
        }
    };

    const handleWhatsAppToggle = (index) => {
        const link = links[index];
        const isWhatsApp = link.url?.includes('whatsapp.com') || link.url?.includes('wa.me');

        const newLinks = [...links];
        if (isWhatsApp) {
            // Desmarcar: limpar dados de WhatsApp
            newLinks[index] = {
                ...newLinks[index],
                url: '',
                phone: '',
                whatsappMessage: ''
            };
        } else {
            // Marcar: definir URL padrão
            newLinks[index] = {
                ...newLinks[index],
                url: 'https://wa.me/'
            };
        }
        setLinks(newLinks);
    };

    const handleWhatsAppChange = (index, field, value) => {
        const link = links[index];
        const newPhone = field === 'phone' ? value.replace(/\D/g, '') : (link.phone || '');
        const newMessage = field === 'message' ? value : (link.whatsappMessage || '');

        const encodedMessage = encodeURIComponent(newMessage);
        const waUrl = `https://api.whatsapp.com/send/?phone=${newPhone}&text=${encodedMessage}&type=phone_number&app_absent=0`;

        const newLinks = [...links];
        newLinks[index] = {
            ...newLinks[index],
            url: waUrl,
            phone: newPhone,
            whatsappMessage: newMessage
        };
        setLinks(newLinks);
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleLinkImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('image', compressedFile);

            const response = await uploadBioImage(formData);
            handleLinkChange(index, 'image', response.data.url);
        } catch (err) {
            setError('Falha no upload da imagem do link.');
        } finally {
            setSaving(false);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex((_, i) => `link-${i}` === active.id);
                const newIndex = items.findIndex((_, i) => `link-${i}` === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const data = {
            slug,
            title,
            description,
            links: links.filter(l => (l.title || l.image) && (l.url || l.type === 'message' || l.phone || l.address)),
            profileStyle,
            backgroundColor,
            textColor,
            descriptionColor,
            buttonColor,
            buttonsTransparent,
            fontFamily,
            profileImageUrl,
            backgroundImageUrl,
            backgroundImages,
            showLogo,
            socials
        };

        try {
            if (selectedPageId) {
                await updateBioPage(selectedPageId, data);
                setSuccess('Página atualizada com sucesso!');
            } else {
                const response = await createBioPage(data);
                setSuccess('Página criada com sucesso!');
                setSelectedPageId(response.data.id);
            }
            fetchBioPages(selectedPageId || null);
        } catch (err) {
            const apiError = err.response?.data;
            let msg = apiError?.message || 'Erro ao salvar.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPageId) return;

        setDeleting(true);
        try {
            await deleteBioPage(selectedPageId);
            setSuccess('Página excluída.');
            setShowDeleteModal(false);
            fetchBioPages();
        } catch (err) {
            setError('Falha ao excluir página.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] min-h-[800px]">
            {/* Link Font Import for Preview */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />

            {/* Left Panel: Page List and Editor */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Page Selection Dropdown (Premium) */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4 z-20 relative">
                    <div className="flex items-center gap-3 w-full sm:w-auto relative">
                        <div className="relative w-full sm:w-80">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold transition-all text-zinc-800 dark:text-zinc-200 cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-indigo-500" />
                                    {selectedPageId ? (
                                        <span>/{slug}</span>
                                    ) : showNewPageForm ? (
                                        <span className="text-emerald-500">Criando Nova Página...</span>
                                    ) : (
                                        <span className="text-zinc-400">Selecione uma Página</span>
                                    )}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)}></div>
                                    <div className="absolute left-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 overflow-hidden max-h-64 overflow-y-auto animate-fade-in-up">
                                        <div className="p-1.5 space-y-1">
                                            {bioPages.map(page => (
                                                <button
                                                    key={page.id}
                                                    onClick={() => {
                                                        handleSelectPage(page.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-0.5 cursor-pointer ${selectedPageId === page.id
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-300'
                                                        }`}
                                                >
                                                    <span className="font-bold text-sm">/{page.slug}</span>
                                                    {page.title && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{page.title}</span>}
                                                    {page.userEmail && <span className="text-[9px] text-indigo-400 font-mono truncate">Dono: {page.userEmail}</span>}
                                                </button>
                                            ))}
                                            {bioPages.length === 0 && (
                                                <div className="p-4 text-center text-xs text-zinc-400 italic">Nenhuma página criada</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Nova Página Button */}
                        {(() => {
                            const pageLimits = { start: 1, trial: 1, growth: 1, pro: 5 };
                            const currentLimit = pageLimits[userPlan] || 1;
                            return (bioPages.length < currentLimit) && (
                                <button
                                    onClick={handleNewPage}
                                    className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${showNewPageForm
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" /> Nova Página
                                </button>
                            );
                        })()}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col flex-1 overflow-hidden relative">
                    {!selectedPageId && !showNewPageForm ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <Layers className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Crie sua primeira página</h3>
                            <p className="text-zinc-500 text-sm max-w-[280px] mt-2 mb-6">Comece agora criando um link personalizado para sua bio do Instagram.</p>
                            <button
                                onClick={handleNewPage}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                Criar Página
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 backdrop-blur z-10 sticky top-0 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                                        {showNewPageForm ? (
                                            <><Plus className="w-5 h-5 text-emerald-500" /> Nova Página</>
                                        ) : (
                                            <><Palette className="w-5 h-5 text-indigo-500" /> Editor: /{slug}</>
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {showNewPageForm ? 'Defina o link da sua nova página.' : 'Personalize sua página de links.'}
                                        </p>
                                        {slug && !showNewPageForm && (
                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={`/${slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full transition-colors"
                                                >
                                                    Ver Página <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                                <button
                                                    onClick={() => setShowQrModal(true)}
                                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full transition-colors"
                                                    title="Gerar QRCode"
                                                >
                                                    QRCode <QrCode className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedPageId && (
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            disabled={deleting}
                                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Excluir página"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {showNewPageForm ? 'Criar' : 'Salvar'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* Linktree Import Section */}
                                <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[32px] border border-indigo-100 dark:border-indigo-900/20 relative overflow-hidden group/import">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/import:opacity-[0.07] transition-opacity pointer-events-none">
                                        <LinkIcon className="w-32 h-32 rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Importação Mágica</h3>
                                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Traga seus dados do Linktree</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 relative">
                                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={linktreeUrl}
                                                    onChange={(e) => setLinktreeUrl(e.target.value)}
                                                    placeholder="https://linktr.ee/seu-usuario"
                                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                                />
                                            </div>
                                            <button
                                                onClick={handleLinktreeImport}
                                                disabled={importing || !linktreeUrl}
                                                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10"
                                            >
                                                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Importar Agora
                                            </button>
                                        </div>
                                        <p className="mt-3 text-[10px] text-zinc-500 font-medium">
                                            * Iremos importar sua foto, biografia e todos os links ativos automaticamente.
                                        </p>
                                    </div>
                                </div>

                                {/* Basic Info Group */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                        <Layout className="w-3 h-3" /> Configurações de Identidade
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Slug (URL do Link)</label>
                                            <div className="flex items-center">
                                                <span className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-sm text-zinc-500 font-mono">isocialmedia.com/</span>
                                                <input
                                                    type="text"
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                                        if (error) setError('');
                                                    }}
                                                    className="flex-1 p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                                    placeholder="seu-nome"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Título Exibido</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                                placeholder="Como você quer ser chamado?"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Biografia / Descrição Curta</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium h-24 resize-none"
                                            placeholder="Conte um pouco sobre você ou seu negócio (opcional)..."
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>

                                {/* Styling Group */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                        <ImageIcon className="w-3 h-3" /> Estilo & Customização
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Profile Photo */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Foto de Perfil</label>
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 relative group/avatar">
                                                    {profileImageUrl ? (
                                                        <img src={profileImageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <label className="flex-1 flex flex-col justify-center items-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Procurar</span>
                                                    <span className="text-[9px] text-zinc-400">JPG, PNG (Máx 2MB)</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} accept="image/*" />
                                                </label>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Estilo da Foto</label>
                                                <select
                                                    value={profileStyle}
                                                    onChange={(e) => setProfileStyle(e.target.value)}
                                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium cursor-pointer text-zinc-800 dark:text-zinc-200"
                                                >
                                                    <option value="instagram">Padrão Instagram</option>
                                                    <option value="large-circle">Círculo Grande</option>
                                                    <option value="large-square">Quadrado Arredondado</option>
                                                    <option value="full-header">Banner Amplo Destaque</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Main Background Image */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Imagem de Fundo Principal</label>
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 relative group/avatar">
                                                    {backgroundImageUrl ? (
                                                        <img src={backgroundImageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <label className="flex-1 flex flex-col justify-center items-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Procurar</span>
                                                    <span className="text-[9px] text-zinc-400">JPG, PNG (Máx 4MB)</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'background')} accept="image/*" />
                                                </label>
                                                {backgroundImageUrl && (
                                                    <button
                                                        onClick={() => setBackgroundImageUrl('')}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Carousel Background Section (Growth/Pro) */}
                                        <div className={`space-y-3 col-span-full ${(userPlan === 'start' || userPlan === 'trial') ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Carrossel de Fundo (Máx 5)</label>
                                                    {(userPlan === 'start' || userPlan === 'trial') && <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Somente Growth/Pro</span>}
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-400">{backgroundImages.length}/5</span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                {backgroundImages.map((img, idx) => (
                                                    <div key={idx} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative group/carousel">
                                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                                        <button
                                                            onClick={() => setBackgroundImages(backgroundImages.filter((_, i) => i !== idx))}
                                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {backgroundImages.length < 5 && (
                                                    <label className="aspect-square flex flex-col justify-center items-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                        <Plus className="w-5 h-5 text-indigo-600" />
                                                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'carousel')} accept="image/*" />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Typography */}
                                        <div className="space-y-3 col-span-full">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tipografia</label>
                                            <div className="relative">
                                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <select
                                                    value={fontFamily}
                                                    onChange={(e) => setFontFamily(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none"
                                                >
                                                    {fonts.map(f => (
                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Colors Grid */}
                                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cor Fundo</label>
                                                <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-lg">
                                                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                                    <span className="ml-2 text-xs font-mono self-center text-zinc-500">{backgroundColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cor Texto</label>
                                                <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-lg">
                                                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                                    <span className="ml-2 text-xs font-mono self-center text-zinc-500">{textColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cor Botões</label>
                                                <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-lg">
                                                    <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                                    <span className="ml-2 text-xs font-mono self-center text-zinc-500">{buttonColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cor Título & Bio</label>
                                                    {(userPlan === 'start' || userPlan === 'trial') && <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Somente Growth/Pro</span>}
                                                </div>
                                                <div className={`flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1.5 rounded-lg ${(userPlan === 'start' || userPlan === 'trial') ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <input
                                                        type="color"
                                                        value={descriptionColor}
                                                        onChange={(e) => setDescriptionColor(e.target.value)}
                                                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                                                        disabled={userPlan === 'start' || userPlan === 'trial'}
                                                    />
                                                    <span className="ml-2 text-xs font-mono self-center text-zinc-500">{descriptionColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Botões Transparentes</label>
                                                    {(userPlan === 'start' || userPlan === 'trial') && <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Somente Growth/Pro</span>}
                                                </div>
                                                <div className="flex items-center gap-2 h-[44px]">
                                                    <button
                                                        onClick={() => (userPlan !== 'start' && userPlan !== 'trial') && setButtonsTransparent(!buttonsTransparent)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${buttonsTransparent ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                                                            } ${(userPlan === 'start' || userPlan === 'trial') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${buttonsTransparent ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Exibir Logo iSocialMedia</label>
                                                <div className="flex items-center gap-2 h-[44px]">
                                                    <button
                                                        onClick={() => userPlan === 'pro' && setShowLogo(!showLogo)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showLogo ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                                                            } ${userPlan !== 'pro' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showLogo ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                    {userPlan !== 'pro' && <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Somente Pro</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>

                                    {/* Socials Group */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            <Instagram className="w-3 h-3" /> Redes Sociais
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'instagram', icon: <Instagram className="w-4 h-4" />, label: 'Instagram', placeholder: '@usuario' },
                                                { id: 'facebook', icon: <Facebook className="w-4 h-4" />, label: 'Facebook', placeholder: 'link perfil' },
                                                { id: 'whatsapp', icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp', placeholder: 'número com DDD' },
                                                { id: 'twitter', icon: <Twitter className="w-4 h-4" />, label: 'Twitter/X', placeholder: '@usuario' },
                                                { id: 'youtube', icon: <Youtube className="w-4 h-4" />, label: 'YouTube', placeholder: 'link canal' },
                                                { id: 'tiktok', icon: <Play className="w-4 h-4" />, label: 'TikTok', placeholder: '@usuario' },
                                                { id: 'linkedin', icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', placeholder: 'link perfil' },
                                                { id: 'threads', icon: <AtSign className="w-4 h-4" />, label: 'Threads', placeholder: '@usuario' },
                                                { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'E-mail', placeholder: 'seu@email.com' }
                                            ].map(social => (
                                                <div key={social.id} className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                                                        {social.icon} {social.label}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={socials[social.id] || ''}
                                                        onChange={(e) => setSocials({ ...socials, [social.id]: e.target.value })}
                                                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                        placeholder={social.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>

                                    {/* Links Group */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                                <LinkIcon className="w-3 h-3" /> Links do Perfil ({links.length}/{userPlan === 'pro' ? 20 : userPlan === 'growth' ? 10 : 5})
                                            </div>
                                            <button
                                                onClick={handleAddLink}
                                                disabled={links.length >= 10}
                                                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                            >
                                                + Adicionar Link
                                            </button>
                                        </div>

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={links.map((_, i) => `link-${i}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-4">
                                                    {links.map((link, index) => (
                                                        <SortableItem key={`link-${index}`} id={`link-${index}`}>
                                                            {({ attributes, listeners }) => (
                                                                <>
                                                                    <div className="p-5 pl-12 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative group/card transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md">
                                                                        <div
                                                                            {...attributes}
                                                                            {...listeners}
                                                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-indigo-600 dark:text-zinc-600 dark:hover:text-indigo-400 z-10 opacity-40 group-hover/card:opacity-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                                                                            title="Arraste para reordenar"
                                                                        >
                                                                            <GripVertical className="w-5 h-5" />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveLink(index)}
                                                                            className="absolute -right-2 -top-2 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-full p-1.5 border border-zinc-200 dark:border-zinc-700 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all scale-75 group-hover:scale-100 z-10"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className="space-y-3">
                                                                                <textarea
                                                                                    value={link.title || ''}
                                                                                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                                                                    rows={1}
                                                                                    className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 pb-1.5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors text-zinc-900 dark:text-zinc-100 resize-none overflow-hidden"
                                                                                    placeholder={link.image ? "Ex: Minha Loja (Opcional)" : "Ex: Minha Loja"}
                                                                                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                                                                />
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Tipo de Destino:</label>
                                                                                    <select
                                                                                        value={link.type || 'url'}
                                                                                        onChange={(e) => handleLinkChange(index, 'type', e.target.value)}
                                                                                        className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 focus:ring-0 cursor-pointer"
                                                                                    >
                                                                                        <option value="url">🔗 LINK / URL</option>
                                                                                        <option value="whatsapp">💬 WHATSAPP</option>
                                                                                        <option value="message">📢 MENSAGEM (POPUP)</option>
                                                                                        <option value="map">📍 MAPA / ENDEREÇO</option>
                                                                                    </select>
                                                                                </div>

                                                                                {link.type === 'message' && (
                                                                                    <div className="space-y-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <MessageSquare className="w-3 h-3 text-indigo-500" />
                                                                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Conteúdo do Popup</span>
                                                                                        </div>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={link.messageTitle || ''}
                                                                                            onChange={(e) => handleLinkChange(index, 'messageTitle', e.target.value)}
                                                                                            className="w-full bg-white dark:bg-zinc-900/50 border border-indigo-100 dark:border-indigo-900/20 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                                                                                            placeholder="Título do Popup (Ex: Informações Importantes)"
                                                                                        />
                                                                                        <textarea
                                                                                            value={link.messageBody || ''}
                                                                                            onChange={(e) => handleLinkChange(index, 'messageBody', e.target.value)}
                                                                                            rows={3}
                                                                                            className="w-full bg-white dark:bg-zinc-900/50 border border-indigo-100 dark:border-indigo-900/20 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none no-scrollbar"
                                                                                            placeholder="Descreva a mensagem que aparecerá ao clicar no botão..."
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {link.type === 'whatsapp' && (
                                                                                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <MessageCircle className="w-3 h-3 text-emerald-500" />
                                                                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Configuração WhatsApp</span>
                                                                                        </div>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={link.phone || ''}
                                                                                            onChange={(e) => handleWhatsAppChange(index, 'phone', e.target.value)}
                                                                                            className="w-full bg-white dark:bg-zinc-900/50 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                                                                                            placeholder="Número com DDD (ex: 11999999999)"
                                                                                        />
                                                                                        <textarea
                                                                                            value={link.whatsappMessage || ''}
                                                                                            onChange={(e) => handleWhatsAppChange(index, 'message', e.target.value)}
                                                                                            rows={2}
                                                                                            className="w-full bg-white dark:bg-zinc-900/50 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none no-scrollbar"
                                                                                            placeholder="Mensagem padrão (opcional)"
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {link.type === 'map' && (
                                                                                    <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-2">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <Globe className="w-3 h-3 text-amber-500" />
                                                                                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Endereço / Localização</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={link.address || ''}
                                                                                                onChange={(e) => {
                                                                                                    const addr = e.target.value;
                                                                                                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
                                                                                                    const newLinks = [...links];
                                                                                                    newLinks[index].address = addr;
                                                                                                    newLinks[index].url = mapsUrl;
                                                                                                    setLinks(newLinks);
                                                                                                }}
                                                                                                className="flex-1 bg-white dark:bg-zinc-900/50 border border-amber-100 dark:border-amber-900/20 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                                                                                placeholder="Rua, Número, Bairro, Cidade - Estado"
                                                                                            />
                                                                                        </div>
                                                                                        <p className="text-[10px] text-zinc-400 italic">O link será convertido automaticamente para Google Maps.</p>
                                                                                    </div>
                                                                                )}

                                                                                {(link.type === 'url' || !link.type) && (
                                                                                    <div className="flex items-center gap-2">
                                                                                        <input
                                                                                            type="url"
                                                                                            value={link.url}
                                                                                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                                                            className="flex-1 bg-transparent border-none p-0 text-xs text-zinc-500 focus:outline-none focus:text-indigo-600 transition-colors font-medium text-ellipsis overflow-hidden"
                                                                                            placeholder="https://sua-url.com"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="pt-2 flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 relative">
                                                                                {link.image ? (
                                                                                    <img src={link.image} className="w-full h-full object-cover" alt="" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon className="w-3 h-3" /></div>
                                                                                )}
                                                                            </div>
                                                                            <label className="flex-1 px-3 py-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2">
                                                                                <span className="text-[9px] font-black text-indigo-600 uppercase">Imagem do Link</span>
                                                                                <input type="file" className="hidden" onChange={(e) => handleLinkImageUpload(e, index)} accept="image/*" />
                                                                            </label>
                                                                            {link.image && (
                                                                                <button
                                                                                    onClick={() => handleLinkChange(index, 'image', null)}
                                                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {link.image && (
                                                                            <div className="space-y-1 mt-2">
                                                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Estilo da Imagem do Link</label>
                                                                                <select
                                                                                    value={link.imageStyle || 'thumbnail'}
                                                                                    onChange={(e) => handleLinkChange(index, 'imageStyle', e.target.value)}
                                                                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer text-zinc-800 dark:text-zinc-200"
                                                                                >
                                                                                    <option value="thumbnail">Miniatura</option>
                                                                                    <option value="large">Destaque Lateral</option>
                                                                                    <option value="banner">Banner de Fundo</option>
                                                                                </select>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-3 rounded-2xl space-y-2">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                                                                <CalendarClock className="w-3 h-3" /> Exibição Agendada
                                                                            </div>
                                                                            {userPlan === 'start' && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => { e.preventDefault(); onShowPlans(); }}
                                                                                    className="text-[8px] text-amber-500 font-black hover:text-indigo-600"
                                                                                >
                                                                                    GROWTH+
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-2">
                                                                            <div className="space-y-1">
                                                                                <span className="text-[9px] font-bold text-zinc-500">Inicia em</span>
                                                                                <input
                                                                                    type="datetime-local"
                                                                                    disabled={userPlan === 'start'}
                                                                                    value={link.scheduleStart || ''}
                                                                                    onChange={(e) => handleLinkChange(index, 'scheduleStart', e.target.value)}
                                                                                    className="w-full text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/50 mt-2">
                                                                            <div className="space-y-1">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        if (userPlan === 'start' || userPlan === 'trial') onShowPlans();
                                                                                    }}
                                                                                    className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                                                                >
                                                                                    Senha {(userPlan === 'start' || userPlan === 'trial') && <span className="text-[8px] text-amber-500 font-black">GROWTH+</span>}
                                                                                </button>
                                                                                <input
                                                                                    type="text"
                                                                                    disabled={userPlan === 'start' || userPlan === 'trial'}
                                                                                    value={link.password || ''}
                                                                                    onChange={(e) => handleLinkChange(index, 'password', e.target.value)}
                                                                                    placeholder="Opcional"
                                                                                    className="w-full text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        if (userPlan === 'start' || userPlan === 'trial') onShowPlans();
                                                                                    }}
                                                                                    className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                                                                >
                                                                                    Maior Idade {(userPlan === 'start' || userPlan === 'trial') && <span className="text-[8px] text-amber-500 font-black">GROWTH+</span>}
                                                                                </button>
                                                                                <div className="flex items-center h-[26px]">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => (userPlan === 'pro' || userPlan === 'growth') && handleLinkChange(index, 'requireAge', !link.requireAge)}
                                                                                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${link.requireAge ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                                                                                            } ${userPlan === 'start' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                                    >
                                                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${link.requireAge ? 'translate-x-4' : 'translate-x-1'}`} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </SortableItem>
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>

            {/* Right Panel: Live Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative">
                <div className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" /> Pré-visualização Real
                </div>

                <div className="w-[300px] h-[600px] bg-black rounded-[45px] border-[10px] border-zinc-900 shadow-2xl overflow-hidden relative group">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-2xl z-20"></div>

                    {/* Dashboard Preview using the same component as public page */}
                    <div className="w-full h-full overflow-y-auto no-scrollbar">
                        <BioPageClient
                            page={{
                                id: selectedPageId,
                                slug,
                                title,
                                description,
                                links,
                                socials,
                                backgroundColor,
                                textColor,
                                buttonColor,
                                fontFamily,
                                profileImageUrl,
                                profileStyle,
                                backgroundImageUrl,
                                backgroundImages,
                                showLogo,
                                userPlan,
                                descriptionColor,
                                buttonsTransparent
                            }}
                            slug={slug}
                            isPreview={true}
                            apiBase={process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteModal(false)}></div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[400px] p-8 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Excluir Página?</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                                    Tem certeza que deseja excluir a página <span className="font-bold text-zinc-900 dark:text-zinc-200">/{slug}</span>?
                                    <br />Esta ação não pode ser desfeita e todos os dados serão perdidos.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={deleting}
                                        className="py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl transition-all disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notification Toast */}
            {
                success && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-full shadow-2xl animate-fade-in-up z-50 border border-white/10">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold">{success}</span>
                    </div>
                )
            }
            {
                error && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full shadow-2xl animate-fade-in-up z-50">
                        <AlertCircle className="w-4 h-4 text-white" />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )
            }
            {/* QRCode Modal */}
            {
                showQrModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)}></div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[360px] p-8 relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <h2 className="text-xl font-bold mb-1 text-zinc-900 dark:text-zinc-50">QRCode da Página</h2>
                                <p className="text-zinc-400 text-xs mb-8">isocialmedia.com.br/{slug}</p>

                                <div className="p-6 bg-white rounded-3xl shadow-xl shadow-zinc-200/50 mb-8">
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={`${window.location.origin}/${slug}`}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        const svg = document.getElementById("qr-code-svg");
                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const canvas = document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            ctx.drawImage(img, 0, 0);
                                            const pngFile = canvas.toDataURL("image/png");
                                            const downloadLink = document.createElement("a");
                                            downloadLink.download = `qrcode-${slug}.png`;
                                            downloadLink.href = pngFile;
                                            downloadLink.click();
                                        };
                                        img.src = "data:image/svg+xml;base64," + btoa(svgData);
                                    }}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Baixar QRCode
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
