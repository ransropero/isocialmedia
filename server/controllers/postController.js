const Post = require('../models/Post');
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
            const { v4: uuidv4 } = require('uuid');
            // Or use crypto if uuid not available, but let's assume uuid is standard or use crypto
            // checking package.json next step will confirm, but I can use crypto.randomUUID if node >= 14.17
            // safer to use crypto if I don't see uuid in package.json
            recurrenceGroupId = require('crypto').randomUUID();
        }

        const post = await Post.create({
            caption,
            imageUrl,
            scheduledTime: new Date(scheduledTime),
            status: 'SCHEDULED',
            accountId: accountId ? parseInt(accountId) : null,
            userId: req.user.id,
            type: type || 'FEED',
            recurrenceGroupId,
            recurrenceInterval: recurrenceInterval ? parseInt(recurrenceInterval) : null,
            recurrenceTotal: recurrenceTotal ? parseInt(recurrenceTotal) : null,
            recurrenceCurrent
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        let where = {};
        if (!req.user.isAdmin) {
            where = { userId: req.user.id };
        }
        const posts = await Post.findAll({
            where,
            order: [['scheduledTime', 'ASC']],
            include: [{ model: Post.sequelize.models.Account }] // Optional: Include account details
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
        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await post.destroy();
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

        const post = await Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        post.caption = caption || post.caption;
        if (scheduledTime) {
            post.scheduledTime = new Date(scheduledTime);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
