const { db, admin } = require('../config/firebase');
const { uploadToR2 } = require('../services/storage');
const axios = require('axios');
const cheerio = require('cheerio');

const bioCache = new Map();
const BIO_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

exports.getBioPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const nowTime = Date.now();
        const cached = bioCache.get(slug);
        let bioPage, id, userPlan;

        if (cached && (nowTime - cached.timestamp < BIO_CACHE_TTL)) {
            bioPage = cached.bioPage;
            id = cached.id;
            userPlan = cached.userPlan;
        } else {
            const snapshot = await db.collection('bio_pages').where('slug', '==', slug).get();
            if (snapshot.empty) {
                return res.status(404).json({ message: 'Page not found' });
            }

            bioPage = snapshot.docs[0].data();
            id = snapshot.docs[0].id;

            // Fetch owner's plan
            const userDoc = await db.collection('users').doc(bioPage.userId).get();
            userPlan = userDoc.exists ? userDoc.data().plan : 'start';

            bioCache.set(slug, { bioPage, id, userPlan, timestamp: nowTime });
        }

        // Filter links based on scheduling (done dynamically on every request to respect start/end times!)
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
        let snapshot;
        let usersMap = {};

        if (req.user.isAdmin) {
            snapshot = await db.collection('bio_pages').get();
            // Fetch users to map emails
            const usersSnapshot = await db.collection('users').get();
            usersSnapshot.docs.forEach(doc => {
                usersMap[doc.id] = doc.data().email;
            });
        } else {
            snapshot = await db.collection('bio_pages').where('userId', '==', req.user.id).get();
        }

        const bioPages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                userEmail: req.user.isAdmin ? (usersMap[data.userId] || 'Desconhecido') : undefined
            };
        });
        res.json(bioPages);
    } catch (error) {
        console.error('Error fetching user bio pages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createBioPage = async (req, res) => {
    try {
        const { slug, title, description, backgroundColor, textColor, buttonColor, descriptionColor, buttonsTransparent, fontFamily, links, profileImageUrl, backgroundImageUrl, backgroundImages, showLogo, profileStyle } = req.body;

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
            profileStyle: profileStyle || 'instagram',
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
        bioCache.delete(slug);

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

        if (currentData.slug) bioCache.delete(currentData.slug);
        if (body.slug) bioCache.delete(body.slug);

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
            profileStyle: body.profileStyle !== undefined ? body.profileStyle : currentData.profileStyle,
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

        // Remove undefined values to prevent Firestore error
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

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

        const currentData = doc.data();
        if (currentData.slug) bioCache.delete(currentData.slug);

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
        const publicUrl = await uploadToR2(req.file, slug);
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

exports.trackVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { source, referrer, country: clientCountry, region: clientRegion, city: clientCity, device } = req.body;

        // Tentar obter IP do cliente
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const ip = rawIp.split(',')[0].trim();

        let country = clientCountry || 'Desconhecido';
        let region = clientRegion || 'Desconhecido';
        let city = clientCity || 'Desconhecido';

        // Se o frontend não enviar dados geográficos válidos, resolvemos pelo IP
        if (country === 'Desconhecido' && ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('10.') && !ip.startsWith('192.168.')) {
            try {
                // Tenta ipapi.co
                const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 1500 });
                if (geoRes.data && !geoRes.data.error) {
                    country = geoRes.data.country_name || 'Desconhecido';
                    region = geoRes.data.region || 'Desconhecido';
                    city = geoRes.data.city || 'Desconhecido';
                }
            } catch (geoError) {
                console.error(`Erro ao obter geolocalização ipapi para IP ${ip}:`, geoError.message);
                // Fallback para ip-api.com
                try {
                    const geoResFallback = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 1500 });
                    if (geoResFallback.data && geoResFallback.data.status === 'success') {
                        country = geoResFallback.data.country || 'Desconhecido';
                        region = geoResFallback.data.regionName || 'Desconhecido';
                        city = geoResFallback.data.city || 'Desconhecido';
                    }
                } catch (fallbackError) {
                    console.error(`Fallback ip-api para IP ${ip} também falhou:`, fallbackError.message);
                }
            }
        }

        await db.collection('bio_visits').add({
            bioPageId: id,
            source: source || 'direct',
            referrer: referrer || '',
            country,
            region,
            city,
            device: device || 'Desktop',
            userAgent: req.get('User-Agent'),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error tracking visit:', error);
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

        if (bioPage.userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

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

        // Process history
        const historyRaw = {};
        clicks.forEach(click => {
            const date = click.timestamp.toDate().toISOString().split('T')[0];
            if (!historyRaw[date]) historyRaw[date] = { date, count: 0, visitCount: 0 };
            historyRaw[date].count++;
        });

        // Get visits data
        const visitsSnapshot = await db.collection('bio_visits')
            .where('bioPageId', '==', id)
            .where('timestamp', '>=', startDate)
            .get();

        const visits = visitsSnapshot.docs.map(doc => doc.data());

        visits.forEach(visit => {
            const date = visit.timestamp.toDate().toISOString().split('T')[0];
            if (!historyRaw[date]) historyRaw[date] = { date, count: 0, visitCount: 0 };
            historyRaw[date].visitCount++;
        });

        const history = Object.values(historyRaw).sort((a, b) => a.date.localeCompare(b.date));

        // Process clicks into heatmap for Pro/Growth users
        let heatmap = [];
        if (req.user && (req.user.plan === 'pro' || req.user.plan === 'growth')) {
            const heatmapRaw = {};
            clicks.forEach(click => {
                const dateObj = click.timestamp.toDate();
                const day = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
                const hour = dateObj.getHours(); // 0 to 23
                const key = `${day}-${hour}`;
                if (!heatmapRaw[key]) {
                    heatmapRaw[key] = { day, hour, count: 0 };
                }
                heatmapRaw[key].count++;
            });
            heatmap = Object.values(heatmapRaw);
        }

        const sourceStats = {};
        visits.forEach(visit => {
            const src = visit.source || 'direct';
            sourceStats[src] = (sourceStats[src] || 0) + 1;
        });

        const totalBySource = Object.keys(sourceStats).map(source => ({
            source,
            count: sourceStats[source]
        })).sort((a, b) => b.count - a.count);

        // Processar Geolocalização e Dispositivos
        let countries = [];
        let regions = [];
        let cities = [];
        let devices = { Mobile: 0, Desktop: 0 };
        let growth = { visitsGrowthPercent: 0, prevVisitsCount: 0 };

        const isPremium = req.user && (req.user.plan === 'pro' || req.user.plan === 'growth' || req.user.isAdmin);

        if (isPremium) {
            const countriesMap = {};
            const regionsMap = {};
            const citiesMap = {};

            visits.forEach(v => {
                const dev = v.device || 'Mobile';
                devices[dev] = (devices[dev] || 0) + 1;

                const country = v.country || 'Desconhecido';
                const region = v.region || 'Desconhecido';
                const city = v.city || 'Desconhecido';

                countriesMap[country] = (countriesMap[country] || 0) + 1;
                regionsMap[region] = (regionsMap[region] || 0) + 1;
                citiesMap[city] = (citiesMap[city] || 0) + 1;
            });

            countries = Object.keys(countriesMap).map(c => ({ name: c, count: countriesMap[c] })).sort((a, b) => b.count - a.count);
            regions = Object.keys(regionsMap).map(r => ({ name: r, count: regionsMap[r] })).sort((a, b) => b.count - a.count);
            cities = Object.keys(citiesMap).map(c => ({ name: c, count: citiesMap[c] })).sort((a, b) => b.count - a.count);

            // Calcular crescimento com o período anterior
            const periodDurationMs = now.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - periodDurationMs);
            const prevVisitsSnapshot = await db.collection('bio_visits')
                .where('bioPageId', '==', id)
                .where('timestamp', '>=', prevStartDate)
                .where('timestamp', '<', startDate)
                .get();

            const prevVisitsCount = prevVisitsSnapshot.size;
            const currentVisitsCount = visits.length;
            let visitsGrowthPercent = 0;
            if (prevVisitsCount > 0) {
                visitsGrowthPercent = parseFloat((((currentVisitsCount - prevVisitsCount) / prevVisitsCount) * 100).toFixed(1));
            } else if (currentVisitsCount > 0) {
                visitsGrowthPercent = 100.0;
            }
            growth = { visitsGrowthPercent, prevVisitsCount };
        }

        res.json({
            today: clicks.filter(c => c.timestamp.toDate() >= new Date(new Date().setHours(0, 0, 0, 0))).length,
            todayVisits: visits.filter(v => v.timestamp.toDate() >= new Date(new Date().setHours(0, 0, 0, 0))).length,
            week: clicks.filter(c => c.timestamp.toDate() >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
            weekVisits: visits.filter(v => v.timestamp.toDate() >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
            month: clicks.length,
            monthVisits: visits.length,
            totalByLink,
            totalBySource,
            heatmap,
            history,
            countries,
            regions,
            cities,
            devices,
            growth
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
exports.getAllSlugs = async (req, res) => {
    try {
        const snapshot = await db.collection('bio_pages').select('slug').get();
        const slugs = snapshot.docs.map(doc => doc.data().slug);
        res.json(slugs);
    } catch (error) {
        console.error('Error fetching all slugs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.importLinktree = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.includes('linktr.ee')) {
            return res.status(400).json({ message: 'URL do Linktree inválida.' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const nextDataScript = $('#__NEXT_DATA__').html();

        let profileData = {
            name: '',
            username: '',
            bio: '',
            profileImageUrl: '',
            links: []
        };

        if (nextDataScript) {
            try {
                const jsonData = JSON.parse(nextDataScript);
                const account = jsonData.props?.pageProps?.account || jsonData.props?.pageProps?.pageData;
                
                if (account) {
                    profileData.name = account.profileTitle || account.username || '';
                    profileData.username = account.username || '';
                    profileData.bio = account.description || account.bio || '';
                    profileData.profileImageUrl = account.profilePictureUrl || account.image || '';
                    
                    const rawLinks = account.links || [];
                    profileData.links = rawLinks
                        .filter(l => l.url && l.title)
                        .map(l => ({
                            title: l.title,
                            url: l.url,
                            type: 'url'
                        }));
                }
            } catch (e) {
                console.error('Error parsing __NEXT_DATA__:', e);
            }
        }

        // Fallback to Meta Tags if __NEXT_DATA__ failed or was incomplete
        if (!profileData.name) profileData.name = $('meta[property="og:title"]').attr('content')?.replace(' | Linktree', '') || '';
        if (!profileData.bio) profileData.bio = $('meta[property="og:description"]').attr('content') || '';
        if (!profileData.profileImageUrl) profileData.profileImageUrl = $('meta[property="og:image"]').attr('content') || '';
        
        if (profileData.links.length === 0) {
            // Very basic fallback for links - might be noisy
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                const title = $(el).text().trim();
                if (href && href.startsWith('http') && !href.includes('linktr.ee') && title) {
                    profileData.links.push({ title, url: href, type: 'url' });
                }
            });
        }

        res.json(profileData);
    } catch (error) {
        console.error('Error importing Linktree:', error);
        res.status(500).json({ message: 'Erro ao importar do Linktree.', error: error.message });
    }
};
