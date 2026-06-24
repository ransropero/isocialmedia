'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, updateUserAccess, updateUserPlan } from '../services/api';
import { Shield, Check, X, UserCog, Loader2, AlertCircle, Zap, Clock } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Falha ao carregar usuários');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAccess = async (userId, currentStatus) => {
        setActionLoading(userId);
        try {
            await updateUserAccess(userId, !currentStatus);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, hasAccess: !currentStatus } : u
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Falha ao atualizar acesso');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdatePlan = async (userId, newPlan) => {
        setActionLoading(userId + '-plan');
        try {
            await updateUserPlan(userId, newPlan);
            setUsers(users.map(u =>
                u.id === userId ? { ...u, plan: newPlan } : u
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Falha ao atualizar plano');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
            <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-gray-50/50 dark:from-zinc-800/30 to-white dark:to-zinc-900">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner">
                        <UserCog className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gerenciamento de Usuários</h2>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Controle de acessos, permissões e planos do sistema</p>
                    </div>
                </div>
                <div className="text-[10px] px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full font-black border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-tighter">
                    {users.length} Usuários Registrados
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-8 py-5 text-left whitespace-nowrap">Usuário</th>
                            <th className="px-6 py-5 text-center whitespace-nowrap">Permissão</th>
                            <th className="px-6 py-5 text-center w-64 whitespace-nowrap">Plano do Site</th>
                            <th className="px-6 py-5 text-center whitespace-nowrap">Possui Página?</th>
                            <th className="px-6 py-5 text-center whitespace-nowrap">Inscrito em</th>
                            <th className="px-6 py-5 text-center whitespace-nowrap">Status</th>
                            <th className="px-8 py-5 text-right whitespace-nowrap">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gray-100 dark:from-zinc-800 to-gray-200 dark:to-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 font-black text-sm shadow-sm border border-white dark:border-zinc-600">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-zinc-100 leading-tight">{user.email}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center whitespace-nowrap">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-purple-200 dark:border-purple-900/30">
                                            <Shield className="w-3 h-3" /> Dashboard Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-gray-200 dark:border-zinc-700">
                                            Usuário Padrão
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1 bg-zinc-50/80 dark:bg-zinc-950/50 p-1 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                        {[
                                            { id: 'start', label: 'START', icon: Clock, color: 'text-zinc-400' },
                                            { id: 'growth', label: 'GROWTH', icon: Zap, color: 'text-indigo-500' },
                                            { id: 'pro', label: 'PRO', icon: Zap, color: 'text-amber-500' }
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleUpdatePlan(user.id, p.id)}
                                                disabled={actionLoading === user.id + '-plan'}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black transition-all active:scale-95 border cursor-pointer ${user.plan === p.id
                                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border-zinc-200 dark:border-zinc-700'
                                                    : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 border-transparent hover:bg-white/50 dark:hover:bg-zinc-800/30'
                                                    }`}
                                                title={`Alterar para o plano ${p.label}`}
                                            >
                                                {actionLoading === user.id + '-plan' && user.plan === p.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <p.icon className={`w-3 h-3 ${p.color}`} />
                                                )}
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center whitespace-nowrap">
                                    {user.hasPage ? (
                                        <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-emerald-200 dark:border-emerald-900/30">
                                            Sim
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-red-200 dark:border-red-900/30">
                                            Não
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-6 text-center whitespace-nowrap">
                                    <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-500">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center whitespace-nowrap">
                                    {user.hasAccess ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-black uppercase tracking-tighter">
                                            <Check className="w-3 h-3" /> Acesso Ativo
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30 text-[10px] font-black uppercase tracking-tighter">
                                            <AlertCircle className="w-3 h-3" /> Cadastro Pendente
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleAccess(user.id, user.hasAccess)}
                                        disabled={user.isAdmin || actionLoading === user.id}
                                        className={`
                                            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black tracking-tighter uppercase transition-all duration-300 cursor-pointer
                                            ${user.isAdmin
                                                ? 'bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-600 cursor-not-allowed border border-gray-100 dark:border-zinc-800'
                                                : user.hasAccess
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-lg hover:shadow-red-500/10 border border-red-100 dark:border-red-900/30'
                                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-lg hover:shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30'
                                            }
                                        `}
                                    >
                                        {actionLoading === user.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : user.hasAccess ? (
                                            <>
                                                <X className="w-3.5 h-3.5" /> Revogar Acesso
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-3.5 h-3.5" /> Aprovar Acesso
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
