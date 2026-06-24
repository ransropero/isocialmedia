'use client';

import {
    Calendar, BarChart3, Link2,
    ShieldCheck, Zap, Layout, Instagram,
    AlertCircle, Smartphone, Globe, Palette, ShoppingCart, MapPin,
    Check, Rocket, Crown, TrendingUp, MousePointer2, Users, Share2, 
    ArrowUpRight, PieChart, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomeClient() {
    const [scrolled, setScrolled] = useState(false);

    const plans = [
        {
            name: 'Start',
            price: 'Gratuito',
            description: 'O primeiro passo para profissionalizar seu perfil.',
            icon: <Zap className="w-6 h-6 text-zinc-400" />,
            features: [
                '1 Bio Page personalizável',
                'Até 5 links no perfil',
                'Encurtador de Links (3 links/expira 30d)',
                'Temas essenciais',
                'Agendamento de Posts (3/mês)',
                'Analytics básico (Hoje)'
            ],
            buttonText: '👉 Começar grátis',
            subText: '(Sem cartão de crédito)',
            highlight: false,
            slug: 'start'
        },
        {
            name: 'Growth',
            price: 'R$ 9,90',
            period: '/mês',
            description: 'Para quem quer crescer com consistência.',
            icon: <Rocket className="w-6 h-6 text-indigo-500" />,
            features: [
                '1 Bio Page personalizável',
                'Até 10 links no perfil',
                'Encurtador de Links (Até 10 links)',
                'Agendamento de Links',
                'Restrição de maior idade',
                'Link com senha',
                'Analytics completo',
                'Suporte prioritário'
            ],
            buttonText: '👉 Evoluir para Growth',
            subText: '(Cancele quando quiser. Sem fidelidade)',
            highlight: true,
            slug: 'growth'
        },
        {
            name: 'Pro',
            price: 'R$ 24,90',
            period: '/mês',
            description: 'Performance máxima para marcas e profissionais.',
            icon: <Crown className="w-6 h-6 text-amber-500" />,
            features: [
                '5 Bio Pages personalizáveis',
                'Até 20 links por página',
                'Encurtador de Links (Até 50 links)',
                'Tudo do plano Growth',
                'Remover logo iSocialMedia',
                'Estatísticas avançadas',
                'Gestão profissional'
            ],
            buttonText: '👉 Ativar Pro',
            subText: '(Cancele quando quiser. Sem fidelidade)',
            highlight: false,
            slug: 'pro'
        }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30">

            <main className="relative z-10 pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-black tracking-tight animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Zap className="w-4 h-4 fill-current" />
                        Tudo o que você precisa em uma única plataforma
                    </div>
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-black dark:text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                        Sua bio no <br />
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">mais alto</span> nível <br />
                        profissional
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        Agendamento inteligente, Bio Pages premium e métricas claras para você crescer com estratégia. Menos improviso. Mais resultados!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform active:scale-95">
                            Criar minha página grátis agora ⚡
                        </Link>
                        <Link href="/pricing" className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Ver Planos
                        </Link>
                    </div>

                    <div className="pt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest animate-in fade-in duration-1000 delay-700">
                        Sem cartão de crédito • Acesso imediato
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 mt-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">
                        Páginas dos Nossos Clientes
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full opacity-50" />
                </div>

                {/* Biopages Preview Mockup */}
                <div className="max-w-6xl mx-auto px-6 mt-8 relative animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center justify-center">
                        {['psifernandosegredo', 'boxsportsAN', 'thymian.gastronomia'].map((username) => (
                            <div key={username} className="relative group w-full max-w-[320px] mx-auto aspect-[9/19] rounded-[48px] border-[8px] border-zinc-900 shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-zinc-950">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-full z-10" />
                                <iframe
                                    src={`/${username}?preview=true`}
                                    className="w-full h-full border-0 pointer-events-none transition-opacity bg-white dark:bg-zinc-950 pb-8"
                                    title={`Preview ${username}`}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                                    <Link href={`/${username}`} target="_blank" className="bg-white text-black px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform">
                                        Ver Biopage
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics Preview Section */}
                <div id="metrics" className="max-w-7xl mx-auto px-6 mt-16 relative text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-black tracking-widest uppercase mb-8 uppercase">
                        Relatórios & Inteligência
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-black dark:text-white mb-6">
                        Métricas que fazem seu<br />
                        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">negócio crescer</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400 font-medium mb-16">
                        Entenda de onde vêm seus clientes, quais links convertem mais e os horários de pico. Dados reais para decisões inteligentes.
                    </p>

                    {/* Dashboard Mockup Carousel */}
                    <div className="relative group">
                        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-8 px-4 -mx-4">
                            
                            {/* Card 1: Main Stats */}
                            <div className="flex-none w-[320px] md:w-[400px] snap-center">
                                <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl text-left space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tight opacity-50">
                                            <Users className="w-4 h-4" /> boxsportsAN
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600">30 DIAS</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Cliques Hoje</span>
                                                <MousePointer2 className="w-3 h-3 text-blue-500" />
                                            </div>
                                            <div className="text-3xl font-black">27</div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Visitas Hoje</span>
                                                <Users className="w-3 h-3 text-purple-500" />
                                            </div>
                                            <div className="text-3xl font-black">27</div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Visitas (30D)</span>
                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                            </div>
                                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">100</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Chart Mockup */}
                            <div className="flex-none w-[320px] md:w-[450px] snap-center">
                                <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl text-left h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="font-black text-sm uppercase tracking-widest">Acessos x Cliques</h4>
                                        <div className="flex gap-4 text-[10px] font-black">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> CLIQUES</div>
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> VISITAS</div>
                                        </div>
                                    </div>
                                    <div className="relative h-48 w-full flex items-end justify-between gap-1.5 opacity-90">
                                        {[25, 40, 35, 50, 55, 45, 65, 80, 75, 90, 85, 100].map((h, i) => (
                                            <div key={i} className="relative flex-1 group/bar h-full">
                                                {/* Bar Visits (Emerald - Base) */}
                                                <div 
                                                    className="absolute bottom-0 left-0 right-0 bg-emerald-500/30 rounded-t-sm transition-all duration-700" 
                                                    style={{ height: `${h}%` }} 
                                                />
                                                {/* Bar Clicks (Indigo - Overlay) */}
                                                <div 
                                                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:brightness-110" 
                                                    style={{ height: `${h * 0.7}%` }} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] font-bold opacity-30">
                                        <span>JAN 01</span>
                                        <span>JAN 15</span>
                                        <span>HOJE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Ranking e Fontes */}
                            <div className="flex-none w-[320px] md:w-[400px] snap-center">
                                <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl text-left space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-black text-sm uppercase tracking-widest">Ranking de Links</h4>
                                            <BarChart3 className="w-4 h-4 opacity-50" />
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Treino Funcional', val: '85%', color: 'bg-indigo-500' },
                                                { label: 'Musculação', val: '62%', color: 'bg-purple-500' },
                                                { label: 'Consultoria', val: '38%', color: 'bg-pink-500' }
                                            ].map((link, i) => (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex justify-between text-[11px] font-black">
                                                        <span>{link.label}</span>
                                                        <span className="opacity-50">{link.val}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${link.color} rounded-full`} style={{ width: link.val }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-black text-sm uppercase tracking-widest text-emerald-600">Fontes de Tráfego</h4>
                                            <Share2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {['Instagram', 'Direct', 'Google', 'WhatsApp'].map((source, i) => (
                                                <div key={i} className="text-center space-y-1">
                                                    <div className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{source}</div>
                                                    <div className="text-sm font-black">{[45, 25, 18, 12][i]}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: HeatMap mockup */}
                            <div className="flex-none w-[320px] md:w-[350px] snap-center">
                                <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl text-left">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="font-black text-sm uppercase tracking-widest">Horários de Pico</h4>
                                        <Clock className="w-4 h-4 opacity-50" />
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`aspect-square rounded-md transition-all duration-1000 opacity-80`} 
                                                style={{ 
                                                    backgroundColor: `rgba(99, 102, 241, ${(i % 10) / 10 + 0.1})` 
                                                }} 
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-6 flex items-center justify-between text-[10px] font-black opacity-30">
                                        <span>MANHÃ</span>
                                        <span>TARDE</span>
                                        <span>NOITE</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* DOR / PROBLEMA Section */}
                <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 relative text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-black tracking-widest uppercase mb-8">
                        O problema
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-black dark:text-white mb-16">
                        Seus clientes <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">somem</span> porque<br />
                        o acesso é difícil
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto text-left">
                        {[
                            {
                                icon: <AlertCircle className="w-10 h-10" />,
                                title: '"O link da bio não leva a nada útil"',
                                desc: 'Perfil bonito, mas quando o cliente clica, não sabe o que fazer. Sem link claro = sem venda.'
                            },
                            {
                                icon: <Smartphone className="w-10 h-10" />,
                                title: 'Responder DM é impossível de escalar',
                                desc: 'Você passa horas respondendo "qual é o horário?" e "como agendar?" no direct do Instagram.'
                            },
                            {
                                icon: <Globe className="w-10 h-10" />,
                                title: 'Criar site é caro e demorado',
                                desc: 'Agências cobram R$ 3.000+ por um site que leva meses. Enquanto isso, você perde clientes.'
                            },
                            {
                                icon: <Link2 className="w-10 h-10" />,
                                title: 'Linktree não passa profissionalismo',
                                desc: 'Visual genérico, sem sua identidade. Quem acessa não sente confiança para comprar ou agendar.'
                            }
                        ].map((pain, i) => (
                            <div key={i} className="p-8 md:p-10 rounded-[32px] bg-red-50/50 dark:bg-zinc-900/40 border border-red-100/50 dark:border-zinc-800/80 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-xl group">
                                <div className="text-4xl mb-6 transform transition-transform group-hover:scale-110 group-hover:-rotate-6 origin-bottom-left">
                                    {pain.icon}
                                </div>
                                <h3 className="text-xl md:text-2xl font-black mb-3 text-zinc-900 dark:text-white">
                                    {pain.title}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    {pain.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Solução Section */}
                <div id="features" className="max-w-7xl mx-auto px-6 mt-20 relative text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest uppercase mb-8">
                        Solução
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-black dark:text-white mb-16">
                        Tudo que seu negócio precisa<br />
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">em uma única página</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                        {[
                            {
                                icon: <Palette className="w-7 h-7" />,
                                color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/50',
                                title: 'Página com sua identidade',
                                desc: 'Foto, cores, bio e links organizados do jeito que você quer. Parece um site profissional, mas é criado em minutos.'
                            },
                            {
                                icon: <Calendar className="w-7 h-7" />,
                                color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-100/50 dark:border-green-900/50',
                                title: 'Agendamento integrado',
                                desc: 'Seus clientes agendam direto na sua página, sem precisar falar com você primeiro. Funciona 24h por dia.'
                            },
                            {
                                icon: <ShoppingCart className="w-7 h-7" />,
                                color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100/50 dark:border-pink-900/50',
                                title: 'Links para vendas e produtos',
                                desc: 'Conecte WhatsApp, loja, cardápio, portfólio — qualquer link que converta o visitante em cliente.'
                            },
                            {
                                icon: <Zap className="w-7 h-7" />,
                                color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100/50 dark:border-yellow-900/50',
                                title: 'Pronto em 5 minutos',
                                desc: 'Sem precisar de técnico, de conhecimento em sites ou de pagar agência. Você mesmo cria e publica.'
                            },
                            {
                                icon: <BarChart3 className="w-7 h-7" />,
                                color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/50',
                                title: 'Métricas de acesso',
                                desc: 'Veja quantas pessoas visitaram sua página e quais links foram mais clicados. Dados para crescer.'
                            },
                            {
                                icon: <MapPin className="w-7 h-7" />,
                                color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/50',
                                title: 'Feito para o Brasil',
                                desc: 'Pensado para pequenos e médios negócios brasileiros. Suporte em português, preço justo.'
                            }
                        ].map((feat, i) => (
                            <div key={i} className="p-8 rounded-[32px] bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 shadow-sm hover:shadow-xl group">
                                <div className={`w-14 h-14 rounded-2xl ${feat.color} border flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110`}>
                                    {feat.icon}
                                </div>
                                <h3 className="text-xl font-black mb-3 text-zinc-900 dark:text-white">
                                    {feat.title}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparativo Section */}
                <div className="max-w-7xl mx-auto px-6 mt-20 mb-16 relative text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-black tracking-widest uppercase mb-8">
                        Comparativo
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-black dark:text-white mb-16">
                        Por que não o <span className="text-indigo-500">Linktree</span>?
                    </h2>

                    <div className="max-w-4xl mx-auto overflow-hidden rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="p-6 md:p-8 text-xs font-black uppercase tracking-widest text-zinc-400">Funcionalidade</th>
                                    <th className="p-6 md:p-8 text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Linktree</th>
                                    <th className="p-6 md:p-8 text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-center">iSocialMedia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {[
                                    { label: 'Links ilimitados', lt: '✗ (plano pago)', ism: '✓' },
                                    { label: 'Encurtador de Links c/ QR Code', lt: '✗', ism: '✓' },
                                    { label: 'Agendamento integrado', lt: '✗', ism: '✓' },
                                    { label: 'Suporte em português', lt: '✗', ism: '✓' },
                                    { label: 'Identidade visual personalizada', lt: 'Limitado', ism: '✓ Total' },
                                    { label: 'Preço justo para o Brasil', lt: 'Dólar', ism: '✓ Em reais' },
                                    { label: 'Feito para pequenos negócios BR', lt: '✗', ism: '✓' }
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-6 md:p-8 font-bold text-zinc-900 dark:text-zinc-100 text-sm md:text-base">{row.label}</td>
                                        <td className="p-6 md:p-8 text-center font-medium text-red-500/70 text-xs md:text-sm">{row.lt}</td>
                                        <td className="p-6 md:p-8 text-center font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10 text-sm md:text-base">
                                            {row.ism}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Planos Section */}
                <div id="planos" className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest uppercase mb-8">
                            Planos
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-black dark:text-white mb-4">
                            Escolha o plano ideal
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
                            Comece grátis e evolua no seu ritmo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative p-8 rounded-[32px] border ${plan.highlight
                                    ? 'border-indigo-500 bg-white dark:bg-zinc-900 shadow-2xl scale-105 z-10'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm'
                                    } transition-all duration-300 hover:shadow-xl`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        🔹 Mais popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 w-fit rounded-2xl mb-4">
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        {plan.period && <span className="text-zinc-500 text-sm font-medium">{plan.period}</span>}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 leading-relaxed font-medium italic">
                                        "{plan.description}"
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className="mt-1 p-0.5 bg-green-500/10 rounded-full">
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href="/signup"
                                        className={`block w-full py-4 rounded-2xl text-center font-black text-sm transition-all ${plan.highlight
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                                            : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                                            }`}
                                    >
                                        {plan.buttonText}
                                    </Link>
                                    <p className="text-[10px] text-center text-zinc-400 font-bold uppercase tracking-wider">
                                        {plan.subText}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats / Branding */}
                <div className="flex flex-col items-center justify-center space-y-6 pb-20">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-50 dark:border-zinc-950 bg-zinc-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-black text-sm uppercase tracking-widest">
                        +2 mil usuários ativos confiam na plataforma
                    </p>
                </div>

                {/* Last CTA Section */}
                <div className="max-w-5xl mx-auto px-6 mb-16">
                    <div className="relative p-12 md:p-20 rounded-[48px] bg-zinc-900 overflow-hidden text-center text-white">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 via-purple-600/20 to-pink-600/10"></div>
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                                Pronto para transformar suas Redes Sociais<br />
                                em uma máquina digital?
                            </h3>
                            <div className="flex flex-col items-center gap-4">
                                <Link href="/signup" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform active:scale-95">
                                    Criar minha página grátis agora ⚡
                                </Link>
                                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">
                                    Sem cartão de crédito • Acesso imediato
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-10 border-t border-zinc-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2 grayscale brightness-50">
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-white/10 p-0.5">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-tighter">
                            iSocialM
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">e</span>
                            di
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">a</span>
                        </span>
                    </div>
                    <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-zinc-400">
                        <a href="https://www.instagram.com/isocial.media/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors flex items-center gap-1">
                            <Instagram className="w-3 h-3" /> Instagram
                        </a>
                        <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Termos</a>
                        <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacidade</a>
                        <a href="https://wa.me/5519992483109?text=Olá,%20iSocialMedia%20preciso%20de%20ajuda!" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Suporte</a>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">
                        © 2026 iSocialMedia. Todos os direitos reservados.
                    </p>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
