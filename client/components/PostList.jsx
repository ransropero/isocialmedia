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
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Scheduled Posts</h2>
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">No posts scheduled.</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="group relative flex gap-4 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                            {getStatusIcon(post.status)}
                                            {post.status}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400`}>
                                            {post.type || 'FEED'}
                                        </span>
                                        {post.recurrenceTotal && (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400`}>
                                                Repeat: {post.recurrenceCurrent}/{post.recurrenceTotal}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                        {format(new Date(post.scheduledTime), 'PPp')}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{post.caption}</p>
                            </div>

                            {/* Actions - visible on hover for desktop, always allow access via layout if needed, but for now absolute positioning on right */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingPost(post)}
                                    className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Post"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Post"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
