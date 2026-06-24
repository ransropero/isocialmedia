'use client';

import { useEffect, useState } from 'react';
import { getShortLinkAnalytics } from '@/services/api';
import { Loader2, ArrowLeft, BarChart3, Calendar, MousePointer2, Smartphone, Monitor, Globe } from 'lucide-react';

export default function ShortLinkAnalytics({ link, onClose }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getShortLinkAnalytics(link.id);
                setAnalytics(res.data);
            } catch (err) {
                console.error('Erro ao buscar analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [link.id]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                Não foi possível carregar os dados de métricas.
            </div>
        );
    }

    // Achar altura máxima para os gráficos
    const maxCount = Math.max(...analytics.history.map(d => d.count), 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Relatório de Cliques</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{link.title}</p>
                </div>
            </div>

            {/* Grid de Stats Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliques Totais (30d)</span>
                        <MousePointer2 className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white">{analytics.totalClicks}</div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dispositivo Principal</span>
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white">
                        {analytics.devices.Mobile >= analytics.devices.Desktop ? 'Celular' : 'Desktop'}
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                        <Calendar className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white">
                        {link.expiresAt && new Date(link.expiresAt) < new Date() ? 'Expirado' : 'Ativo'}
                    </div>
                </div>
            </div>

            {/* Gráfico de Cliques */}
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Cliques por Dia (Últimos 30 Dias)</h4>
                </div>

                <div className="h-48 w-full flex items-end gap-1 px-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    {analytics.history.map((day, i) => {
                        const heightPercent = (day.count / maxCount) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div 
                                    className="absolute bottom-full mb-2 bg-zinc-900 text-white text-[10px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl"
                                >
                                    {day.count} cliques ({new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                                </div>
                                <div 
                                    className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-md hover:bg-indigo-400 dark:hover:bg-indigo-500 transition-all duration-300 cursor-pointer"
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[9px] font-black tracking-wider text-zinc-400 uppercase">
                    <span>{new Date(analytics.history[0]?.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                    <span>Metade do Período</span>
                    <span>Hoje</span>
                </div>
            </div>

            {/* Referrers & Dispositivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrers */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Origens do Tráfego
                    </h4>
                    <div className="space-y-3">
                        {analytics.referrers.length === 0 ? (
                            <div className="text-sm text-zinc-400 text-center py-4">Nenhum dado registrado.</div>
                        ) : (
                            analytics.referrers.slice(0, 5).map((ref, i) => {
                                const percent = analytics.totalClicks > 0 ? (ref.count / analytics.totalClicks) * 100 : 0;
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                            <span className="truncate max-w-[200px]">{ref.name}</span>
                                            <span>{ref.count} ({percent.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Dispositivos */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> Dispositivos
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 flex items-center gap-3">
                            <Smartphone className="w-8 h-8 text-indigo-500" />
                            <div>
                                <div className="text-xs text-zinc-400 font-bold uppercase tracking-tight">Celular</div>
                                <div className="text-lg font-black">{analytics.devices.Mobile || 0}</div>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 flex items-center gap-3">
                            <Monitor className="w-8 h-8 text-emerald-500" />
                            <div>
                                <div className="text-xs text-zinc-400 font-bold uppercase tracking-tight">Desktop</div>
                                <div className="text-lg font-black">{analytics.devices.Desktop || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
