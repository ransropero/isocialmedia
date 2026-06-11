'use client';

import React, { useState, useEffect } from 'react';
import { getSiteAnalytics } from '@/services/api';
import { Loader2, TrendingUp, Users, MousePointer2, AlertCircle, BarChart3, Globe } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

export default function SiteAnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [range, setRange] = useState('month');

    useEffect(() => {
        fetchAnalytics(range);
    }, [range]);

    const fetchAnalytics = async (r) => {
        setLoading(true);
        try {
            const res = await getSiteAnalytics(r);
            setAnalytics(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar os dados de acessos.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !analytics) return (
        <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
    );

    const chartData = analytics?.history || [];

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Acessos ao Site Principal</h2>
                        <p className="text-sm text-zinc-500">Visão global de tráfego das landing pages</p>
                    </div>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    {[
                        { id: 'day', label: 'Hoje' },
                        { id: 'week', label: '7 Dias' },
                        { id: 'month', label: '30 Dias' },
                        { id: 'year', label: 'Ano' }
                    ].map(r => (
                        <button
                            key={r.id}
                            onClick={() => setRange(r.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${range === r.id
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Acessos Hoje', value: analytics?.today || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { label: 'Acessos (7 Dias)', value: analytics?.week || 0, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: `Acessos (${range === 'day' ? 'Hoje' : range === 'week' ? '7D' : range === 'month' ? '30D' : 'Ano'})`, value: analytics?.month || 0, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Historico de Acessos */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Tráfego ao Longo do Tempo</h3>
                    <div className="h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                        tickFormatter={(val) => {
                                            const [y, m, d] = val.split('-');
                                            return `${d}/${m}`;
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(l) => {
                                            const [y, m, d] = l.split('-');
                                            return `${d}/${m}/${y}`;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Acessos"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-400 text-sm">Nenhum dado no período selecionado.</div>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Páginas Mais Acessadas</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {analytics?.topPages?.map((page, i) => {
                            const max = analytics.topPages[0]?.count || 1;
                            const pct = Math.round((page.count / max) * 100);
                            return (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-200 truncate pr-4">{page.path}</span>
                                        <span className="font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">{page.count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-400"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {(!analytics?.topPages || analytics.topPages.length === 0) && (
                            <div className="text-zinc-400 text-sm italic text-center py-8">Sem dados de páginas acessadas.</div>
                        )}
                    </div>
                </div>

                {/* Top Sources */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Origens de Tráfego</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {analytics?.totalBySource?.map((src, i) => {
                            const total = analytics.totalBySource.reduce((s, x) => s + x.count, 0);
                            const perc = Math.round((src.count / total) * 100);
                            return (
                                <div key={i} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1 uppercase tracking-wider">{src.source || 'DIRETO'}</div>
                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{perc}%</div>
                                    <div className="text-xs text-zinc-500 font-medium mt-1">{src.count} visitas</div>
                                </div>
                            );
                        })}
                        {(!analytics?.totalBySource || analytics.totalBySource.length === 0) && (
                            <div className="col-span-full py-8 text-center text-zinc-500 text-sm">Sem dados de origens rastreadas.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
