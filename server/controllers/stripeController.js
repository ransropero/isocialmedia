const getStripe = () => {
    const rawKey = process.env.STRIPE_SECRET_KEY;
    if (!rawKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada no servidor (.env).');
    }
    const apiKey = rawKey.replace(/['"\r\n\t ]/g, '');
    return require('stripe')(apiKey, {
        apiVersion: '2026-05-27.dahlia',
    });
};
const { db } = require('../config/firebase');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!['growth', 'pro'].includes(plan)) {
            return res.status(400).json({ message: 'Plano inválido selecionado.' });
        }

        let priceId = '';
        if (plan === 'growth') {
            priceId = process.env.STRIPE_PRICE_GROWTH_ID || 'price_1PgrowthMock';
        } else if (plan === 'pro') {
            priceId = process.env.STRIPE_PRICE_PRO_ID || 'price_1PproMock';
        }

        let stripeCustomerId = req.user.stripeCustomerId;

        // If user doesn't have a Stripe Customer, create one
        if (!stripeCustomerId) {
            const customer = await getStripe().customers.create({
                email: req.user.email,
                metadata: { userId: req.user.id }
            });
            stripeCustomerId = customer.id;
            await db.collection('users').doc(req.user.id).update({ stripeCustomerId });
        }

        let session;
        try {
            session = await getStripe().checkout.sessions.create({
                customer: stripeCustomerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=success`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=cancel`,
            });
        } catch (checkoutError) {
            // Se o customerID salvo no banco pertencer a outro ambiente (ex: chaves de teste) e não existir mais
            if (checkoutError.code === 'resource_missing' && checkoutError.message.includes('No such customer')) {
                console.log(`Customer ${stripeCustomerId} não existe no ambiente Stripe atual. Criando novo...`);
                const customer = await getStripe().customers.create({
                    email: req.user.email,
                    metadata: { userId: req.user.id }
                });
                stripeCustomerId = customer.id;
                await db.collection('users').doc(req.user.id).update({ stripeCustomerId });

                // Tentar novamente com o novo customerId
                session = await getStripe().checkout.sessions.create({
                    customer: stripeCustomerId,
                    mode: 'subscription',
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=success`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=cancel`,
                });
            } else {
                throw checkoutError;
            }
        }

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ message: 'Erro ao criar sessão de checkout do Stripe', error: error.message });
    }
};

exports.createPortalSession = async (req, res) => {
    try {
        let stripeCustomerId = req.user.stripeCustomerId;

        // Se por algum motivo o usuário não tiver Customer ID, criamos um na hora
        if (!stripeCustomerId) {
            const customer = await getStripe().customers.create({
                email: req.user.email,
                metadata: { userId: req.user.id }
            });
            stripeCustomerId = customer.id;
            await db.collection('users').doc(req.user.id).update({ stripeCustomerId });
        }

        let session;
        try {
            session = await getStripe().billingPortal.sessions.create({
                customer: stripeCustomerId,
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/account`,
            });
        } catch (portalError) {
            // Se o customerID salvo no banco pertencer a outro ambiente e não existir
            if (portalError.code === 'resource_missing' && portalError.message.includes('No such customer')) {
                console.log(`Customer ${stripeCustomerId} não existe no ambiente Stripe atual. Criando novo no Portal...`);
                const customer = await getStripe().customers.create({
                    email: req.user.email,
                    metadata: { userId: req.user.id }
                });
                stripeCustomerId = customer.id;
                await db.collection('users').doc(req.user.id).update({ stripeCustomerId });

                session = await getStripe().billingPortal.sessions.create({
                    customer: stripeCustomerId,
                    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/account`,
                });
            } else {
                throw portalError;
            }
        }

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Portal Error:', error);
        res.status(500).json({ message: 'Erro ao criar sessão do portal de faturamento', error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = getStripe().webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                // Buscar assinatura para obter o id do preço
                const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;

                let plan = 'start';
                if (priceId === process.env.STRIPE_PRICE_GROWTH_ID) {
                    plan = 'growth';
                } else if (priceId === process.env.STRIPE_PRICE_PRO_ID) {
                    plan = 'pro';
                }

                const usersRef = db.collection('users');
                const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();
                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    await userDoc.ref.update({
                        plan,
                        stripeSubscriptionId: subscriptionId
                    });
                    console.log(`Plan updated to ${plan} for user ${userDoc.id}`);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const subscriptionId = subscription.id;
                const priceId = subscription.items.data[0].price.id;

                let plan = 'start';
                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    if (priceId === process.env.STRIPE_PRICE_GROWTH_ID) {
                        plan = 'growth';
                    } else if (priceId === process.env.STRIPE_PRICE_PRO_ID) {
                        plan = 'pro';
                    }
                }

                const usersRef = db.collection('users');
                const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();
                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    await userDoc.ref.update({
                        plan,
                        stripeSubscriptionId: subscriptionId
                    });
                    console.log(`Subscription updated for user ${userDoc.id} - plan: ${plan}`);
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const usersRef = db.collection('users');
                const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();
                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    await userDoc.ref.update({
                        plan: 'start',
                        stripeSubscriptionId: null
                    });
                    console.log(`Subscription deleted/canceled for user ${userDoc.id} - plan reset to start`);
                }
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handling error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

exports.verifySubscriptionStatus = async (req, res) => {
    try {
        const stripeCustomerId = req.user.stripeCustomerId;
        if (!stripeCustomerId) {
            return res.json({ plan: req.user.plan || 'start' });
        }

        // Listar assinaturas ativas para esse customer
        const subscriptions = await getStripe().subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
            limit: 1
        });

        let plan = 'start';
        let subscriptionId = null;

        if (subscriptions.data.length > 0) {
            const activeSub = subscriptions.data[0];
            subscriptionId = activeSub.id;
            const priceId = activeSub.items.data[0].price.id;

            if (priceId === process.env.STRIPE_PRICE_GROWTH_ID) {
                plan = 'growth';
            } else if (priceId === process.env.STRIPE_PRICE_PRO_ID) {
                plan = 'pro';
            }
        }

        // Atualizar plano se houver diferença
        if (req.user.plan !== plan || req.user.stripeSubscriptionId !== subscriptionId) {
            await db.collection('users').doc(req.user.id).update({
                plan,
                stripeSubscriptionId: subscriptionId
            });
            console.log(`Plano do usuário ${req.user.id} atualizado via verificação direta para: ${plan}`);
        }

        res.json({ plan });
    } catch (error) {
        console.error('Verify Subscription Error:', error);
        res.status(500).json({ message: 'Erro ao verificar assinatura', error: error.message });
    }
};
