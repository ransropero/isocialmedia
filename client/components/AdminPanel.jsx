'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, updateUserAccess } from '../services/api';
import { Shield, Check, X, UserCog, Loader2, AlertCircle } from 'lucide-react';

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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <UserCog className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                        <p className="text-sm text-gray-500">Gerencie acessos e permissões do sistema</p>
                    </div>
                </div>
                <div className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium border border-indigo-100">
                    {users.length} Usuários
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">Usuário</th>
                            <th className="px-6 py-4 text-center">Permissão</th>
                            <th className="px-6 py-4 text-center">Cadastro</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-400">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                                            <Shield className="w-3 h-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                                            Usuário
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {user.hasAccess ? (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                            <Check className="w-4 h-4" /> Ativo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-orange-500 font-medium text-sm">
                                            <AlertCircle className="w-4 h-4" /> Pendente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggleAccess(user.id, user.hasAccess)}
                                        disabled={user.isAdmin || actionLoading === user.id}
                                        className={`
                                            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${user.isAdmin
                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                                                : user.hasAccess
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm border border-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-sm border border-green-100'
                                            }
                                        `}
                                    >
                                        {actionLoading === user.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : user.hasAccess ? (
                                            <>
                                                <X className="w-4 h-4" /> Revogar
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" /> Aprovar
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
