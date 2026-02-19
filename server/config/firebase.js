const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

try {
    if (admin.apps.length > 0) {
        console.log('Firebase: Already initialized (skipping re-init)');
    } else {
        let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;

        // Fallback to local file if env var is missing
        if (!serviceAccount) {
            const localPath = path.resolve(__dirname, '..', 'firebase-service-account.json');
            console.log(`Firebase: Searching for local credentials at: ${localPath}`);
            if (fs.existsSync(localPath)) {
                try {
                    serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                    console.log(`Firebase: Loaded credentials for project "${serviceAccount.project_id}" from local JSON file`);
                } catch (parseError) {
                    console.error('Firebase: Error parsing local JSON file:', parseError.message);
                }
            } else {
                console.warn('Firebase: Local JSON file NOT found.');
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id + '.appspot.com')
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.error('Firebase Admin CRITICAL: No credentials found in ENV or local JSON file!');
            admin.initializeApp({
                credential: { getAccessToken: () => ({}) },
                projectId: 'mock-project-error'
            });
        }
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
}


const db = admin.firestore();
const storage = admin.storage();

// Helper to handle Firestore Timestamps vs JS Dates
const toDate = (timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

module.exports = { admin, db, storage, toDate };
