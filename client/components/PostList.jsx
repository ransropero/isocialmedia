'use client';

import { useEffect, useState } from 'react';
import { getPosts, deletePost, updatePost } from '../services/api';
import { format } from 'date-fns';
import { Clock, CheckCircle, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import EditPostModal from './EditPostModal';

export default function PostList({ refreshTrigger }) {
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null);

    const fetchPosts = async () => {
        try {
            const response = await getPosts();
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scheduled post?')) return;
        try {
            await deletePost(id);
            // Optimistic update or refetch
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete post', error);
            alert('Failed to delete post');
        }
    };

    const handleUpdate = async (id, data) => {
        await updatePost(id, data);
        fetchPosts(); // Refresh list to see updates
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PUBLISHED': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
            case 'FAILED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Próximos Posts</h2>
                <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500">
                    {posts.length} agendados
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.length === 0 ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-zinc-500 font-medium">Nenhum post agendado.</p>
                        <p className="text-sm text-zinc-400 mt-1">Use o criador acima para começar.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Image Header */}
                            <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img
                                    src={post.imageUrl}
                                    alt="Post Content"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
                                    <button onClick={() => setEditingPost(post)} className="p-2 bg-white/90 backdrop-blur text-zinc-700 rounded-lg hover:text-blue-600 shadow-sm">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/90 backdrop-blur text-zinc-700 rounded-lg hover:text-red-500 shadow-sm">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(post.status)}`}>
                                        {getStatusIcon(post.status)}
                                        {post.status}
                                    </span>
                                    <span className="text-[10px] font-semibold text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                                        {post.type || 'FEED'}
                                    </span>
                                </div>

                                <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4 flex-1 font-medium leading-relaxed">
                                    {post.caption || <span className="italic text-zinc-400">Sem legenda...</span>}
                                </p>

                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(post.scheduledTime), 'dd MMM, HH:mm')}
                                    </div>
                                    {post.recurrenceTotal && (
                                        <span className="text-indigo-500 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                                            {post.recurrenceCurrent}/{post.recurrenceTotal}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <EditPostModal
                post={editingPost}
                isOpen={!!editingPost}
                onClose={() => setEditingPost(null)}
                onSave={handleUpdate}
            />
        </div>
    );
}
