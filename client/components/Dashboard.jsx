'use client';

import { useState } from 'react';
import PostComposer from './PostComposer';
import PostList from './PostList';
import AccountManager from './AccountManager';
import BioEditor from './BioEditor';
import { LayoutGrid, Link as LinkIcon } from 'lucide-react';

export default function Dashboard() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'bio'

    const handlePostCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 bg-white/50 p-1 rounded-2xl w-fit border border-gray-100">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all ${activeTab === 'posts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Agendamentos
                </button>
                <button
                    onClick={() => setActiveTab('bio')}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all ${activeTab === 'bio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Agregador de Links
                </button>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8 text-gray-900">
                    <AccountManager />
                </div>

                <div className="lg:col-span-2">
                    {activeTab === 'posts' ? (
                        <div className="space-y-8">
                            <PostComposer onPostCreated={handlePostCreated} />
                            <PostList refreshTrigger={refreshTrigger} />
                        </div>
                    ) : (
                        <div className="lg:col-span-2">
                            <BioEditor />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
