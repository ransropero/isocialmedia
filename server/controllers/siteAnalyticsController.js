const { db, admin } = require('../config/firebase');

exports.trackSiteVisit = async (req, res) => {
    try {
        const { path, source, referrer } = req.body;

        await db.collection('site_visits').add({
            path: path || '/',
            source: source || 'direct',
            referrer: referrer || '',
            userAgent: req.get('User-Agent'),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error tracking site visit:', error);
        res.status(500).json({ message: 'Server error tracking visit' });
    }
};

exports.getSiteAnalytics = async (req, res) => {
    try {
        const { range = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (range) {
            case 'day': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
            case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
            case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
            case 'month':
            default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        }

        const visitsSnapshot = await db.collection('site_visits')
            .where('timestamp', '>=', startDate)
            .get();

        const visits = visitsSnapshot.docs.map(doc => doc.data());

        // Process history
        const historyRaw = {};
        visits.forEach(visit => {
            if (visit.timestamp) {
                const date = visit.timestamp.toDate().toISOString().split('T')[0];
                if (!historyRaw[date]) historyRaw[date] = { date, count: 0 };
                historyRaw[date].count++;
            }
        });

        const history = Object.values(historyRaw).sort((a, b) => a.date.localeCompare(b.date));

        // Process path stats
        const pathStats = {};
        visits.forEach(visit => {
            const p = visit.path || '/';
            pathStats[p] = (pathStats[p] || 0) + 1;
        });

        const topPages = Object.keys(pathStats).map(p => ({
            path: p,
            count: pathStats[p]
        })).sort((a, b) => b.count - a.count);

        // Process source stats
        const sourceStats = {};
        visits.forEach(visit => {
            const src = visit.source || 'direct';
            sourceStats[src] = (sourceStats[src] || 0) + 1;
        });

        const totalBySource = Object.keys(sourceStats).map(source => ({
            source,
            count: sourceStats[source]
        })).sort((a, b) => b.count - a.count);

        res.json({
            today: visits.filter(v => v.timestamp && v.timestamp.toDate() >= new Date(now.setHours(0, 0, 0, 0))).length,
            week: visits.filter(v => v.timestamp && v.timestamp.toDate() >= new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)).length,
            month: visits.length,
            topPages,
            totalBySource,
            history
        });
    } catch (error) {
        console.error('Error getting site analytics:', error);
        res.status(500).json({ message: 'Server error loading analytics' });
    }
};
