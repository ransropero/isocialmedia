const { db, admin } = require('../config/firebase');
const { IgApiClient } = require('instagram-private-api');
const { decrypt } = require('../utils/encryption');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const getFile = async (url) => {
    if (url.startsWith('http')) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
    const relativePath = url.startsWith('/') ? url.slice(1) : url;
    const absolutePath = path.resolve(process.cwd(), relativePath);
    return fs.readFileSync(absolutePath);
};

const publishToInstagram = async (post) => {
    console.log(`Publishing post ${post.id} (${post.type || 'FEED'}) to Instagram...`);

    const accountDoc = await db.collection('accounts').doc(post.accountId).get();
    if (!accountDoc.exists) {
        throw new Error('Account not found');
    }

    const { username, password } = accountDoc.data();
    const decryptedPassword = decrypt(password);

    if (!decryptedPassword) throw new Error('Failed to decrypt password');

    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(username, decryptedPassword);

        const imageBuffer = await getFile(post.imageUrl);

        let publishResult;
        if (post.type === 'STORY') {
            publishResult = await ig.publish.story({ file: imageBuffer });
        } else {
            publishResult = await ig.publish.photo({ file: imageBuffer, caption: post.caption });
        }

        return publishResult.media.pk;
    } catch (error) {
        console.error('Instagram Error:', error.message);
        throw error;
    }
};

exports.publishDuePosts = async () => {
    try {
        const now = admin.firestore.Timestamp.now();
        const postsRef = db.collection('posts');
        const snapshot = await postsRef
            .where('status', '==', 'SCHEDULED')
            .where('scheduledTime', '<=', now)
            .get();

        if (snapshot.empty) return;

        for (const doc of snapshot.docs) {
            const post = { id: doc.id, ...doc.data() };
            try {
                const igId = await publishToInstagram(post);
                await doc.ref.update({ status: 'PUBLISHED', instagramId: igId });

                // Handle Recurrence
                if (post.recurrenceInterval && post.recurrenceTotal && post.recurrenceCurrent < post.recurrenceTotal) {
                    const nextTime = new Date(post.scheduledTime.toDate());
                    nextTime.setDate(nextTime.getDate() + post.recurrenceInterval);

                    await postsRef.add({
                        ...post,
                        id: undefined, // Let Firestore generate new ID
                        scheduledTime: admin.firestore.Timestamp.fromDate(nextTime),
                        status: 'SCHEDULED',
                        instagramId: null,
                        recurrenceCurrent: post.recurrenceCurrent + 1,
                        createdAt: new Date()
                    });
                }
            } catch (err) {
                console.error(`Failed to publish ${post.id}:`, err.message);
                await doc.ref.update({ status: 'FAILED' });
            }
        }
    } catch (error) {
        console.error('Scheduler Error:', error.message);
    }
};

