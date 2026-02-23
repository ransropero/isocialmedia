const { db, admin } = require('../config/firebase');
const { uploadToSupabase } = require('../services/storage');

exports.getBioPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const snapshot = await db.collection('bio_pages').where('slug', '==', slug).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const bioPage = snapshot.docs[0].data();
        const id = snapshot.docs[0].id;

        // Fetch owner's plan
        const userDoc = await db.collection('users').doc(bioPage.userId).get();
        const userPlan = userDoc.exists ? userDoc.data().plan : 'start';

        // Filter links based on scheduling
        const now = new Date();
        const activeLinks = (bioPage.links || []).filter(link => {
            const start = link.scheduleStart ? new Date(link.scheduleStart) : null;
            const end = link.scheduleEnd ? new Date(link.scheduleEnd) : null;

            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
        });

        // Sanitize sensitive info for public view
        const sanitizedLinks = activeLinks.map(link => {
            const sanitized = { ...link };
            if (link.password) {
                sanitized.isPasswordProtected = true;
                delete sanitized.password;
                delete sanitized.url; // Hide URL until verified
            }
            return sanitized;
        });

        res.json({
            id,
            ...bioPage,
            userPlan,
            links: sanitizedLinks
        });
    } catch (error) {
        console.error('Error fetching bio page by slug:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyBioPages = async (req, res) => {
    try {
        const snapshot = await db.collection('bio_pages').where('userId', '==', req.user.id).get();
        const bioPages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(bioPages);
    } catch (error) {
        console.error('Error fetching user bio pages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBioPage = async (req, res) => {
    try {
        const { slug, title, description, backgroundColor, textColor, buttonColor, descriptionColor, buttonsTransparent, fontFamily, links, profileImageUrl, backgroundImageUrl, backgroundImages, showLogo } = req.body;

        // Check plan limits
        const user = req.user;
        const pagesRef = db.collection('bio_pages');
        const countSnapshot = await pagesRef.where('userId', '==', user.id).count().get();
        const pageCount = countSnapshot.data().count;
        const limit = user.plan === 'pro' ? 10 : 1;

        if (pageCount >= limit) {
            return res.status(403).json({
                message: `Limite de páginas atingido para o plano ${user.plan === 'pro' ? 'Pro' : 'Trial'}.`,
                limit,
                current: pageCount
            });
        }

        // Duplicate slug check
        const slugSnapshot = await pagesRef.where('slug', '==', slug).get();
        if (!slugSnapshot.empty) {
            return res.status(400).json({ message: 'Link (slug) já está em uso.' });
        }

        const bioPageData = {
            slug,
            title,
            description,
            backgroundColor,
            textColor,
            buttonColor,
            fontFamily,
            profileImageUrl,
            backgroundImageUrl,
            showLogo: user.plan === 'pro' ? showLogo : true,
            descriptionColor: (user.plan === 'pro' || user.plan === 'growth') ? (descriptionColor || textColor || '#ffffff') : (textColor || '#ffffff'),
            buttonsTransparent: (user.plan === 'pro' || user.plan === 'growth') ? (buttonsTransparent !== undefined ? buttonsTransparent : false) : false,
            backgroundImages: (user.plan === 'pro' || user.plan === 'growth') ? (backgroundImages || []).slice(0, 5) : [],
            socials: req.body.socials || {}, // New socials object
            links: (links || []).map(link => {
                // Enforce Pro for password and age restricted links
                if (user.plan !== 'pro') {
                    delete link.password;
                    delete link.requireAge;
                }
                return link;
            }),
            userId: req.user.id,
            createdAt: new Date()
        };

        const docRef = await pagesRef.add(bioPageData);

        res.status(201).json({ id: docRef.id, ...bioPageData });
    } catch (error) {
        console.error('Error creating bio page:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBioPage = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const docRef = db.collection('bio_pages').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const currentData = doc.data();
        if (currentData.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const updates = {
            slug: body.slug || currentData.slug,
            title: body.title !== undefined ? body.title : currentData.title,
            description: body.description !== undefined ? body.description : currentData.description,
            backgroundColor: body.backgroundColor || currentData.backgroundColor,
            textColor: body.textColor || currentData.textColor,
            buttonColor: body.buttonColor || currentData.buttonColor,
            fontFamily: body.fontFamily || currentData.fontFamily,
            descriptionColor: (req.user.plan === 'pro' || req.user.plan === 'growth') ? (body.descriptionColor || currentData.descriptionColor) : currentData.descriptionColor,
            buttonsTransparent: (req.user.plan === 'pro' || req.user.plan === 'growth') ? (body.buttonsTransparent !== undefined ? body.buttonsTransparent : currentData.buttonsTransparent) : false,
            backgroundImages: (req.user.plan === 'pro' || req.user.plan === 'growth') ? (body.backgroundImages !== undefined ? body.backgroundImages.slice(0, 5) : currentData.backgroundImages) : [],
            profileImageUrl: body.profileImageUrl !== undefined ? body.profileImageUrl : currentData.profileImageUrl,
            backgroundImageUrl: body.backgroundImageUrl !== undefined ? body.backgroundImageUrl : currentData.backgroundImageUrl,
            links: body.links !== undefined ? body.links.map(link => {
                if (req.user.plan !== 'pro') {
                    delete link.password;
                    delete link.requireAge;
                }
                return link;
            }) : currentData.links,
            socials: body.socials !== undefined ? body.socials : currentData.socials,
            showLogo: req.user.plan === 'pro' && body.showLogo !== undefined ? body.showLogo : (req.user.plan !== 'pro' ? true : currentData.showLogo)
        };

        await docRef.update(updates);
        res.json({ id, ...updates });
    } catch (error) {
        console.error('Error updating bio page:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteBioPage = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('bio_pages').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (doc.data().userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await docRef.delete();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting bio page:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { slug } = req.body;
        const publicUrl = await uploadToSupabase(req.file, slug);
        res.json({ url: publicUrl });
    } catch (error) {
        console.error('Error uploading bio image:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.trackClick = async (req, res) => {
    try {
        const { id } = req.params;
        const { linkIndex } = req.body;

        await db.collection('bio_clicks').add({
            bioPageId: id,
            linkIndex: linkIndex,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const { range = 'month' } = req.query;

        const doc = await db.collection('bio_pages').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Page not found' });
        }
        const bioPage = doc.data();

        const now = new Date();
        let startDate;

        switch (range) {
            case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
            case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
            case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
            case 'month':
            default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        }

        const clicksSnapshot = await db.collection('bio_clicks')
            .where('bioPageId', '==', id)
            .where('timestamp', '>=', startDate)
            .get();

        const clicks = clicksSnapshot.docs.map(doc => doc.data());

        // Process stats
        const linkStats = {};
        clicks.forEach(click => {
            linkStats[click.linkIndex] = (linkStats[click.linkIndex] || 0) + 1;
        });

        const totalByLink = Object.keys(linkStats).map(index => {
            const idx = parseInt(index);
            const link = bioPage.links[idx];
            return {
                linkIndex: idx,
                count: linkStats[index],
                title: link ? link.title : `Link #${idx + 1}`
            };
        });

        const historyRaw = {};
        clicks.forEach(click => {
            const date = click.timestamp.toDate().toISOString().split('T')[0];
            historyRaw[date] = (historyRaw[date] || 0) + 1;
        });

        const history = Object.keys(historyRaw).map(date => ({
            date,
            count: historyRaw[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        res.json({
            today: clicks.filter(c => c.timestamp.toDate() >= new Date(new Date().setHours(0, 0, 0, 0))).length,
            week: clicks.filter(c => c.timestamp.toDate() >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
            month: clicks.length,
            totalByLink,
            history
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.verifyLinkPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { linkIndex, password } = req.body;

        const doc = await db.collection('bio_pages').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const bioPage = doc.data();
        const link = bioPage.links[linkIndex];

        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        if (!link.password) {
            return res.json({ url: link.url });
        }

        if (link.password === password) {
            res.json({ url: link.url });
        } else {
            res.status(401).json({ message: 'Senha incorreta' });
        }
    } catch (error) {
        console.error('Error verifying link password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
