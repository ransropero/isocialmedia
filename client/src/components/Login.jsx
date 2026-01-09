import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email, isAdmin: data.isAdmin }));

                if (onLogin) onLogin(data);
            } else {
                await register(email, password);
                // Redirect to login view, show success message, do NOT auto-login
                setIsLogin(true);
                setSuccessMsg('Conta criada com sucesso! Por favor, aguarde a aprovação do administrador para fazer login.');
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ocorreu um erro. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 mb-4 shadow-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                            {isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isLogin ? 'Entre com suas credenciais para acessar' : 'Cadastre-se para usar o Agendador Instagram'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {successMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Endereço de E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar' : 'Criar Conta'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? "Não tem uma conta? " : "Já tem conta? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccessMsg('');
                            }}
                            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors focus:outline-none"
                        >
                            {isLogin ? 'Cadastre-se' : 'Fazer Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
