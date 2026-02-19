'use client';

import {
  Calendar, BarChart3, Link2,
  ShieldCheck, Zap, Layout, Instagram
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'Agendamento Inteligente',
      description: 'Planeje sua semana em minutos. Agende fotos, reels e stories de forma automática.',
      icon: <Calendar className="w-6 h-6 text-indigo-500" />,
      color: 'bg-indigo-500/10'
    },
    {
      title: 'Bio Pages Profissionais',
      description: 'Transforme seu link da bio em uma central de vendas com temas premium e ícones sociais.',
      icon: <Link2 className="w-6 h-6 text-pink-500" />,
      color: 'bg-pink-500/10'
    },
    {
      title: 'Analytics em Tempo Real',
      description: 'Saiba exatamente de onde vem seu tráfego e quais links convertem mais.',
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-500/10'
    },
    {
      title: 'Links Protegidos (Pro)',
      description: 'Segurança total com senhas e validação de idade para seus links mais sensíveis.',
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30">

      <main className="relative z-10 pt-32 pb-24">
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
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform active:scale-95">
              Começar grátis agora ⚡
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Ver Planos
            </Link>
          </div>

          <div className="pt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest animate-in fade-in duration-1000 delay-700">
            Sem cartão de crédito • Acesso imediato
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-6xl mx-auto px-6 mt-20 relative animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-300">
          <div className="relative p-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-[42px] border border-zinc-200 dark:border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
            <div className="overflow-hidden rounded-[32px] border border-zinc-200 dark:border-zinc-700 aspect-[16/10] md:aspect-[16/9] bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center relative group">
              <img
                src="/assets/dashboard-preview.jpg"
                alt="iSocialMidia Dashboard Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Link href="/login" className="bg-white text-black px-10 py-4 rounded-2xl font-black shadow-2xl hover:scale-105 transition-transform active:scale-95">
                  Acessar meu Painel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-32 space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Agendamento Inteligente',
                desc: 'Organize sua semana em minutos e agende posts, reels e stories automaticamente. Planeje menos. Publique melhor!',
                icon: <Calendar className="w-6 h-6" />
              },
              {
                title: 'Bio Pages Profissionais',
                desc: 'Transforme seu link da bio em uma vitrine estratégica com layouts premium, botões inteligentes e ícones sociais que convertem.',
                icon: <Layout className="w-6 h-6" />
              },
              {
                title: 'Analytics em Tempo Real',
                desc: 'Acompanhe de onde vem seu tráfego, quais links performam melhor e otimize suas ações em tempo real.',
                icon: <BarChart3 className="w-6 h-6" />
              },
              {
                title: 'Links Protegidos (Pro)',
                desc: 'Proteja seus conteúdos com senha, validação de idade e controle total de acesso. Ideal para produtos, lançamentos e ofertas exclusivas.',
                icon: <ShieldCheck className="w-6 h-6" />
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black mb-3 text-zinc-900 dark:text-white">{feature.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                  "{feature.desc}"
                </p>
              </div>
            ))}
          </div>

          {/* Branding / Stats */}
          <div className="flex flex-col items-center justify-center space-y-6 pt-12 border-t border-zinc-100 dark:border-zinc-800">
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
        </div>

        {/* Last CTA Section */}
        <div className="max-w-5xl mx-auto px-6 mb-32">
          <div className="relative p-12 md:p-20 rounded-[48px] bg-zinc-900 overflow-hidden text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 via-purple-600/20 to-pink-600/10"></div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                Pronto para transformar seu <br />
                Instagram em uma máquina digital?
              </h3>
              <div className="flex flex-col items-center gap-4">
                <Link href="/login" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform active:scale-95">
                  Começar grátis agora ⚡
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
      <footer className="py-12 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 grayscale brightness-50">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-white/10 p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black tracking-tighter">
              iSocialM
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">i</span>
              di
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">a</span>
            </span>
          </div>
          <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-zinc-400">
            <a href="https://www.instagram.com/isocialmidia/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors flex items-center gap-1">
              <Instagram className="w-3 h-3" /> Instagram
            </a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Suporte</a>
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            © 2026 iSocialMidia. Todos os direitos reservados.
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
            `}</style>
    </div>
  );
}
