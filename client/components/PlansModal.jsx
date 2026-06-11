'use client';

import { X, Check, Zap, Rocket, Shield } from 'lucide-react';

export default function PlansModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const plans = [
        {
            name: 'Growth',
            icon: <Zap className="w-6 h-6 text-amber-500" />,
            price: 'R$ 24,90/mês',
            link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=80dd6d01d2a44deb87d3422bebfb762f',
            features: [
                '1 Bio Page Personalizável',
                'Até 10 Links no Perfil',
                'Agendamento de Links',
                'Restrição de Maior Idade',
                'Link com Senha',
                'Analytics Completo',
                'Suporte Prioritário'
            ],
            buttonText: 'Assinar Growth',
            highlight: false
        },
        {
            name: 'Pro',
            icon: <Rocket className="w-6 h-6 text-indigo-500" />,
            price: 'R$ 49,90/mês',
            link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=90b6a90a1a0f44b5a408e3fb715e613b',
            features: [
                '5 Bio Pages Personalizáveis',
                'Até 20 Links por Página',
                'Tudo do Plano Growth',
                'Remover Logo iSocialMedia',
                'Estatísticas Avançadas',
                'Gestão Profissional'
            ],
            buttonText: 'Assinar Pro',
            highlight: true
        }
    ];

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[800px] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">

                {/* Header */}
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Escolha seu Plano</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Desbloqueie todo o potencial da sua presença digital.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all relative z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 rounded-[24px] border transition-all duration-300 flex flex-col h-full ${plan.highlight
                                ? 'bg-zinc-900 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                                    Mais Popular
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${plan.highlight ? 'bg-indigo-500/20' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadowed-sm'}`}>
                                    {plan.icon}
                                </div>
                                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-zinc-900 dark:text-zinc-50'}`}>
                                    {plan.name}
                                </h3>
                            </div>

                            <div className="mb-8">
                                <span className={`text-sm ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {plan.price}
                                </span>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className={`text-sm ${plan.highlight ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={plan.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-4 rounded-2xl font-black text-center transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.highlight
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {plan.buttonText}
                            </a>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Pagamento Seguro via Mercado Pago</span>
                </div>
            </div>
        </div>
    );
}
