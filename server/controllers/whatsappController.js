const { db, admin } = require('../config/firebase');
const whatsappService = require('../services/whatsappService');
const { uploadToR2 } = require('../services/storage');

/**
 * Get current connection status for the user
 */
exports.getConnectionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = whatsappService.getStatus(userId);
        
        // If disconnected but we have context/might want to initialize, 
        // we can trigger initialization here or wait for getQR
        res.json({ status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar status da conexão' });
    }
};

/**
 * Get QR Code for connection
 */
exports.getQR = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Ensure client is initialized
        await whatsappService.getClient(userId);
        
        const qr = whatsappService.getQR(userId);
        const status = whatsappService.getStatus(userId);
        
        if (status === 'CONNECTED') {
            return res.json({ status: 'CONNECTED', message: 'Já está conectado' });
        }
        
        if (!qr) {
            return res.json({ 
                status: status, 
                message: status === 'INITIALIZING' ? 'Iniciando navegador...' : 'Aguardando QR Code...' 
            });
        }
        
        res.json({ qr, status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar QR Code' });
    }
};

/**
 * Logout and clear session
 */
exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await whatsappService.logout(userId);
        res.json({ message: 'Desconectado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao desconectar' });
    }
};

/**
 * Legacy Settings getter - kept for compatibility but simplified
 */
exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = whatsappService.getStatus(userId);
        res.json({ 
            status,
            isPro: true // Only Pro users access this controller anyway
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar configurações' });
    }
};

/**
 * Legacy Settings updater - no longer needed for tokens, but kept as a stub if needed
 */
exports.updateSettings = async (req, res) => {
    res.json({ message: 'Use o QR Code para conectar sua conta' });
};

exports.getContacts = async (req, res) => {
    try {
        const snapshot = await db.collection('whatsapp_contacts').get();
        
        const contacts = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(c => c.userId === req.user.id);
        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar contatos' });
    }
};

exports.addContact = async (req, res) => {
    try {
        const contactData = {
            ...req.body,
            userId: req.user.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('whatsapp_contacts').add(contactData);
        res.status(201).json({ id: docRef.id, ...contactData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao adicionar contato' });
    }
};

exports.importContacts = async (req, res) => {
    try {
        const { contacts } = req.body; 
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ message: 'Lista de contatos inválida' });
        }

        const batch = db.batch();
        contacts.forEach(contact => {
            const ref = db.collection('whatsapp_contacts').doc();
            batch.set(ref, {
                ...contact,
                userId: req.user.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        res.json({ message: `${contacts.length} contatos importados com sucesso` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao importar contatos' });
    }
};

exports.getCampaigns = async (req, res) => {
    try {
        const snapshot = await db.collection('whatsapp_campaigns').get();
        
        let campaigns = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(c => c.userId === req.user.id);
        
        campaigns = campaigns.map(data => {
            return {
                ...data,
                scheduledTime: data.scheduledTime?.toDate ? data.scheduledTime.toDate() : data.scheduledTime
            };
        });

        campaigns.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt || 0);
            return dateB - dateA;
        });

        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar campanhas' });
    }
};

exports.createCampaign = async (req, res) => {
    try {
        const { name, message, scheduledTime, type, scheduledTimeStr } = req.body;
        let filters = req.body.filters;

        // Parse filters if they come as a JSON string from FormData
        if (typeof filters === 'string') {
            try {
                filters = JSON.parse(filters);
            } catch (e) {
                filters = {};
            }
        }
        
        let query = db.collection('whatsapp_contacts').where('userId', '==', req.user.id);
        const snapshot = await query.get();
        let targetContacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filters && filters.interest) {
            targetContacts = targetContacts.filter(c => c.interests && c.interests.includes(filters.interest));
        }

        if (targetContacts.length === 0) {
            return res.status(400).json({ message: 'Nenhum contato encontrado com os critérios selecionados' });
        }

        const imageUrl = req.file ? await uploadToR2(req.file, 'whatsapp') : null;

        const campaignData = {
            userId: req.user.id,
            name,
            message,
            filters,
            imageUrl,
            contactIds: targetContacts.map(c => c.id),
            status: 'SCHEDULED',
            type: type || 'STANDARD',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (campaignData.type === 'BIRTHDAY') {
            campaignData.scheduledTimeStr = scheduledTimeStr || "09:00";
            // For birthday campaigns, we don't strictly need scheduledTime, but we set a dummy one for list sorting
            campaignData.scheduledTime = admin.firestore.FieldValue.serverTimestamp();
        } else {
            if (!scheduledTime || isNaN(new Date(scheduledTime).getTime())) {
                return res.status(400).json({ message: 'Data e hora de agendamento inválidas' });
            }
            const scheduledDate = new Date(scheduledTime);
            const seconds = Math.floor(scheduledDate.getTime() / 1000);
            campaignData.scheduledTime = new admin.firestore.Timestamp(seconds, 0);
        }

        const docRef = await db.collection('whatsapp_campaigns').add(campaignData);
        res.status(201).json({ id: docRef.id, ...campaignData, contactCount: targetContacts.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar campanha' });
    }
};
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactRef = db.collection('whatsapp_contacts').doc(id);
        const doc = await contactRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Contato não encontrado' });
        }

        const updateData = {
            ...req.body,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await contactRef.update(updateData);
        res.json({ id, ...updateData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar contato' });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactRef = db.collection('whatsapp_contacts').doc(id);
        const doc = await contactRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Contato não encontrado' });
        }

        await contactRef.delete();
        res.json({ message: 'Contato excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir contato' });
    }
};

exports.updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, message, scheduledTime, type, scheduledTimeStr } = req.body;
        let filters = req.body.filters;

        const campaignRef = db.collection('whatsapp_campaigns').doc(id);
        const doc = await campaignRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        const campaign = doc.data();
        if (campaign.status === 'COMPLETED' && campaign.type !== 'BIRTHDAY') {
            return res.status(400).json({ message: 'Campanhas finalizadas não podem ser alteradas' });
        }

        if (typeof filters === 'string') {
            try {
                filters = JSON.parse(filters);
            } catch (e) {
                filters = {};
            }
        }

        // Search for target contacts again (in case filters changed)
        let query = db.collection('whatsapp_contacts').where('userId', '==', req.user.id);
        const snapshot = await query.get();
        let targetContacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filters && filters.interest) {
            targetContacts = targetContacts.filter(c => c.interests && c.interests.includes(filters.interest));
        }

        if (targetContacts.length === 0) {
            return res.status(400).json({ message: 'Nenhum contato encontrado com os critérios selecionados' });
        }

        const updateData = {
            name,
            message,
            filters,
            type: type || campaign.type || 'STANDARD',
            contactIds: targetContacts.map(c => c.id),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (req.file) {
            updateData.imageUrl = await uploadToR2(req.file, 'whatsapp');
        }

        if (updateData.type === 'BIRTHDAY') {
            updateData.scheduledTimeStr = scheduledTimeStr || campaign.scheduledTimeStr || "09:00";
            // No status reset needed for BIRTHDAY usually, but ensure it's SCHEDULED
            updateData.status = 'SCHEDULED';
        } else {
            if (scheduledTime) {
                if (isNaN(new Date(scheduledTime).getTime())) {
                    return res.status(400).json({ message: 'Data e hora de agendamento inválidas' });
                }
                const scheduledDate = new Date(scheduledTime);
                const seconds = Math.floor(scheduledDate.getTime() / 1000);
                updateData.scheduledTime = new admin.firestore.Timestamp(seconds, 0);
                // Reset status if it was FAILED
                if (campaign.status === 'FAILED') {
                    updateData.status = 'SCHEDULED';
                }
            }
        }

        await campaignRef.update(updateData);
        res.json({ id, ...updateData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar campanha' });
    }
};

exports.deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaignRef = db.collection('whatsapp_campaigns').doc(id);
        const doc = await campaignRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        const campaign = doc.data();
        if (campaign.status === 'COMPLETED' || campaign.status === 'PROCESSING') {
            return res.status(400).json({ message: 'Apenas campanhas agendadas ou com falha podem ser excluídas' });
        }

        await campaignRef.delete();
        res.json({ message: 'Campanha excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir campanha' });
    }
};

exports.getCampaignAudience = async (req, res) => {
    try {
        const { id } = req.params;
        const campaignDoc = await db.collection('whatsapp_campaigns').doc(id).get();

        if (!campaignDoc.exists || campaignDoc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        const campaign = campaignDoc.data();
        const contactIds = campaign.contactIds || [];

        if (contactIds.length === 0) {
            return res.json([]);
        }

        // Batch get contacts (max 30 per query is best practice for IN, but we can do multiple chunks if needed)
        // For simplicity and since list is usually manageable, we use multiple small batches or a single one if small
        const contacts = [];
        const chunks = [];
        for (let i = 0; i < contactIds.length; i += 30) {
            chunks.push(contactIds.slice(i, i + 30));
        }

        for (const chunk of chunks) {
            const snapshot = await db.collection('whatsapp_contacts')
                .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
                .get();
            snapshot.docs.forEach(doc => contacts.push({ id: doc.id, ...doc.data() }));
        }

        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar público da campanha' });
    }
};
exports.getCampaignReport = async (req, res) => {
    try {
        const { id } = req.params;
        const campaignDoc = await db.collection('whatsapp_campaigns').doc(id).get();

        if (!campaignDoc.exists || campaignDoc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        const snapshot = await db.collection('whatsapp_message_logs')
            .where('campaignId', '==', id)
            .get();

        const logs = snapshot.docs.map(doc => ({ 
            messageId: doc.id, 
            ...doc.data(),
            sentAt: doc.data().sentAt?.toDate ? doc.data().sentAt.toDate() : doc.data().sentAt,
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt
        }));

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar relatório da campanha' });
    }
};

exports.removeContactFromCampaign = async (req, res) => {
    try {
        const { id, contactId } = req.params;
        const campaignRef = db.collection('whatsapp_campaigns').doc(id);
        const doc = await campaignRef.get();

        if (!doc.exists || doc.data().userId !== req.user.id) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        const campaign = doc.data();
        if (campaign.status !== 'SCHEDULED') {
            return res.status(400).json({ message: 'Só é possível remover contatos de campanhas agendadas' });
        }

        const contactIds = campaign.contactIds || [];
        if (contactIds.length <= 1) {
            return res.status(400).json({ message: 'A campanha deve ter pelo menos 1 contato' });
        }

        const newContactIds = contactIds.filter(cid => cid !== contactId);
        
        if (newContactIds.length === contactIds.length) {
            return res.status(404).json({ message: 'Contato não encontrado na campanha' });
        }

        await campaignRef.update({
            contactIds: newContactIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ message: 'Contato removido com sucesso', contactIds: newContactIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao remover contato da campanha' });
    }
};
