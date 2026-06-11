'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, LayoutTemplate, User, Calendar, ShieldCheck } from 'lucide-react';
import { register } from '../services/api';
import Link from 'next/link';

const Signup = ({ onSignup }) => {
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
            const data = await register(email, password, fullName, birthDate, cpf, optIn);
            
            // Auto login after signup
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, isAdmin: data.isAdmin || false }));
            
            setSuccessMsg('Conta criada com sucesso! Redirecionando...');
            
            if (onSignup) {
                onSignup(data);
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
                        Crie sua página <br />
                        com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">profissionalismo total</span>.
                    </h1>
                    <p className="text-lg text-zinc-300 leading-relaxed text-balance">
                        Agendamento, Bio Page e métricas — tudo em um só lugar. Junte-se a milhares de usuários que estão transformando suas biografias.
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative pt-24 lg:pt-32">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Criar nova conta
                        </h2>
                        <p className="text-sm text-zinc-500">
                            Preencha os dados abaixo para começar gratuitamente.
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
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-sm font-medium">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {successMsg}
                                </div>
                                <Link 
                                    href="/login" 
                                    className="block w-full py-2 bg-green-600 text-white text-center rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                                >
                                    Ir para LOGIN
                                </Link>
                            </div>
                        )}

                        {!successMsg && (
                            <>
                                <div className="space-y-4">
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Criar Minha Conta
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-zinc-500">Ou continue com</span>
                        </div>
                    </div>

                    <div className={`grid ${process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true' && process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_AUTH === 'true' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true' && (
                            <button
                                type="button"
                                onClick={() => window.location.href = '/api/auth/google'}
                                className="flex items-center justify-center gap-2 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-sm font-medium"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                        )}
                        {process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_AUTH === 'true' && (
                            <button
                                type="button"
                                onClick={() => window.location.href = '/api/auth/facebook'}
                                className="flex items-center justify-center gap-2 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-sm font-medium"
                            >
                                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        )}
                    </div>

                    <div className="text-center pt-4">
                        <Link
                            href="/login"
                            className="text-sm text-zinc-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                            Já tem conta? Faça LOGIN
                        </Link>
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

export default Signup;
