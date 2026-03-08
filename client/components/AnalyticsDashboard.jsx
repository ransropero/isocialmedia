'use client';

import { useState, useEffect } from 'react';
import { getBioAnalytics, getMyBioPages } from '@/services/api';
import {
    BarChart3, TrendingUp, Calendar, MousePointer2, Loader2,
    AlertCircle, RefreshCw, Clock, PieChart, ChevronDown, Layers,
    Eye, Share2, Smartphone, Globe, Instagram, Facebook, MessageCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
    PieChart as RePieChart, Pie, Legend
} from 'recharts';

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [bioPages, setBioPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bioPageId, setBioPageId] = useState(null);
    const [range, setRange] = useState('month'); // day, week, month, year
    const [rankChartType, setRankChartType] = useState('bar'); // bar, pie
    const [userPlan, setUserPlan] = useState('start');
    const [showUpgradeWarning, setShowUpgradeWarning] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const u = JSON.parse(storedUser);
                setUserPlan(u.plan || 'start');
                if (u.plan === 'start') {
                    setRange('day');
                } else {
                    setRange('month');
                }
            } catch (e) {
                console.error('Error parsing user plan', e);
            }
        }
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const pagesRes = await getMyBioPages();
            const pages = pagesRes.data || [];
            setBioPages(pages);

            if (pages.length > 0) {
                const id = pages[0].id;
                setBioPageId(id);
                fetchAnalytics(id, range);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError('Falha ao carregar dados iniciais.');
            setLoading(false);
        }
    };

    const fetchAnalytics = async (id, r) => {
        setLoading(true);
        try {
            const res = await getBioAnalytics(id, r);
            setAnalytics(res.data);
            setError('');
        } catch (err) {
            setError('Falha ao carregar estatísticas.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (id) => {
        setBioPageId(id);
        fetchAnalytics(id, range);
    };

    const handleRangeChange = (newRange) => {
        if (userPlan === 'start' && newRange !== 'day') {
            setShowUpgradeWarning(true);
            return;
        }
        setRange(newRange);
        if (bioPageId) fetchAnalytics(bioPageId, newRange);
    };

    const formatXAxis = (tickItem) => {
        if (!tickItem) return '';
        const date = new Date(tickItem);
        if (range === 'day') return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (range === 'year') return date.toLocaleDateString('pt-BR', { month: 'short' });
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    if (loading && !analytics) return (
        <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    if (!bioPageId) return (
        <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Nenhuma página encontrada</h3>
            <p className="text-zinc-500 text-sm">Crie uma página na aba Bio Link para ver estatísticas.</p>
        </div>
    );

    const chartData = analytics?.history || [];
    const barData = analytics?.totalByLink?.map(item => ({
        name: item.title || `Link #${parseInt(item.linkIndex) + 1}`,
        value: parseInt(item.count)
    })) || [];

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#f97316', '#0ea5e9', '#64748b', '#a855f7'];

    const currentPage = bioPages.find(p => p.id === bioPageId);

    const buildHeatmapGrid = () => {
        const grid = [];
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        for (let day = 0; day < 7; day++) {
            const row = { day: days[day], hours: [] };
            for (let hour = 0; hour < 24; hour++) {
                row.hours.push(0);
            }
            grid.push(row);
        }

        let maxCount = 0;
        if (analytics?.heatmap) {
            analytics.heatmap.forEach(item => {
                if (grid[item.day]) {
                    grid[item.day].hours[item.hour] = item.count;
                    if (item.count > maxCount) maxCount = item.count;
                }
            });
        }

        return { grid, maxCount };
    };

    const heatmapData = buildHeatmapGrid();

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Page Selector & Range Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Analisando Página</div>
                        <div className="relative group">
                            <select
                                value={bioPageId}
                                onChange={(e) => handlePageChange(e.target.value)}
                                className="appearance-none bg-transparent pr-8 text-xl font-bold focus:outline-none cursor-pointer text-zinc-900 dark:text-zinc-50"
                            >
                                {bioPages.map(page => (
                                    <option key={page.id} value={page.id}>/{page.slug}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 w-fit">
                    {[
                        { id: 'day', label: 'Hoje', icon: Clock },
                        { id: 'week', label: '7D', icon: Calendar },
                        { id: 'month', label: '30D', icon: TrendingUp },
                        { id: 'year', label: 'Ano', icon: PieChart }
                    ].map((f) => {
                        const isLocked = userPlan === 'start' && f.id !== 'day';
                        return (
                            <button
                                key={f.id}
                                onClick={() => handleRangeChange(f.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === f.id
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : isLocked
                                        ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                            >
                                <f.icon className="w-3 h-3" />
                                {f.label}
                                {isLocked && <span className="text-[8px] bg-amber-500 text-white px-1 rounded-sm ml-1">PRO</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20 flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Cliques Hoje', value: analytics?.today || 0, icon: MousePointer2, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-500/10' },
                    { label: 'Visitas Hoje', value: analytics?.todayVisits || 0, icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-50/50 dark:bg-indigo-500/10' },
                    { label: `Visitas (${range === 'day' ? 'Hoje' : range === 'week' ? '7D' : range === 'month' ? '30D' : 'Ano'})`, value: analytics?.monthVisits || 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 ${stat.bg} rounded-xl ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</div>
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Interactive Chart */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                            Cliques
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                            Visitas
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxis}
                                tick={{ fontSize: 10, fontWeight: 700 }}
                                minTickGap={30}
                                axisLine={false}
                                tickLine={false}
                                stroke="#a1a1aa"
                            />
                            <YAxis
                                hide={false}
                                tick={{ fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                stroke="#a1a1aa"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
                                labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}
                                labelFormatter={(label) => formatXAxis(label)}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                animationDuration={1500}
                                name="Cliques"
                            />
                            <Area
                                type="monotone"
                                dataKey="visitCount"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={0.1}
                                fill="#10b981"
                                animationDuration={1500}
                                name="Visitas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Ranking de Links</h3>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => setRankChartType('bar')}
                                className={`p-2 rounded-lg transition-all ${rankChartType === 'bar'
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                    }`}
                                title="Gráfico de Barras"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setRankChartType('pie')}
                                className={`p-2 rounded-lg transition-all ${rankChartType === 'pie'
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                    }`}
                                title="Gráfico de Pizza"
                            >
                                <PieChart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {rankChartType === 'bar' ? (
                                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 20, bottom: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={120}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <RePieChart margin={{ top: 40, bottom: 40, left: 20, right: 20 }}>
                                    <Pie
                                        data={barData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(24, 24, 27, 0.95)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={60}
                                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }}
                                    />
                                </RePieChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Fontes de Tráfego</h3>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Share2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        {analytics?.totalBySource?.map((src, i) => {
                            const total = analytics.totalBySource.reduce((sum, item) => sum + item.count, 0);
                            const percent = total > 0 ? ((src.count / total) * 100).toFixed(1) : 0;

                            const getSourceIcon = (source) => {
                                switch (source.toLowerCase()) {
                                    case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
                                    case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
                                    case 'whatsapp': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
                                    case 'direct': return <Smartphone className="w-4 h-4 text-zinc-400" />;
                                    case 'google': return <Globe className="w-4 h-4 text-blue-400" />;
                                    default: return <Share2 className="w-4 h-4 text-zinc-400" />;
                                }
                            };

                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-bold">
                                        <div className="flex items-center gap-2 capitalize">
                                            {getSourceIcon(src.source)}
                                            <span className="text-zinc-600 dark:text-zinc-300">{src.source}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-400">{src.count} visitas</span>
                                            <span className="text-zinc-900 dark:text-zinc-50">{percent}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!analytics?.totalBySource || analytics.totalBySource.length === 0) && (
                            <div className="text-center py-12 text-zinc-400 italic text-sm">
                                Nenhuma fonte detectada ainda.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6 relative`}>
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Horários de Maior Movimento</h3>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-6 overflow-x-auto relative">
                    {(userPlan === 'start') && (
                        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 text-center max-w-sm mx-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black mb-2 text-zinc-900 dark:text-zinc-50">Recurso Premium</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-medium">Veja quais os melhores horários para postar com o mapa de calor de cliques.</p>
                                <button
                                    onClick={() => window.location.href = '/pricing'}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                                >
                                    Fazer Upgrade
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="min-w-[700px]">
                        <div className="flex mb-2">
                            <div className="w-12 shrink-0"></div>
                            <div className="flex-1 flex justify-between text-[10px] font-bold text-zinc-400">
                                {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
                                    <span key={h} className="w-8 text-center" style={{ transform: 'translateX(-50%)' }}>
                                        {h === 24 ? '0h' : `${h}h`}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            {heatmapData.grid.map((row, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-10 shrink-0 text-[10px] font-bold text-zinc-500 text-right uppercase tracking-wider">{row.day}</div>
                                    <div className="flex-1 flex gap-1">
                                        {row.hours.map((count, j) => {
                                            const intensity = count > 0 && heatmapData.maxCount > 0
                                                ? Math.ceil((count / heatmapData.maxCount) * 5) // 1 to 5
                                                : 0;

                                            const bgColors = [
                                                'bg-zinc-100 dark:bg-zinc-800/50', // 0
                                                'bg-indigo-100 dark:bg-indigo-900/30', // 1
                                                'bg-indigo-300 dark:bg-indigo-700/50', // 2
                                                'bg-indigo-400 dark:bg-indigo-600', // 3
                                                'bg-indigo-500 dark:bg-indigo-500', // 4
                                                'bg-indigo-600 dark:bg-indigo-400'  // 5
                                            ];

                                            return (
                                                <div
                                                    key={j}
                                                    title={`${count} cliques às ${j}h no(a) ${row.day}`}
                                                    className={`h-4 flex-1 rounded-sm ${bgColors[intensity]} transition-colors hover:ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900 cursor-help`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Menos</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded-sm bg-zinc-100 dark:bg-zinc-800/50"></div>
                                <div className="w-4 h-4 rounded-sm bg-indigo-100 dark:bg-indigo-900/30"></div>
                                <div className="w-4 h-4 rounded-sm bg-indigo-300 dark:bg-indigo-700/50"></div>
                                <div className="w-4 h-4 rounded-sm bg-indigo-400 dark:bg-indigo-600"></div>
                                <div className="w-4 h-4 rounded-sm bg-indigo-500 dark:bg-indigo-500"></div>
                                <div className="w-4 h-4 rounded-sm bg-indigo-600 dark:bg-indigo-400"></div>
                            </div>
                            <span>Mais</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Breakdown */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Distribuição Detalhada</h3>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-full font-black uppercase tracking-tighter">
                        Total: {analytics?.totalByLink?.reduce((sum, item) => sum + parseInt(item.count), 0)}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Link</th>
                                <th className="px-6 py-4 text-center">Cliques</th>
                                <th className="px-6 py-4 text-right">Impacto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {analytics?.totalByLink?.map((link, i) => {
                                const total = analytics.totalByLink.reduce((sum, item) => sum + parseInt(item.count), 0);
                                const percent = total > 0 ? ((parseInt(link.count) / total) * 100).toFixed(1) : 0;
                                return (
                                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                                            {link.title || `Link #${parseInt(link.linkIndex) + 1}`}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg font-black">{link.count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-xs font-mono font-bold">
                                                <div className="w-20 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${percent}%`,
                                                            backgroundColor: COLORS[i % COLORS.length]
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-zinc-500 dark:text-zinc-400">{percent}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!analytics?.totalByLink || analytics.totalByLink.length === 0) && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-zinc-400 italic">
                                        Nenhum clique registrado neste período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
