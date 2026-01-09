'use client';

import { useState, useEffect } from 'react';
import { getAccounts, createAccount, deleteAccount } from '../services/api';
import { Users, Plus, Trash2, Instagram } from 'lucide-react';

export default function AccountManager({ onAccountsChange }) {
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await getAccounts();
            setAccounts(response.data);
            if (onAccountsChange) onAccountsChange(response.data);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAccount(formData);
            await fetchAccounts();
            setShowForm(false);
            setFormData({ name: '', username: '', password: '' });
            alert('Conta Adicionada com sucesso!');
        } catch (error) {
            console.error('Failed to add account', error);
            const msg = error.response?.data?.error || 'Falha ao adicionar conta';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta conta?')) return;
        try {
            await deleteAccount(id);
            await fetchAccounts();
        } catch (error) {
            console.error('Failed to delete account', error);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Users className="w-5 h-5 text-purple-500" />
                    Contas
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    title="Adicionar Conta"
                >
                    <Plus className={`w-5 h-5 text-zinc-600 dark:text-zinc-300 transition-transform ${showForm ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        placeholder="Nome da Conta"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        required
                    />
                    <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-md border border-yellow-200">
                        <strong>Aviso:</strong> Usar autenticação por senha pode acionar verificações de segurança do Instagram (SMS, desafio). Use por sua conta e risco.
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-500 text-white text-sm font-medium py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Verificando & Adicionando...' : 'Adicionar Conta'}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {accounts.length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">Nenhuma conta conectada.</p>
                ) : (
                    accounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                            <div className="flex items-center gap-3">
                                {account.profilePictureUrl ? (
                                    <img src={account.profilePictureUrl} alt={account.username} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center text-white">
                                        <Instagram className="w-4 h-4" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{account.name}</h3>
                                    <p className="text-xs text-zinc-500 font-mono">@{account.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(account.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
