const pino = require('pino');
const qrcode = require('qrcode');
const { db } = require('../config/firebase');

/**
 * Custom auth state for Baileys that persists in Firestore
 * This allows multiple sessions to be stored and restored in serverless environments.
 */
const useFirestoreAuthState = async (userId) => {
    // Dynamic import Baileys because it's an ESM module
    const { initAuthCreds, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys');
    
    const collection = db.collection('whatsapp_sessions_baileys');
    const docRef = collection.doc(userId);

    let creds;
    const doc = await docRef.get();
    
    if (doc.exists && doc.data().creds) {
        // Parse credentials from Firestore
        creds = JSON.parse(doc.data().creds, (key, value) => {
            if (value && typeof value === 'object' && value.type === 'Buffer') {
                return Buffer.from(value.data);
            }
            return value;
        });
    } else {
        // Initial credentials
        creds = initAuthCreds();
    }

    const saveCreds = async () => {
        const credsString = JSON.stringify(creds, (key, value) => {
            if (Buffer.isBuffer(value)) {
                return { type: 'Buffer', data: Array.from(value) };
            }
            return value;
        });
        await docRef.set({ creds: credsString, updatedAt: new Date() }, { merge: true });
    };

    return {
        state: {
            creds,
            keys: makeCacheableSignalKeyStore({
                get: async (type, ids) => {
                    const data = {};
                    const keysDoc = await docRef.collection('keys').doc(type).get();
                    const keysData = keysDoc.exists ? keysDoc.data() : {};
                    
                    for (const id of ids) {
                        let value = keysData[id];
                        if (value) {
                            data[id] = JSON.parse(value, (k, v) => {
                                if (v && typeof v === 'object' && v.type === 'Buffer') {
                                    return Buffer.from(v.data);
                                }
                                return v;
                            });
                        }
                    }
                    return data;
                },
                set: async (data) => {
                    for (const type in data) {
                        const typeData = {};
                        for (const id in data[type]) {
                            const value = data[type][id];
                            typeData[id] = JSON.stringify(value, (k, v) => {
                                if (Buffer.isBuffer(v)) {
                                    return { type: 'Buffer', data: Array.from(v) };
                                }
                                return v;
                            });
                        }
                        await docRef.collection('keys').doc(type).set(typeData, { merge: true });
                    }
                }
            }, pino({ level: 'silent' }))
        },
        saveCreds
    };
};

class WhatsAppService {
    constructor() {
        this.sockets = {}; // userId -> socket instances
        this.qrCodes = {}; // userId -> latest QR code base64
        this.connectionStatus = {}; // userId -> status
        this.logger = pino({ level: 'info' });
    }

    async getClient(userId) {
        if (this.sockets[userId]) {
            return this.sockets[userId];
        }

        if (this.connectionStatus[userId] === 'INITIALIZING') {
            console.log(`[WhatsApp-Baileys] Already initializing for user: ${userId}. Skipping duplicate call.`);
            return null;
        }

        console.log(`[WhatsApp-Baileys] Initializing for user: ${userId}`);
        this.connectionStatus[userId] = 'INITIALIZING';

        // Dynamic import Baileys constants and methods
        const { 
            default: makeWASocket, 
            DisconnectReason, 
            fetchLatestBaileysVersion 
        } = await import('@whiskeysockets/baileys');

        try {
            const { state, saveCreds } = await useFirestoreAuthState(userId);
            const { version } = await fetchLatestBaileysVersion();

            const sock = makeWASocket({
                version,
                printQRInTerminal: false,
                auth: state,
                logger: pino({ level: 'silent' }),
                browser: ['iSocialMedia', 'Chrome', '1.0.0']
            });

            this.sockets[userId] = sock;

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log(`[WhatsApp-Baileys] QR Code generated for user: ${userId}`);
                    const qrBase64 = await qrcode.toDataURL(qr);
                    this.qrCodes[userId] = qrBase64;
                    this.connectionStatus[userId] = 'WAITING_FOR_QR';
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    console.log(`[WhatsApp-Baileys] Connection closed for ${userId}. Reason: ${statusCode || 'Unknown'}. Reconnecting: ${shouldReconnect}`);
                    if (lastDisconnect?.error) {
                        console.error(`[WhatsApp-Baileys] Disconnect details:`, lastDisconnect.error);
                    }
                    
                    this.connectionStatus[userId] = 'DISCONNECTED';
                    delete this.sockets[userId];
                    delete this.qrCodes[userId];

                    if (shouldReconnect) {
                        console.log(`[WhatsApp-Baileys] Waiting 5s before reconnecting user ${userId}...`);
                        setTimeout(() => {
                            this.getClient(userId).catch(err => {
                                console.error(`[WhatsApp-Baileys] Reconnection failed for ${userId}:`, err.message);
                            });
                        }, 5000);
                    } else {
                        // Logic for permanent logout
                        console.log(`[WhatsApp-Baileys] Logged out detected for ${userId}. Clearing session.`);
                        await this.clearSession(userId);
                    }
                } else if (connection === 'open') {
                    console.log(`[WhatsApp-Baileys] Connection opened for user: ${userId}`);
                    this.connectionStatus[userId] = 'CONNECTED';
                    delete this.qrCodes[userId];
                }
            });

            // Suppress message logs for performance but keep internal state active
            sock.ev.on('messages.upsert', () => {});

            // Tracking Delivery and Read Receipts
            sock.ev.on('message-receipt.update', async (receipts) => {
                console.log(`[WhatsApp-Baileys] Receipt update received:`, JSON.stringify(receipts, null, 2));
                for (const { key, receipt } of receipts) {
                    const messageId = key.id;
                    const statusType = receipt.type; // 2 = Delivered, 3 = Read
                    
                    console.log(`[WhatsApp-Baileys] Processing receipt for ID ${messageId}, type: ${statusType}`);
                    
                    if (messageId && (statusType === 2 || statusType === 3)) {
                        const newStatus = statusType === 3 ? 'READ' : 'DELIVERED';
                        this.updateMessageLogStatus(messageId, newStatus);
                    }
                }
            });

            // Alternative tracking via messages.update
            sock.ev.on('messages.update', async (updates) => {
                console.log(`[WhatsApp-Baileys] Messages update received:`, JSON.stringify(updates, null, 2));
                for (const update of updates) {
                    if (update.key && update.update?.status) {
                        const messageId = update.key.id;
                        const status = update.update.status;
                        
                        // status 3 = delivered, status 4 = read (in messages.update context)
                        if (status === 3 || status === 4) {
                            const newStatus = status === 4 ? 'READ' : 'DELIVERED';
                            console.log(`[WhatsApp-Baileys] Processing message update for ID ${messageId}, status: ${status} -> ${newStatus}`);
                            this.updateMessageLogStatus(messageId, newStatus);
                        }
                    }
                }
            });

            return sock;
        } catch (error) {
            console.error(`[WhatsApp-Baileys] Initialization error for ${userId}:`, error);
            this.connectionStatus[userId] = 'ERROR';
            delete this.sockets[userId]; // Limpar socket parcial se houver
            return null;
        }
    }

    getStatus(userId) {
        return this.connectionStatus[userId] || 'DISCONNECTED';
    }

    getQR(userId) {
        return this.qrCodes[userId] || null;
    }

    async logout(userId) {
        if (this.sockets[userId]) {
            try {
                await this.sockets[userId].logout();
                await this.clearSession(userId);
                console.log(`[WhatsApp-Baileys] Logged out user: ${userId}`);
            } catch (err) {
                console.error(`Logout error for ${userId}:`, err);
                // Force clear in case of error
                await this.clearSession(userId);
            }
            delete this.sockets[userId];
            delete this.qrCodes[userId];
            this.connectionStatus[userId] = 'DISCONNECTED';
        } else {
            // Force clear even if socket is dead
            await this.clearSession(userId);
            delete this.qrCodes[userId];
            this.connectionStatus[userId] = 'DISCONNECTED';
        }
    }

    async clearSession(userId) {
        try {
            const docRef = db.collection('whatsapp_sessions_baileys').doc(userId);
            
            // Delete all keys in the subcollection to prevent E2EE mismatch 
            // ("Aguardando mensagem" error) on reconnect
            const keysSnapshot = await docRef.collection('keys').get();
            if (!keysSnapshot.empty) {
                const batch = db.batch();
                keysSnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
            
            // Delete the main creds document
            await docRef.delete();
            console.log(`[WhatsApp-Baileys] Session completely wiped for user: ${userId}`);
        } catch (error) {
            console.error(`[WhatsApp-Baileys] Error wiping session for ${userId}:`, error);
        }
    }

    async sendMessage(userId, to, message, imageUrl = null) {
        const sock = await this.getClient(userId);
        
        // Ensure connection is open
        if (this.connectionStatus[userId] !== 'CONNECTED') {
             throw new Error('WhatsApp não está conectado. Aguarde ou escaneie o QR Code.');
        }

        const formattedTo = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        try {
            if (imageUrl) {
                console.log(`[WhatsApp-Baileys] Sending media to ${to}`);
                const response = await sock.sendMessage(formattedTo, {
                    image: { url: imageUrl },
                    caption: message
                });
                return response;
            } else {
                const response = await sock.sendMessage(formattedTo, { text: message });
                return response;
            }
        } catch (error) {
            console.error(`[WhatsApp-Baileys] Send Error:`, error);
            throw new Error(`Erro ao enviar: ${error.message}`);
        }
    }

    async updateMessageLogStatus(messageId, newStatus) {
        try {
            const logRef = db.collection('whatsapp_message_logs').doc(messageId);
            const logDoc = await logRef.get();
            
            if (logDoc.exists) {
                const currentStatus = logDoc.data().status;
                console.log(`[WhatsApp-Baileys] Found log for ${messageId}. Current: ${currentStatus}, New: ${newStatus}`);

                if (currentStatus === 'READ') {
                    console.log(`[WhatsApp-Baileys] Skipping update for ${messageId} as it's already READ`);
                    return;
                }
                
                await logRef.update({
                    status: newStatus,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[WhatsApp-Baileys] Success! Log updated for ${messageId}: ${newStatus}`);
            } else {
                console.log(`[WhatsApp-Baileys] No matching log found in whatsapp_message_logs for messageId: ${messageId}`);
            }
        } catch (err) {
            console.error(`[WhatsApp-Baileys] Error updating msg log status:`, err.message);
        }
    }
}

module.exports = new WhatsAppService();
