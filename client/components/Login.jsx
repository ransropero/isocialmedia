'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, LayoutTemplate, User, Calendar, ShieldCheck } from 'lucide-react';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [cpf, setCpf] = useState('');
    const [optIn, setOptIn] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                const data = await login(email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, isAdmin: data.isAdmin }));
                if (onLogin) onLogin(data);
            } else {
                await register(email, password, fullName, birthDate, cpf, optIn);
                setIsLogin(true);
                setSuccessMsg('Conta criada com sucesso! Você já pode fazer login e começar.');
                setEmail('');
                setPassword('');
                setFullName('');
                setBirthDate('');
                setCpf('');
            }
        } catch (err) {
            const apiError = err.response?.data;
            setError(apiError?.message || 'Ocorreu um erro.');
            if (apiError?.error) console.error('Technical Error:', apiError.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background animate-fade-in-up">
            {/* Left Side - Visual Panel (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 to-purple-900/40"></div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
                        <LayoutTemplate className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight leading-tight">
                        Gerencie seu Instagram com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">inteligência estratégica</span>.
                    </h1>
                    <p className="text-lg text-zinc-300 leading-relaxed text-balance">
                        Uma plataforma completa para agendamento, otimização da bio e gestão de múltiplos perfis. Menos tarefas manuais. Mais foco em crescer!
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-medium">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="rounded-full" />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center text-sm font-medium text-zinc-300">
                            +2 mil usuários ativos confiam na plataforma
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {isLogin ? 'Que bom te ver por aqui!' : 'Criar nova conta'}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {isLogin ? 'Acesse sua conta para continuar.' : 'Preencha os dados abaixo para começar gratuitamente.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium animate-pulse flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-sm font-medium flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4" />
                                {successMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isLogin && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome Completo</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Seu nome completo"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nascimento</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="date"
                                                    value={birthDate}
                                                    onChange={(e) => setBirthDate(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CPF</label>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="000.000.000-00"
                                                    value={cpf}
                                                    onChange={(e) => setCpf(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="flex items-start gap-3 pt-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="optIn"
                                            type="checkbox"
                                            checked={optIn}
                                            onChange={(e) => setOptIn(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                                        />
                                    </div>
                                    <label htmlFor="optIn" className="text-xs text-zinc-500 leading-normal select-none cursor-pointer">
                                        Desejo receber novidades e importantes atualizações sobre a plataforma e concordo com os termos de uso.
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                            className="text-sm text-zinc-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                            {isLogin ? 'Ainda não tem uma conta? Crie gratuitamente.' : 'Já tem conta? Faça LOGIN'}
                        </button>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="absolute bottom-6 text-xs text-zinc-400">
                    &copy; 2026 iSocialMedia. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
};

export default Login;
