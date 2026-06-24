'use client';

import { useState } from 'react';
import BioEditor from './BioEditor';
import AnalyticsDashboard from './AnalyticsDashboard';
import WhatsAppModule from './WhatsAppModule';
import ShortenerModule from './ShortenerModule';
import { Link as LinkIcon, BarChart3, LayoutGrid, MessageSquare, QrCode } from 'lucide-react';

export default function Dashboard({ user, onShowPlans }) {
    const [activeTab, setActiveTab] = useState('bio'); // 'bio' as default

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('bio')}
                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'bio'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Bio Link
                </button>
                <button
                    onClick={() => setActiveTab('shortener')}
                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'shortener'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <QrCode className="w-4 h-4 mr-2" />
                    Encurtador
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'analytics'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatórios
                </button>
                {user?.plan === 'pro' && (
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'whatsapp'
                            ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp Pro
                    </button>
                )}
            </div>

            <main className="w-full">
                <div className="w-full">
                    {activeTab === 'bio' && <BioEditor user={user} onShowPlans={onShowPlans} />}
                    {activeTab === 'shortener' && <ShortenerModule user={user} onShowPlans={onShowPlans} />}
                    {activeTab === 'analytics' && <AnalyticsDashboard user={user} onShowPlans={onShowPlans} />}
                    {activeTab === 'whatsapp' && <WhatsAppModule user={user} />}
                </div>
            </main>
        </div>
    );
}
