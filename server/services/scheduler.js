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

const processWhatsAppCampaigns = async () => {
    try {
        const now = admin.firestore.Timestamp.now();
        const nowMs = now.toMillis();
        const today = new Date();
        const todayStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`; // MM-DD
        
        const campaignsRef = db.collection('whatsapp_campaigns');
        const snapshot = await campaignsRef
            .where('status', '==', 'SCHEDULED')
            .get();

        if (snapshot.empty) return;

        const allCampaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 1. Standard Scheduled Campaigns
        const dueStandard = allCampaigns.filter(c => {
            if (c.type === 'BIRTHDAY') return false;
            const scheduled = c.scheduledTime?.toDate ? c.scheduledTime.toDate() : new Date(c.scheduledTime);
            return scheduled <= today;
        });

        // 2. Birthday Campaigns
        const dueBirthday = allCampaigns.filter(c => {
            if (c.type !== 'BIRTHDAY') return false;
            
            // Check time (e.g. "09:00")
            const [hour, minute] = (c.scheduledTimeStr || "09:00").split(':').map(Number);
            const scheduledTimeToday = new Date();
            scheduledTimeToday.setHours(hour, minute, 0, 0);
            
            // Should be due now or past
            if (today < scheduledTimeToday) return false;

            // Avoid double sending today (check lastRunAt)
            if (c.lastRunAt) {
                const lastRun = c.lastRunAt.toDate();
                if (lastRun.toDateString() === today.toDateString()) return false;
            }
            
            return true;
        });

        const dueCampaigns = [...dueStandard, ...dueBirthday];

        if (dueCampaigns.length === 0) return;

        console.log(`[Scheduler] Processing ${dueStandard.length} standard and ${dueBirthday.length} birthday campaigns...`);

        const whatsappService = require('./whatsappService');

        for (const campaign of dueCampaigns) {
            try {
                const isBirthdayType = campaign.type === 'BIRTHDAY';
                const docRef = campaignsRef.doc(campaign.id);
                
                const status = whatsappService.getStatus(campaign.userId);
                if (status !== 'CONNECTED') {
                    console.log(`[Scheduler] Skipping campaign ${campaign.id} - User ${campaign.userId} is not connected (${status})`);
                    continue; 
                }

                if (!isBirthdayType) {
                    await docRef.update({ status: 'PROCESSING' });
                }

                const contactIds = campaign.contactIds || [];
                let successCount = 0;
                let failureCount = 0;

                for (const contactId of contactIds) {
                    const contactDoc = await db.collection('whatsapp_contacts').doc(contactId).get();
                    if (contactDoc.exists) {
                        const contact = contactDoc.data();
                        
                        // If birthday campaign, check if today is their birthday
                        if (isBirthdayType) {
                            if (!contact.birthDate) continue;
                            const bday = new Date(contact.birthDate);
                            const bdayStr = `${(bday.getMonth() + 1).toString().padStart(2, '0')}-${bday.getDate().toString().padStart(2, '0')}`;
                            if (todayStr !== bdayStr) continue;
                            
                            // Log check to prevent double send even if user restarts server
                            const birthdayLogKey = `bday_${campaign.id}_${contactId}_${today.getFullYear()}`;
                            const logRef = db.collection('whatsapp_message_logs').doc(birthdayLogKey);
                            const logDoc = await logRef.get();
                            if (logDoc.exists) continue;
                        }

                        const personalizedMessage = campaign.message.replace(/{{nome}}/gi, contact.name || 'cliente');

                        try {
                            const response = await whatsappService.sendMessage(campaign.userId, contact.phone, personalizedMessage, campaign.imageUrl);
                            const messageId = response?.key?.id;
                            
                            successCount++;
                            
                            const logData = {
                                campaignId: campaign.id,
                                userId: campaign.userId,
                                contactId,
                                phone: contact.phone,
                                name: contact.name || 'cliente',
                                status: 'SENT',
                                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            };

                            if (isBirthdayType) {
                                const birthdayLogKey = `bday_${campaign.id}_${contactId}_${today.getFullYear()}`;
                                await db.collection('whatsapp_message_logs').doc(birthdayLogKey).set(logData);
                            } else if (messageId) {
                                await db.collection('whatsapp_message_logs').doc(messageId).set(logData);
                            }
                            
                            if (contactId !== contactIds[contactIds.length - 1]) {
                                const delay = Math.floor(Math.random() * (25000 - 10000 + 1)) + 10000;
                                await new Promise(resolve => setTimeout(resolve, delay));
                            }
                        } catch (err) {
                            console.error(`Failed to send WhatsApp to ${contact.phone}:`, err.message);
                            failureCount++;
                        }
                    }
                }

                if (isBirthdayType) {
                    // Birthday campaigns stay SCHEDULED but update lastRunAt
                    await docRef.update({ 
                        lastRunAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    await docRef.update({ 
                        status: 'COMPLETED', 
                        sentCount: successCount, 
                        failedCount: failureCount,
                        completedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }

            } catch (err) {
                console.error(`Failed to process campaign ${campaign.id}:`, err.message);
                if (campaign.type !== 'BIRTHDAY') {
                    await campaignsRef.doc(campaign.id).update({ status: 'FAILED', error: err.message });
                }
            }
        }
    } catch (error) {
        console.error('WhatsApp Scheduler Error:', error.message);
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

        if (snapshot.empty) {
            // Even if no posts, check WhatsApp campaigns
            await processWhatsAppCampaigns();
            return;
        }

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

        // After posts, check WhatsApp campaigns
        await processWhatsAppCampaigns();

    } catch (error) {
        console.error('Scheduler Error:', error.message);
    }
};


