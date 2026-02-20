'use client';

import Header from '@/components/Header';
import { Check, Zap, Rocket, Crown, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: 'Start',
            price: 'Gratuito',
            description: 'O primeiro passo para profissionalizar seu perfil.',
            icon: <Zap className="w-6 h-6 text-zinc-400" />,
            features: [
                '1 Bio Page personalizável',
                'Até 5 links no perfil',
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
            price: 'R$ 24,90',
            period: '/mês',
            description: 'Para quem quer crescer com consistência.',
            icon: <Rocket className="w-6 h-6 text-indigo-500" />,
            features: [
                '1 Bio Page personalizável',
                'Até 10 links no perfil',
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
            price: 'R$ 49,90',
            period: '/mês',
            description: 'Performance máxima para marcas e profissionais.',
            icon: <Crown className="w-6 h-6 text-amber-500" />,
            features: [
                '5 Bio Pages personalizáveis',
                'Até 20 links por página',
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
            <main className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Escolha o plano ideal para <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">acelerar sua estratégia</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                        Do primeiro link na bio até uma presença digital profissional. Comece grátis e evolua no seu ritmo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                    href="/login"
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

                <div className="mt-24 text-center p-12 bg-zinc-900 rounded-[40px] text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">Precisa de ajuda para decidir?</h2>
                        <p className="opacity-80 mb-8 max-w-xl mx-auto font-medium">
                            Converse com nosso time e descubra qual plano faz mais sentido para o seu perfil ou negócio.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://api.whatsapp.com/send/?phone=5511974501991&text=Olá! Preciso de uma recomendação. Qual plano do iSocialMedia faz mais sentido para o meu perfil?&type=phone_number&app_absent=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black hover:scale-105 transition-transform shadow-2xl"
                            >
                                Receber recomendação
                            </a>
                            <a
                                href="https://www.instagram.com/isocialmidia/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-zinc-800 text-white px-12 py-5 rounded-2xl font-black hover:scale-105 transition-transform shadow-2xl border border-white/10"
                            >
                                <Instagram className="w-5 h-5 text-pink-500" />
                                Nossa rede
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
