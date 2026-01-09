'use client';

import { useState, useEffect } from 'react';
import { createPost, getAccounts } from '../services/api';
import { Calendar, Upload, Instagram, Loader2, ChevronDown } from 'lucide-react';

import { format } from 'date-fns';

export default function PostComposer({ onPostCreated }) {
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [scheduledTime, setScheduledTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [postType, setPostType] = useState('FEED');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceInterval, setRecurrenceInterval] = useState(1);
    const [recurrenceTotal, setRecurrenceTotal] = useState(2);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await getAccounts();
            setAccounts(response.data);
            if (response.data.length > 0) {
                setSelectedAccount(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !scheduledTime || !selectedAccount) return;


        setLoading(true);
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('image', file);
        formData.append('scheduledTime', scheduledTime);
        formData.append('accountId', selectedAccount);
        formData.append('type', postType);
        if (isRecurring) {
            formData.append('recurrenceInterval', recurrenceInterval);
            formData.append('recurrenceTotal', recurrenceTotal);
        }


        try {
            await createPost(formData);
            setCaption('');
            setFile(null);
            setScheduledTime('');
            setPostType('FEED');
            setIsRecurring(false);
            setRecurrenceInterval(1);
            setRecurrenceTotal(2);
            if (onPostCreated) onPostCreated();
            alert('Post scheduled successfully!');
        } catch (error) {
            console.error('Failed to create post', error);
            alert('Failed to schedule post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Instagram className="w-5 h-5 text-pink-500" />
                New Post
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Select Account
                    </label>
                    <div className="relative">
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 dark:text-zinc-100 pr-8"
                        >
                            {accounts.length === 0 ? (
                                <option value="">No accounts connected</option>
                            ) : (
                                accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.instagramId})
                                    </option>
                                ))
                            )}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div>

                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Caption
                    </label>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 dark:text-zinc-100"
                        rows="4"
                        placeholder="Write a caption..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Post Type
                        </label>
                        <div className="flex gap-4 p-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="postType"
                                    value="FEED"
                                    checked={postType === 'FEED'}
                                    onChange={(e) => setPostType(e.target.value)}
                                    className="accent-pink-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Feed Post</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="postType"
                                    value="STORY"
                                    checked={postType === 'STORY'}
                                    onChange={(e) => setPostType(e.target.value)}
                                    className="accent-pink-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Story</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Image
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{file.name}</p>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Click to upload</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Schedule Time
                        </label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 dark:text-zinc-100"
                            />
                            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 mb-4">
                            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="recurrence"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="rounded border-zinc-300 text-pink-500 focus:ring-pink-500"
                            />
                            <label htmlFor="recurrence" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
                                Repeat Post?
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                        Interval (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={recurrenceInterval}
                                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                        Total Repetitions
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        value={recurrenceTotal}
                                        onChange={(e) => setRecurrenceTotal(e.target.value)}
                                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !file || !scheduledTime || !selectedAccount}

                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Post'}
                </button>
            </form>
        </div>
    );
}
