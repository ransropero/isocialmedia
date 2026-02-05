const Post = require('../models/Post');
const { Op } = require('sequelize');
const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const { decrypt } = require('../utils/encryption');
const fs = require('fs');
const path = require('path');

const { getS3Object } = require('./storage');

// Helper to get file buffer
const getFile = async (filePath) => {
    if (filePath.startsWith('http')) {
        return await getS3Object(filePath);
    }
    // Fallback for legacy local files
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const absolutePath = path.resolve(process.cwd(), relativePath);
    return fs.readFileSync(absolutePath);
};

const publishToInstagram = async (post) => {
    console.log(`Publishing post ${post.id} (${post.type || 'FEED'}) to Instagram via Private API...`);

    // Eager load account to be safe, or just rely on getAccount
    const account = await post.getAccount();

    if (!account) {
        throw new Error('Account not found for this post (accountId is null or invalid)');
    }

    const { username, password } = account;
    const decryptedPassword = decrypt(password);

    if (!decryptedPassword) {
        throw new Error('Failed to decrypt password');
    }

    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    try {
        // Login with retry logic for challenges
        await ig.simulate.preLoginFlow();

        // Retry loop for login to give user time to approve "This was me" if challenge occurs
        const MAX_RETRIES = 6; // 6 attempts * 5 seconds = 30 seconds total wait
        let loggedIn = false;

        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                await ig.account.login(username, decryptedPassword);
                console.log(`Logged in as ${username}`);
                loggedIn = true;
                break; // Success
            } catch (err) {
                if (err.name === 'IgCheckpointError' || err.message.includes('challenge')) {
                    console.log(`[Scheduler] Checkpoint hit for ${username} (Attempt ${i + 1}/${MAX_RETRIES}). Waiting 5s...`);
                    // Try to resolve challenge automatically if possible (often needs input, but this triggers the notification)
                    try { await ig.challenge.auto(true); } catch (e) { /* ignore challenge auto error */ }

                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                throw err;
            }
        }

        if (!loggedIn) {
            throw new Error('Login timed out during publication. Challenge not resolved.');
        }

        // Get image buffer
        const imageBuffer = await getFile(post.imageUrl);

        let publishResult;
        if (post.type === 'STORY') {
            publishResult = await ig.publish.story({
                file: imageBuffer,
                // story doesn't usually take a caption in the same metadata way,
                // usually one burns text into the image or uses stickers.
                // We'll ignore caption for simple story publishing or maybe implement stickers later.
                // For now, just image.
            });
            console.log(`Published Story to Instagram. ID: ${publishResult.media.pk}`);
        } else {
            // Default to FEED
            publishResult = await ig.publish.photo({
                file: imageBuffer,
                caption: post.caption,
            });
            console.log(`Published Feed Post to Instagram. ID: ${publishResult.media.pk}`);
        }

        post.instagramId = publishResult.media.pk;
        return true;

    } catch (error) {
        console.error('Instagram Private API Error:', error);
        throw error;
    }
};

exports.publishDuePosts = async () => {
    try {
        const now = new Date();
        const duePosts = await Post.findAll({
            where: {
                status: 'SCHEDULED',
                scheduledTime: {
                    [Op.lte]: now,
                },
            },
        });

        for (const post of duePosts) {
            try {
                const success = await publishToInstagram(post);
                if (success) {
                    post.status = 'PUBLISHED';
                    await post.save();
                    console.log(`Post ${post.id} published successfully.`);

                    // Handle Recurrence
                    if (post.recurrenceInterval && post.recurrenceTotal && post.recurrenceCurrent < post.recurrenceTotal) {
                        try {
                            const nextScheduledTime = new Date(post.scheduledTime);
                            nextScheduledTime.setDate(nextScheduledTime.getDate() + post.recurrenceInterval);

                            await Post.create({
                                caption: post.caption,
                                imageUrl: post.imageUrl,
                                scheduledTime: nextScheduledTime,
                                status: 'SCHEDULED',
                                accountId: post.accountId,
                                userId: post.userId,
                                type: post.type,
                                recurrenceGroupId: post.recurrenceGroupId,
                                recurrenceInterval: post.recurrenceInterval,
                                recurrenceTotal: post.recurrenceTotal,
                                recurrenceCurrent: post.recurrenceCurrent + 1
                            });
                            console.log(`Created next recurring post for group ${post.recurrenceGroupId}`);
                        } catch (recErr) {
                            console.error('Failed to create recurring post:', recErr);
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to publish post ${post.id}:`, err);
                post.status = 'FAILED';
                await post.save();
            }
        }
    } catch (error) {
        console.error('Error in scheduler:', error);
    }
};
