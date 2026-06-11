'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    Settings, 
    Users, 
    Send, 
    Plus, 
    Upload, 
    Search, 
    Calendar,
    CheckCircle2,
    Loader2,
    Filter,
    AlertCircle,
    QrCode,
    RefreshCcw,
    LogOut,
    Smartphone,
    Pencil,
    Trash2,
    Eye,
    User,
    Hash,
    UserPlus,
    X,
    CalendarDays,
    Save
} from 'lucide-react';
import * as whatsappApi from '../services/api';
import ContactImport from './ContactImport';

export default function WhatsAppModule({ user }) {
    const [activeSubTab, setActiveSubTab] = useState('campaigns');
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [qrCode, setQrCode] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    
    // Forms
    const [showContactForm, setShowContactForm] = useState(false);
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [previewMessage, setPreviewMessage] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [error, setError] = useState(null);
    
    // Edit states
    const [editingContact, setEditingContact] = useState(null);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [showAudienceModal, setShowAudienceModal] = useState(false);
    const [audienceContacts, setAudienceContacts] = useState([]);
    const [viewingCampaignId, setViewingCampaignId] = useState(null);
    const [isFetchingAudience, setIsFetchingAudience] = useState(false);
    
    // Campaign Filters
    const [campaignFilterSearch, setCampaignFilterSearch] = useState('');
    const [campaignFilterStatus, setCampaignFilterStatus] = useState('');
    const [campaignFilterStartDate, setCampaignFilterStartDate] = useState('');
    const [campaignFilterEndDate, setCampaignFilterEndDate] = useState('');
    const [campaignType, setCampaignType] = useState('STANDARD');

    const [showReportModal, setShowReportModal] = useState(false);
    const [campaignReport, setCampaignReport] = useState([]);
    const [isFetchingReport, setIsFetchingReport] = useState(false);
    const [selectedCampaignName, setSelectedCampaignName] = useState('');

    const openContactForm = () => {
        setError(null);
        setEditingContact(null);
        setShowContactForm(true);
    };

    const openCampaignForm = () => {
        setError(null);
        setEditingCampaign(null);
        setPreviewImage(null);
        setPreviewMessage('');
        setCampaignType('STANDARD');
        setShowCampaignForm(true);
    };

    useEffect(() => {
        fetchData();
        
        // Initial status check
        checkStatus();

        // Polling loop for status
        const interval = setInterval(() => {
            if (activeSubTab === 'settings' || connectionStatus !== 'CONNECTED') {
                checkStatus();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeSubTab, connectionStatus]);

    const checkStatus = async () => {
        try {
            const res = await whatsappApi.getWhatsAppStatus();
            setConnectionStatus(res.data.status);
            
            if (res.data.status !== 'CONNECTED' && activeSubTab === 'settings') {
                fetchQR();
            }
        } catch (err) {
            console.error('Error checking status:', err);
        }
    };

    const fetchQR = async () => {
        if (isPolling) return;
        try {
            const res = await whatsappApi.getWhatsAppQR();
            if (res.data.qr) {
                setQrCode(res.data.qr);
            }
        } catch (err) {
            console.error('Error fetching QR:', err);
        }
    };

    const handleViewReport = async (campaign) => {
        setSelectedCampaignName(campaign.name);
        setIsFetchingReport(true);
        setShowReportModal(true);
        try {
            const res = await whatsappApi.getWhatsAppCampaignReport(campaign.id);
            setCampaignReport(res.data);
        } catch (err) {
            console.error('Error fetching report:', err);
            alert('Erro ao carregar relatório.');
        } finally {
            setIsFetchingReport(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsRes, campaignsRes] = await Promise.all([
                whatsappApi.getWhatsAppContacts(),
                whatsappApi.getWhatsAppCampaigns()
            ]);
            setContacts(contactsRes.data);
            setCampaigns(campaignsRes.data);
        } catch (err) {
            console.error('Error fetching WhatsApp data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm('Deseja realmente desconectar seu WhatsApp?')) return;
        setIsSaving(true);
        try {
            await whatsappApi.logoutWhatsApp();
            setConnectionStatus('DISCONNECTED');
            setQrCode(null);
            checkStatus();
        } catch (err) {
            alert('Erro ao desconectar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert interests string to array
        const contactData = {
            ...data,
            interests: data.interests ? data.interests.split(',').map(i => i.trim()) : []
        };

        try {
            if (editingContact) {
                await whatsappApi.updateWhatsAppContact(editingContact.id, contactData);
            } else {
                await whatsappApi.addWhatsAppContact(contactData);
            }
            setShowContactForm(false);
            setEditingContact(null);
            fetchData();
        } catch (err) {
            console.error('Error saving contact:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao salvar contato.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteContact = async (id) => {
        if (!confirm('Deseja realmente excluir este contato?')) return;
        setIsSaving(true);
        try {
            await whatsappApi.deleteWhatsAppContact(id);
            fetchData();
        } catch (err) {
            alert('Erro ao excluir contato.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditContact = (contact) => {
        setEditingContact(contact);
        setShowContactForm(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Clean up previous preview URL if it exists
            if (previewImage) URL.revokeObjectURL(previewImage);
            setPreviewImage(URL.createObjectURL(file));
        } else {
            if (previewImage) URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
    };

    const renderPreviewMessage = (msg) => {
        if (!msg) return 'Sua mensagem aparecerá aqui...';
        return msg.replace(/{{nome}}/gi, 'João');
    };

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const formData = new FormData(e.target);
        
        // Add filters as JSON string to the FormData
        const filters = {
            interest: formData.get('interest') || null
        };
        formData.set('filters', JSON.stringify(filters));

        // Fix Timezone: Convert local datetime to global ISO string
        // This ensures the backend (running in UTC) respects the user's timezone when creating the timestamp.
        const scheduledTimeInput = formData.get('scheduledTime');
        if (scheduledTimeInput) {
            const localDate = new Date(scheduledTimeInput);
            formData.set('scheduledTime', localDate.toISOString());
        }

        try {
            console.log('Enviando campanha:', Object.fromEntries(formData.entries()));
            if (editingCampaign) {
                await whatsappApi.updateWhatsAppCampaign(editingCampaign.id, formData);
            } else {
                await whatsappApi.createWhatsAppCampaign(formData);
            }
            setShowCampaignForm(false);
            setEditingCampaign(null);
            if (previewImage) URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
            setPreviewMessage('');
            await fetchData();
        } catch (err) {
            console.error('Error saving campaign:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao salvar campanha.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!confirm('Deseja realmente excluir esta campanha?')) return;
        setIsSaving(true);
        try {
            await whatsappApi.deleteWhatsAppCampaign(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao excluir campanha.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditCampaign = (campaign) => {
        if (campaign.status === 'COMPLETED') {
            alert('Campanhas finalizadas não podem ser editadas.');
            return;
        }
        setEditingCampaign(campaign);
        setPreviewMessage(campaign.message);
        setCampaignType(campaign.type || 'STANDARD');
        setShowCampaignForm(true);
    };

    const handleViewAudience = async (id) => {
        setIsFetchingAudience(true);
        setShowAudienceModal(true);
        setViewingCampaignId(id);
        try {
            const res = await whatsappApi.getWhatsAppCampaignAudience(id);
            setAudienceContacts(res.data);
        } catch (err) {
            console.error('Error fetching audience:', err);
            alert('Erro ao carregar público da campanha.');
            setShowAudienceModal(false);
        } finally {
            setIsFetchingAudience(false);
        }
    };

    const handleRemoveContactFromCampaign = async (contactId) => {
        if (!viewingCampaignId) return;
        if (audienceContacts.length <= 1) {
            alert('A campanha deve ter pelo menos 1 contato para ser enviada.');
            return;
        }

        if (!confirm('Deseja realmente remover este contato desta campanha?')) return;

        try {
            await whatsappApi.removeWhatsAppContactFromCampaign(viewingCampaignId, contactId);
            // Update local state instead of re-fetching everything
            setAudienceContacts(prev => prev.filter(c => c.id !== contactId));
            
            // Also update the main campaigns list contact count
            setCampaigns(prev => prev.map(c => {
                if (c.id === viewingCampaignId) {
                    return {
                        ...c,
                        contactIds: c.contactIds.filter(cid => cid !== contactId)
                    };
                }
                return c;
            }));
        } catch (err) {
            console.error('Error removing contact:', err);
            alert(err.response?.data?.message || 'Erro ao remover contato da campanha.');
        }
    };

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign => {
            // Filter by search (name or contact)
            if (campaignFilterSearch) {
                const searchLower = campaignFilterSearch.toLowerCase();
                const matchesCampaignName = campaign.name?.toLowerCase().includes(searchLower);
                
                // Find contacts whose names match the search
                const matchingContactIds = contacts
                    .filter(c => c.name?.toLowerCase().includes(searchLower))
                    .map(c => c.id);
                
                const matchesContact = campaign.contactIds?.some(id => matchingContactIds.includes(id));
                
                if (!matchesCampaignName && !matchesContact) return false;
            }
            
            // Filter by status
            if (campaignFilterStatus && campaign.status !== campaignFilterStatus) {
                return false;
            }
            
            // Filter by date
            if (campaignFilterStartDate || campaignFilterEndDate) {
                const campaignDate = new Date(campaign.scheduledTime);
                if (campaignFilterStartDate) {
                    const start = new Date(campaignFilterStartDate);
                    if (campaignDate < start) return false;
                }
                if (campaignFilterEndDate) {
                    const end = new Date(campaignFilterEndDate);
                    // Set end to end of day for better UX
                    end.setHours(23, 59, 59, 999);
                    if (campaignDate > end) return false;
                }
            }
            
            return true;
        });
    }, [campaigns, contacts, campaignFilterSearch, campaignFilterStatus, campaignFilterStartDate, campaignFilterEndDate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Sub-tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-2 px-2">
                    <button 
                        onClick={() => setActiveSubTab('campaigns')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeSubTab === 'campaigns' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                    >
                        <Send className="w-4 h-4" /> Campanhas
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('contacts')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeSubTab === 'contacts' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                    >
                        <Users className="w-4 h-4" /> Contatos
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeSubTab === 'settings' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                    >
                        <Settings className="w-4 h-4" /> Configurações
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {activeSubTab === 'contacts' && (
                        <>
                            <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all">
                                <Upload className="w-3 h-3" /> <span className="sm:inline">Importar</span>
                            </button>
                            <button onClick={openContactForm} className="flex-[1.5] md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20">
                                <Plus className="w-3 h-3" /> Novo Contato
                            </button>
                        </>
                    )}
                    {activeSubTab === 'campaigns' && (
                        <button 
                            onClick={openCampaignForm} 
                            disabled={connectionStatus !== 'CONNECTED'}
                            className={`flex-1 md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                                connectionStatus === 'CONNECTED' 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95' 
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <Plus className="w-3 h-3" /> Nova Campanha
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
                {activeSubTab === 'settings' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-all">
                            {connectionStatus === 'CONNECTED' ? (
                                <div className="p-6 sm:p-12 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-6 animate-pulse-slow">
                                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">WhatsApp Conectado</h3>
                                    <p className="text-sm text-zinc-500 mb-8 max-w-sm">
                                        Sua conta está ativa e pronta para disparar campanhas. 
                                        O servidor manterá a sessão aberta para você.
                                    </p>
                                    
                                    <div className="flex w-full sm:w-auto">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            <LogOut className="w-4 h-4" /> Desconectar Conta
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                                <QrCode className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Conectar WhatsApp</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Abra o WhatsApp no seu celular.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Toque em <strong>Configurações</strong> ou <strong>Menu</strong> e selecione <strong>Aparelhos Conectados</strong>.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Aponte a câmera para esta tela para capturar o código.</p>
                                            </div>
                                        </div>

                                        <div className={`mt-10 p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                                            connectionStatus === 'WAITING_FOR_QR' 
                                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400' 
                                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700'
                                        }`}>
                                            {connectionStatus === 'INITIALIZING' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Smartphone className="w-4 h-4" />
                                            )}
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                Status: {connectionStatus === 'WAITING_FOR_QR' ? 'Aguardando Scan' : connectionStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 sm:p-12 bg-zinc-50 dark:bg-zinc-850/50 flex flex-col items-center justify-center">
                                        <div className="relative group">
                                            {qrCode ? (
                                                <div className="relative">
                                                    <img 
                                                        src={qrCode} 
                                                        alt="WhatsApp QR Code" 
                                                        className="w-64 h-64 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg"
                                                    />
                                                    {connectionStatus === 'INITIALIZING' && (
                                                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-64 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-zinc-400 animate-pulse border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                                                    <QrCode className="w-12 h-12 opacity-20" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Gerando código seguro...</p>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={checkStatus}
                                            className="mt-8 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2 hover:underline"
                                        >
                                            <RefreshCcw className="w-4 h-4" /> Atualizar QR Code
                                        </button>
                                        
                                        <p className="mt-4 text-[10px] text-zinc-400 text-center max-w-[200px] leading-relaxed italic">
                                            O código expira em alguns minutos por segurança.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex items-center gap-4 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <p className="text-xs leading-relaxed">
                                <strong>Dica Premium:</strong> Cada conta conectada via QR Code permite o disparo de promoções personalizadas sem custo por mensagem (baseado no seu plano iSocialMedia).
                            </p>
                        </div>
                    </div>
                )}

                {activeSubTab === 'contacts' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                                <table className="w-full text-left min-w-[600px] sm:min-w-0">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                            <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Telefone</th>
                                            <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Interesses</th>
                                            <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider">Última Compra</th>
                                            <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                                        {contacts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-zinc-400">Nenhum contato cadastrado ainda.</td>
                                            </tr>
                                        ) : (
                                            contacts.map(contact => (
                                                <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-4 sm:px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{contact.name}</td>
                                                    <td className="px-4 sm:px-6 py-4 text-zinc-500">{contact.phone}</td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {contact.interests?.map((interest, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{interest}</span>
                                                            )) || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 text-zinc-500 text-sm">{contact.lastPurchase || '-'}</td>
                                                    <td className="px-4 sm:px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 sm:gap-2">
                                                            <button 
                                                                onClick={() => handleEditContact(contact)}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-indigo-600 transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteContact(contact.id)}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'campaigns' && (
                    <div className="space-y-6">
                        {/* Filters Bar */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 bg-white dark:bg-zinc-900/50 p-3 sm:p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
                            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar..." 
                                    value={campaignFilterSearch}
                                    onChange={(e) => setCampaignFilterSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1 sm:flex-none sm:min-w-[150px]">
                                <select 
                                    value={campaignFilterStatus}
                                    onChange={(e) => setCampaignFilterStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todos Status</option>
                                    <option value="SCHEDULED">Agendada</option>
                                    <option value="COMPLETED">Completa</option>
                                    <option value="PROCESSING">Processando</option>
                                    <option value="FAILED">Falhou</option>
                                </select>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <Calendar className="w-4 h-4 text-zinc-400" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">De</span>
                                    <input 
                                        type="date" 
                                        value={campaignFilterStartDate}
                                        onChange={(e) => setCampaignFilterStartDate(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-bold text-zinc-600 dark:text-zinc-400 focus:ring-0 min-w-[110px]" 
                                    />
                                </div>
                                <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700"></div>
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Até</span>
                                    <input 
                                        type="date" 
                                        value={campaignFilterEndDate}
                                        onChange={(e) => setCampaignFilterEndDate(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-bold text-zinc-600 dark:text-zinc-400 focus:ring-0 min-w-[110px]" 
                                    />
                                </div>
                                {(campaignFilterStartDate || campaignFilterEndDate || campaignFilterStatus || campaignFilterSearch) && (
                                    <button 
                                        onClick={() => {
                                            setCampaignFilterSearch('');
                                            setCampaignFilterStatus('');
                                            setCampaignFilterStartDate('');
                                            setCampaignFilterEndDate('');
                                        }}
                                        className="p-2 sm:ml-1 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 rounded-xl text-zinc-400 hover:text-red-500 transition-all border border-zinc-100 dark:border-zinc-600 shadow-sm"
                                        title="Limpar Filtros"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCampaigns.length === 0 ? (
                                <div className="col-span-full py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400">
                                    <Send className="w-12 h-12 mb-4 opacity-20" />
                                    {campaigns.length === 0 ? (
                                        <>
                                            <p>Sua primeira campanha do WhatsApp está a um clique.</p>
                                            <button onClick={() => setShowCampaignForm(true)} className="mt-4 text-indigo-500 font-bold hover:underline">Criar agora</button>
                                        </>
                                    ) : (
                                        <p>Nenhuma campanha corresponde aos filtros selecionados.</p>
                                    )}
                                </div>
                            ) : (
                                filteredCampaigns.map(campaign => (
                                <div key={campaign.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-900 dark:text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                campaign.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                                {campaign.status === 'COMPLETED' ? 'COMPLETA' : 
                                                 campaign.status === 'SCHEDULED' ? 'AGENDADA' : 
                                                 campaign.status === 'PROCESSING' ? 'PROCESSANDO' : 
                                                 campaign.status === 'FAILED' ? 'FALHOU' : campaign.status}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{campaign.name}</h4>
                                    <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{campaign.message}</p>
                                    
                                    <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-zinc-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Agendado para</span>
                                            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                                                {new Date(campaign.scheduledTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-zinc-400 flex items-center gap-1"><Users className="w-3 h-3" /> Público</span>
                                            <button 
                                                onClick={() => handleViewAudience(campaign.id)}
                                                className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                                            >
                                                {campaign.contactIds?.length || 0} contatos <Eye className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {(campaign.status === 'COMPLETED' || campaign.status === 'PROCESSING') && (
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-zinc-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Rastreamento</span>
                                                <button 
                                                    onClick={() => handleViewReport(campaign)}
                                                    className="text-green-600 hover:text-green-700 font-bold flex items-center gap-1"
                                                >
                                                    Ver Relatório <Eye className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-2 pt-2">
                                            {campaign.status !== 'COMPLETED' && campaign.status !== 'PROCESSING' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleEditCampaign(campaign)}
                                                        className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Pencil className="w-3 h-3" /> Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                                        className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-[10px] font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Excluir
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            </div>

            {/* Modals - Contact Form */}
            {showContactForm && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-t sm:border border-white/20 dark:border-zinc-800/50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 sm:duration-300 max-h-[95vh] flex flex-col">
                        {/* Header Modal */}
                        <div className="p-5 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 shrink-0">
                                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-none mb-1 truncate">
                                        {editingContact ? 'Editar Contato' : 'Novo Contato'}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-tight truncate">
                                        {editingContact ? 'Informações básicas e tags deste cliente' : 'Adicione um novo cliente à sua agenda inteligente'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowContactForm(false); setEditingContact(null); }}
                                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all hover:rotate-90 text-zinc-400 hover:text-zinc-600 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-5 sm:p-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
                            <form onSubmit={handleCreateContact} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    {/* Nome */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Nome Completo</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                required 
                                                defaultValue={editingContact?.name} 
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm outline-none" 
                                                placeholder="João Silva" 
                                            />
                                        </div>
                                    </div>

                                    {/* Telefone */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">WhatsApp (com DDD)</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                name="phone" 
                                                required 
                                                defaultValue={editingContact?.phone} 
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm outline-none" 
                                                placeholder="5511999999999" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    {/* Data de Nascimento */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Data de Nascimento</label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
                                                <CalendarDays className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="date" 
                                                name="birthDate" 
                                                defaultValue={editingContact?.birthDate} 
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm outline-none" 
                                            />
                                        </div>
                                    </div>

                                    {/* Última Compra */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Última Interação / Compra</label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <input 
                                                type="date" 
                                                name="lastPurchase" 
                                                defaultValue={editingContact?.lastPurchase} 
                                                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm outline-none" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Interesses / Tags */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Interesses & Tags (Vip, Verão, Promo...)</label>
                                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Separar por vírgula</span>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-4 text-zinc-400 transition-colors group-focus-within:text-indigo-500">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <textarea 
                                            name="interests" 
                                            rows="2"
                                            defaultValue={editingContact?.interests?.join(', ')} 
                                            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-sm outline-none resize-none placeholder:text-zinc-400/60" 
                                            placeholder="Moda, Tecnologia, Black Friday..." 
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowContactForm(false); setEditingContact(null); }} 
                                        className="px-8 py-4 text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving} 
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 hover:shadow-xl hover:shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Salvando...</span>
                                            </>
                                        ) : (
                                            <>
                                                {editingContact ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                <span>{editingContact ? 'Salvar Alterações' : 'Cadastrar Contato'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showCampaignForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-5xl max-h-[98vh] overflow-hidden shadow-2xl border-t sm:border border-white/20 dark:border-zinc-800/50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 sm:duration-300 flex flex-col">
                        <div className="p-5 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-none mb-1">
                                        {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-tight">
                                        {editingCampaign ? 'Altere os dados do agendamento' : 'Agende disparos automáticos para seus contatos'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); setPreviewImage(null); setPreviewMessage(''); }} 
                                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all hover:rotate-90 text-zinc-400 hover:text-zinc-600 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-y-auto scrollbar-hide">
                            {/* FORM SIDE */}
                            <form onSubmit={handleCreateCampaign} className="p-5 sm:p-8 space-y-5 sm:space-y-6 lg:border-r border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">Nome da Campanha</label>
                                    <input name="name" required defaultValue={editingCampaign?.name} className="w-full px-5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Ex: Promoção de Verão" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mensagem</label>
                                        <span className="text-[10px] text-indigo-500 font-bold">Dica: Use {"{{nome}}"} para personalizar</span>
                                    </div>
                                    <textarea 
                                        name="message" 
                                        required 
                                        rows="4" 
                                        defaultValue={editingCampaign?.message}
                                        onChange={(e) => setPreviewMessage(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm resize-none" 
                                        placeholder="Olá {{nome}}! Temos uma oferta especial para você..." 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <Upload className="w-3 h-3" /> Imagem da Campanha (Opcional)
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-2xl cursor-pointer bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative overflow-hidden group">
                                            {previewImage ? (
                                                <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Preview" />
                                            ) : null}
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                                                <Plus className={`w-8 h-8 ${previewImage ? 'text-indigo-500' : 'text-zinc-400'} group-hover:text-indigo-500 transition-all mb-2`} />
                                                <p className="text-xs text-zinc-500 font-medium">
                                                    {previewImage ? 'Alterar Imagem' : 'Clique para fazer upload ou arraste'}
                                                </p>
                                            </div>
                                            <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tipo de Campanha</label>
                                    <div className="flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setCampaignType('STANDARD')}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${campaignType === 'STANDARD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            Padrão (Data Fixa)
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setCampaignType('BIRTHDAY')}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${campaignType === 'BIRTHDAY' ? 'border-violet-600 bg-violet-50 text-violet-600 dark:bg-violet-900/20' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            Aniversário (Recorrente)
                                        </button>
                                    </div>
                                    <input type="hidden" name="type" value={campaignType} />
                                </div>

                                {campaignType === 'BIRTHDAY' && (
                                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                                        <p className="text-[11px] text-violet-700 dark:text-violet-300 leading-relaxed">
                                            <strong>Nota:</strong> Esta campanha será enviada automaticamente todos os dias no horário configurado apenas para os contatos que fazem aniversário na data.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                            {campaignType === 'STANDARD' ? 'Data e Hora do Disparo' : 'Horário do Disparo (Diário)'}
                                        </label>
                                        {campaignType === 'STANDARD' ? (
                                            <input 
                                                type="datetime-local" 
                                                name="scheduledTime" 
                                                required 
                                                defaultValue={formatDateTimeLocal(editingCampaign?.scheduledTime)}
                                                className="w-full px-5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" 
                                            />
                                        ) : (
                                            <input 
                                                type="time" 
                                                name="scheduledTimeStr" 
                                                required 
                                                defaultValue={editingCampaign?.scheduledTimeStr || "09:00"}
                                                className="w-full px-5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" 
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Filter className="w-3 h-3" /> Segmento (Interesse)</label>
                                        <select name="interest" defaultValue={editingCampaign?.filters?.interest || ''} className="w-full px-5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm appearance-none cursor-pointer">
                                            <option value="">Todos os contatos</option>
                                            {[...new Set(contacts.flatMap(c => c.interests || []))].sort().map(interest => (
                                                <option key={interest} value={interest}>{interest}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {connectionStatus !== 'CONNECTED' && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-tight">WhatsApp Desconectado</p>
                                                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                                                    Sua conta não está conectada. Vá em <strong>Configurações</strong> e escaneie o QR Code.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowCampaignForm(false); setEditingCampaign(null); setPreviewImage(null); setPreviewMessage(''); }} className="flex-1 px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-all">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSaving || connectionStatus !== 'CONNECTED'} className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCampaign ? <Pencil className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                        {isSaving ? 'Salvando...' : editingCampaign ? 'Salvar Alterações' : 'Agendar Campanha'}
                                    </button>
                                </div>
                            </form>

                            {/* PREVIEW SIDE */}
                            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">Preview no WhatsApp</div>
                                
                                <div className="w-full max-w-[320px] bg-[#e5ddd5] dark:bg-zinc-800 rounded-3xl p-4 shadow-xl border-4 border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
                                    
                                    <div className="relative z-10 flex flex-col gap-1">
                                        <div className="flex justify-between items-center mb-4 px-1">
                                            <span className="text-[10px] font-bold text-zinc-500">12:35</span>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full border border-zinc-500"></div>
                                                <div className="w-3 h-2 bg-zinc-500 rounded-sm"></div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-zinc-700 p-2 rounded-xl rounded-tl-none shadow-sm relative ml-2 max-w-[90%] animate-in slide-in-from-left duration-500">
                                            {previewImage && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-600">
                                                    <img src={previewImage} alt="Preview" className="w-full aspect-video object-cover" />
                                                </div>
                                            )}
                                            <div className="text-xs text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                                                {renderPreviewMessage(previewMessage)}
                                            </div>
                                            <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-zinc-400">
                                                <span>12:35</span>
                                                <span className="text-blue-500">✓✓</span>
                                            </div>
                                            <div className="absolute top-0 -left-2 w-0 h-0 border-[10px] border-transparent border-t-white dark:border-t-zinc-700"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="mt-8 text-center text-xs text-zinc-500 font-medium max-w-[240px]">
                                    Esta é uma simulação de como seu cliente receberá a mensagem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <ContactImport 
                    onClose={() => setShowImport(false)} 
                    onSuccess={() => {
                        setShowImport(false);
                        fetchData();
                    }} 
                />
            )}

            {/* Audience Modal */}
            {showAudienceModal && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border-t sm:border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[95vh]">
                        <div className="p-5 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" /> Público da Campanha
                                </h3>
                                <p className="text-[10px] sm:text-sm text-zinc-500 font-medium">Lista de contatos que receberão esta mensagem</p>
                            </div>
                            <button onClick={() => setShowAudienceModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                <Plus className="w-6 h-6 rotate-45 text-zinc-500" />
                            </button>
                        </div>
                        
                        <div className="p-0 overflow-y-auto scrollbar-hide">
                            {isFetchingAudience ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Carregando contatos...</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-[400px] sm:min-w-0">
                                    <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10 shadow-sm border-b border-zinc-100 dark:border-zinc-800">
                                        <tr>
                                            <th className="px-5 sm:px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nome</th>
                                            <th className="px-5 sm:px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Telefone</th>
                                            <th className="px-5 sm:px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                        {audienceContacts.length === 0 ? (
                                            <tr>
                                                <td colSpan="2" className="px-8 py-12 text-center text-zinc-400 italic">Nenhum contato encontrado.</td>
                                            </tr>
                                        ) : (
                                            audienceContacts.map(contact => (
                                                <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="font-bold text-zinc-900 dark:text-white">{contact.name}</div>
                                                        <div className="flex gap-1 mt-1">
                                                            {contact.interests?.slice(0, 2).map((int, i) => (
                                                                <span key={i} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-md">{int}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right font-mono text-zinc-500 text-sm">
                                                        {contact.phone}
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleRemoveContactFromCampaign(contact.id)}
                                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                                                            title="Remover da Campanha"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        <div className="p-5 sm:p-8 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest order-2 sm:order-1">
                                Total: {audienceContacts.length} contatos
                            </span>
                            <button 
                                onClick={() => setShowAudienceModal(false)}
                                className="w-full sm:w-auto px-10 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all active:scale-95 order-1 sm:order-2"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Campaign Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl w-full max-w-3xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-t sm:border border-white/20 dark:border-zinc-800/50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 sm:duration-300 flex flex-col max-h-[95vh]">
                        {/* Header Modal */}
                        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600">
                                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-none mb-1">
                                        Relatório: {selectedCampaignName}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-tight">
                                        Rastreamento de entrega e leitura em tempo real
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowReportModal(false)}
                                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all hover:rotate-90 text-zinc-400 hover:text-zinc-600 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {isFetchingReport ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Carregando relatório...</p>
                                </div>
                            ) : campaignReport.length === 0 ? (
                                <div className="text-center py-20 text-zinc-400">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Nenhum dado de entrega disponível para esta campanha ainda.</p>
                                    <p className="text-xs text-zinc-500 mt-2">Os dados aparecem após o processamento da campanha.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {campaignReport.map((log) => (
                                        <div key={log.messageId} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 dark:text-white text-sm">{log.name}</span>
                                                <span className="text-xs text-zinc-500">{log.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                        log.status === 'READ' ? 'text-blue-500' : 
                                                        log.status === 'DELIVERED' ? 'text-zinc-600 dark:text-zinc-400' : 
                                                        'text-zinc-400'
                                                    }`}>
                                                        {log.status === 'READ' ? 'Lido' : 
                                                         log.status === 'DELIVERED' ? 'Entregue' : 'Enviado'}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-400">
                                                        {log.updatedAt ? new Date(log.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                                    {log.status === 'READ' ? (
                                                        <div className="flex text-blue-500">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : log.status === 'DELIVERED' ? (
                                                        <div className="flex text-zinc-400">
                                                            <CheckCircle2 className="w-4 h-4 opacity-50" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex text-zinc-300">
                                                            <CheckCircle2 className="w-4 h-4 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5 sm:p-8 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                            <div className="flex gap-4 sm:gap-6">
                                <div className="flex items-center gap-1.5 grayscale opacity-50">
                                    <CheckCircle2 className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter">Enviado</span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-70">
                                    <CheckCircle2 className="w-3 h-3 text-zinc-400" /> <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter">Entregue</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> <span className="text-[10px] font-bold uppercase text-blue-500 tracking-tighter">Lido</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowReportModal(false)}
                                className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg dark:shadow-none"
                            >
                                Fechar Relatório
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
