'use client';

import { useState } from 'react';
import PostComposer from './PostComposer';
import PostList from './PostList';
import AccountManager from './AccountManager';

export default function Dashboard() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handlePostCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <AccountManager />
                <PostComposer onPostCreated={handlePostCreated} />
            </div>

            <div className="lg:col-span-2">
                <PostList refreshTrigger={refreshTrigger} />
            </div>
        </main>
    );
}
