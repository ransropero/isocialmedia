const proMiddleware = (req, res, next) => {
    if (req.user && req.user.plan === 'pro') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Acesso restrito. Este módulo requer o plano Pro.',
            requiredPlan: 'pro',
            currentPlan: req.user ? req.user.plan : 'unknown'
        });
    }
};

module.exports = proMiddleware;
