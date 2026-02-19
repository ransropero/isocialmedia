const { db, admin } = require('../config/firebase');
const { uploadToSupabase } = require('../services/storage');

exports.createPost = async (req, res) => {
    try {
        const { caption, scheduledTime, accountId, type, recurrenceInterval, recurrenceTotal } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const imageUrl = await uploadToSupabase(req.file);

        let recurrenceGroupId = null;
        let recurrenceCurrent = 1;

        if (recurrenceInterval && recurrenceTotal) {
            recurrenceGroupId = require('crypto').randomUUID();
        }

        const postData = {
            caption,
            imageUrl,
            scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
            status: 'SCHEDULED',
            accountId: accountId || null,
            userId: req.user.id,
            type: type || 'FEED',
            recurrenceGroupId,
            recurrenceInterval: recurrenceInterval ? parseInt(recurrenceInterval) : null,
            recurrenceTotal: recurrenceTotal ? parseInt(recurrenceTotal) : null,
            recurrenceCurrent,
            createdAt: new Date()
        };

        const postDoc = await db.collection('posts').add(postData);

        res.status(201).json({
            id: postDoc.id,
            ...postData,
            scheduledTime: new Date(scheduledTime)
        });
    } catch (error) {
        console.error('Error creating post:', error);
        if (error.Code || error.name === 'AxiosError') {
            console.error('Detailed Upload/API Error:', error.message);
        }
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

exports.getPosts = async (req, res) => {
    try {
        let query = db.collection('posts');
        if (!req.user.isAdmin) {
            query = query.where('userId', '==', req.user.id);
        }

        const snapshot = await query.orderBy('scheduledTime', 'asc').get();
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                scheduledTime: data.scheduledTime ? (data.scheduledTime.toDate ? data.scheduledTime.toDate() : data.scheduledTime) : null
            };
        });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postDoc = await db.collection('posts').doc(id).get();

        if (!postDoc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const postData = postDoc.data();
        if (postData.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.collection('posts').doc(id).delete();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { caption, scheduledTime } = req.body;

        const postRef = db.collection('posts').doc(id);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const postData = postDoc.data();
        if (postData.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updates = {};
        if (caption !== undefined) updates.caption = caption;
        if (scheduledTime) {
            updates.scheduledTime = admin.firestore.Timestamp.fromDate(new Date(scheduledTime));
        }

        await postRef.update(updates);
        res.json({ id, ...postData, ...updates });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

