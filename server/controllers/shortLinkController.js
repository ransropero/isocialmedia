const { db, admin } = require('../config/firebase');

// Cache para links resolvidos para evitar excesso de leituras no Firestore
const shortLinkCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função auxiliar para gerar código aleatório
function generateRandomCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Obter limite de links por plano
function getLimitByPlan(plan) {
    switch (plan) {
        case 'pro': return 50;
        case 'growth': return 10;
        default: return 3; // free / trial
    }
}

// 1. Criar Link Encurtador
exports.createShortLink = async (req, res) => {
    try {
        const { originalUrl, title, customCode, expiresAt } = req.body;
        const user = req.user;

        if (!originalUrl) {
            return res.status(400).json({ message: 'URL original é obrigatória.' });
        }

        // Buscar quantidade atual de links criados pelo usuário
        const countSnapshot = await db.collection('short_links')
            .where('userId', '==', user.id)
            .count()
            .get();
        const currentCount = countSnapshot.data().count;
        const limit = getLimitByPlan(user.plan);

        if (currentCount >= limit) {
            return res.status(403).json({
                message: `Limite de links atingido para seu plano (${user.plan}). Limite: ${limit}.`,
                limit,
                current: currentCount
            });
        }

        // Validar e definir shortCode
        let shortCode = customCode ? customCode.trim().replace(/[^a-zA-Z0-9_-]/g, '') : '';
        if (shortCode) {
            // Verificar duplicidade
            const codeCheck = await db.collection('short_links')
                .where('shortCode', '==', shortCode)
                .get();
            if (!codeCheck.empty) {
                return res.status(400).json({ message: 'Este código de link personalizado já está em uso.' });
            }
        } else {
            // Gerar código aleatório e garantir unicidade
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 5) {
                shortCode = generateRandomCode(6);
                const codeCheck = await db.collection('short_links')
                    .where('shortCode', '==', shortCode)
                    .get();
                if (codeCheck.empty) {
                    isUnique = true;
                }
                attempts++;
            }
        }

        // Configurar expiração
        let finalExpiration = null;
        if (user.plan !== 'pro' && user.plan !== 'growth') {
            // Free tem limite de expiração de até 30 dias obrigatório
            const maxFreeExpiry = new Date();
            maxFreeExpiry.setDate(maxFreeExpiry.getDate() + 30);
            
            if (expiresAt) {
                const userExpiryDate = new Date(expiresAt);
                if (userExpiryDate > maxFreeExpiry) {
                    finalExpiration = maxFreeExpiry;
                } else {
                    finalExpiration = userExpiryDate;
                }
            } else {
                finalExpiration = maxFreeExpiry;
            }
        } else {
            // Growth e Pro têm expiração opcional
            if (expiresAt) {
                finalExpiration = new Date(expiresAt);
            }
        }

        const shortLinkData = {
            shortCode,
            originalUrl,
            title: title || originalUrl,
            expiresAt: finalExpiration ? admin.firestore.Timestamp.fromDate(finalExpiration) : null,
            userId: user.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('short_links').add(shortLinkData);

        res.status(201).json({
            id: docRef.id,
            ...shortLinkData,
            expiresAt: finalExpiration ? finalExpiration.toISOString() : null
        });
    } catch (error) {
        console.error('Erro ao criar link encurtado:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};

// 2. Listar Links do Usuário
exports.getMyShortLinks = async (req, res) => {
    try {
        let snapshot;
        if (req.user.isAdmin) {
            snapshot = await db.collection('short_links').get();
        } else {
            snapshot = await db.collection('short_links').where('userId', '==', req.user.id).get();
        }

        const shortLinks = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : null
            };
        });

        res.json(shortLinks);
    } catch (error) {
        console.error('Erro ao listar links encurtados:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};

// 3. Atualizar Link
exports.updateShortLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { originalUrl, title, expiresAt } = req.body;
        const user = req.user;

        const docRef = db.collection('short_links').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Link não encontrado.' });
        }

        const currentData = doc.data();
        if (currentData.userId !== user.id && !user.isAdmin) {
            return res.status(403).json({ message: 'Não autorizado.' });
        }

        // Tratar expiração baseado no plano
        let finalExpiration = currentData.expiresAt ? currentData.expiresAt.toDate() : null;
        if (expiresAt !== undefined) {
            if (expiresAt === null) {
                if (user.plan !== 'pro' && user.plan !== 'growth') {
                    // Free não pode remover a expiração, define para 30 dias a partir da criação
                    const maxFreeExpiry = currentData.createdAt ? currentData.createdAt.toDate() : new Date();
                    maxFreeExpiry.setDate(maxFreeExpiry.getDate() + 30);
                    finalExpiration = maxFreeExpiry;
                } else {
                    finalExpiration = null;
                }
            } else {
                const newExpiry = new Date(expiresAt);
                if (user.plan !== 'pro' && user.plan !== 'growth') {
                    const maxFreeExpiry = currentData.createdAt ? currentData.createdAt.toDate() : new Date();
                    maxFreeExpiry.setDate(maxFreeExpiry.getDate() + 30);
                    if (newExpiry > maxFreeExpiry) {
                        finalExpiration = maxFreeExpiry;
                    } else {
                        finalExpiration = newExpiry;
                    }
                } else {
                    finalExpiration = newExpiry;
                }
            }
        }

        const updates = {
            originalUrl: originalUrl || currentData.originalUrl,
            title: title !== undefined ? title : currentData.title,
            expiresAt: finalExpiration ? admin.firestore.Timestamp.fromDate(finalExpiration) : null
        };

        await docRef.update(updates);

        // Limpar caches
        shortLinkCache.delete(currentData.shortCode);

        res.json({
            id,
            ...updates,
            expiresAt: finalExpiration ? finalExpiration.toISOString() : null
        });
    } catch (error) {
        console.error('Erro ao atualizar link:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};

// 4. Deletar Link
exports.deleteShortLink = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const docRef = db.collection('short_links').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Link não encontrado.' });
        }

        const currentData = doc.data();
        if (currentData.userId !== user.id && !user.isAdmin) {
            return res.status(403).json({ message: 'Não autorizado.' });
        }

        await docRef.delete();

        // Deletar também cliques correspondentes em lote
        const clicksSnapshot = await db.collection('short_link_clicks')
            .where('shortLinkId', '==', id)
            .get();
        
        if (!clicksSnapshot.empty) {
            const batch = db.batch();
            clicksSnapshot.docs.forEach(clickDoc => {
                batch.delete(clickDoc.ref);
            });
            await batch.commit();
        }

        shortLinkCache.delete(currentData.shortCode);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar link:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};

// 5. Resolver Link Encurtado (Público)
exports.resolveShortLink = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const nowTime = Date.now();
        let linkData = null;

        // Verificar Cache
        const cached = shortLinkCache.get(shortCode);
        if (cached && (nowTime - cached.timestamp < CACHE_TTL)) {
            linkData = cached.data;
        } else {
            const snapshot = await db.collection('short_links')
                .where('shortCode', '==', shortCode)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                linkData = {
                    id: doc.id,
                    ...doc.data()
                };
                shortLinkCache.set(shortCode, { data: linkData, timestamp: nowTime });
            }
        }

        if (!linkData) {
            return res.status(404).json({ message: 'Link não encontrado.' });
        }

        // Verificar Expiração
        const now = new Date();
        if (linkData.expiresAt) {
            const expiry = linkData.expiresAt.toDate ? linkData.expiresAt.toDate() : new Date(linkData.expiresAt);
            if (now > expiry) {
                return res.json({ originalUrl: linkData.originalUrl, expired: true });
            }
        }

        // Track de Clique (Assíncrono no background)
        const userAgent = req.get('User-Agent') || '';
        const referrer = req.get('Referrer') || 'Direct';
        let device = 'Desktop';
        if (/mobile/i.test(userAgent)) device = 'Mobile';
        if (/tablet/i.test(userAgent)) device = 'Tablet';

        db.collection('short_link_clicks').add({
            shortLinkId: linkData.id,
            shortCode,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            referrer: referrer.startsWith('http') ? new URL(referrer).hostname : referrer,
            device
        }).catch(err => console.error('Erro ao registrar clique de shortlink:', err));

        res.json({ originalUrl: linkData.originalUrl, expired: false });
    } catch (error) {
        console.error('Erro ao resolver link encurtado:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};

// 6. Obter Métricas do Link
exports.getShortLinkAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const doc = await db.collection('short_links').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Link não encontrado.' });
        }

        const linkData = doc.data();
        if (linkData.userId !== user.id && !user.isAdmin) {
            return res.status(403).json({ message: 'Não autorizado.' });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Últimos 30 dias

        const clicksSnapshot = await db.collection('short_link_clicks')
            .where('shortLinkId', '==', id)
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .get();

        const clicks = clicksSnapshot.docs.map(clickDoc => {
            const cData = clickDoc.data();
            return {
                ...cData,
                timestamp: cData.timestamp ? cData.timestamp.toDate() : new Date()
            };
        });

        // 1. Cliques por dia
        const clicksByDay = {};
        for (let i = 0; i < 30; i++) {
            const dateStr = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            clicksByDay[dateStr] = 0;
        }

        clicks.forEach(click => {
            const dateStr = click.timestamp.toISOString().split('T')[0];
            if (clicksByDay[dateStr] !== undefined) {
                clicksByDay[dateStr]++;
            }
        });

        const history = Object.keys(clicksByDay).map(date => ({
            date,
            count: clicksByDay[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        // 2. Dispositivos
        const devices = { Mobile: 0, Tablet: 0, Desktop: 0 };
        clicks.forEach(click => {
            const dev = click.device || 'Desktop';
            devices[dev] = (devices[dev] || 0) + 1;
        });

        // 3. Referrers
        const referrersMap = {};
        clicks.forEach(click => {
            const ref = click.referrer || 'Direct';
            referrersMap[ref] = (referrersMap[ref] || 0) + 1;
        });

        const referrers = Object.keys(referrersMap).map(name => ({
            name,
            count: referrersMap[name]
        })).sort((a, b) => b.count - a.count);

        res.json({
            totalClicks: clicks.length,
            history,
            devices,
            referrers
        });
    } catch (error) {
        console.error('Erro ao buscar métricas do link encurtado:', error);
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
    }
};
