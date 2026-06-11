const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const sequelize = require('../config/db');
const { uploadToR2 } = require('../services/storage');
const BioPage = require('../models/BioPage');
const Account = require('../models/Account');

// Config S3 Supabase
const s3Supabase = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION,
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});

const downloadFromSupabase = async (key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.STORAGE_BUCKET,
            Key: key,
        });
        const response = await s3Supabase.send(command);
        
        // Convert stream to Buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error(`  Erro ao baixar ${key} do Supabase:`, error.message);
        return null;
    }
};

const runMigration = async () => {
    console.log('--- Iniciando Migração Total (S3 Direct) para Cloudflare R2 ---');
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados.');

        const bucketFilesCount = new Map(); // Para rastrear o que já foi pro R2

        // 1. Bio Pages
        console.log('\n[1/4] Migrando Bio Pages...');
        const bioPages = await BioPage.findAll();
        for (const bio of bioPages) {
            if (bio.profileImageUrl && bio.profileImageUrl.includes('supabase.co')) {
                const key = bio.profileImageUrl.split('/public/iSocial/')[1];
                if (key) {
                    console.log(`Migrando BioPage ${bio.id} (Profile)...`);
                    const buffer = await downloadFromSupabase(key);
                    if (buffer) {
                        const newUrl = await uploadToR2(buffer, key, 'image/jpeg');
                        bio.profileImageUrl = newUrl;
                        await bio.save();
                    }
                }
            }
            if (bio.backgroundImageUrl && bio.backgroundImageUrl.includes('supabase.co')) {
                const key = bio.backgroundImageUrl.split('/public/iSocial/')[1];
                if (key) {
                    console.log(`Migrando BioPage ${bio.id} (Background)...`);
                    const buffer = await downloadFromSupabase(key);
                    if (buffer) {
                        const newUrl = await uploadToR2(buffer, key, 'image/jpeg');
                        bio.backgroundImageUrl = newUrl;
                        await bio.save();
                    }
                }
            }
        }

        // 2. Accounts
        console.log('\n[2/4] Migrando Contas (Profile Pictures)...');
        const accounts = await Account.findAll();
        for (const acc of accounts) {
            if (acc.profilePictureUrl && acc.profilePictureUrl.includes('supabase.co')) {
                const key = acc.profilePictureUrl.split('/public/iSocial/')[1];
                if (key) {
                    console.log(`Migrando Account ${acc.id}...`);
                    const buffer = await downloadFromSupabase(key);
                    if (buffer) {
                        const newUrl = await uploadToR2(buffer, key, 'image/jpeg');
                        acc.profilePictureUrl = newUrl;
                        await acc.save();
                    }
                }
            }
        }

        // 3. Properties (JSON Array)
        console.log('\n[3/4] Migrando Properties (Real Estate)...');
        const [properties] = await sequelize.query('SELECT id, images FROM "Properties"');
        for (const prop of properties) {
            if (prop.images && Array.isArray(prop.images)) {
                let updated = false;
                const newImages = [...prop.images];
                for (let i = 0; i < newImages.length; i++) {
                    const url = newImages[i];
                    if (url.includes('supabase.co')) {
                        const key = url.split('/public/iSocial/')[1];
                        if (key) {
                            console.log(`Migrando Propriedade ${prop.id} - Imagem ${i}...`);
                            const buffer = await downloadFromSupabase(key);
                            if (buffer) {
                                const newUrl = await uploadToR2(buffer, key, 'image/jpeg');
                                newImages[i] = newUrl;
                                updated = true;
                            }
                        }
                    }
                }
                if (updated) {
                    await sequelize.query('UPDATE "Properties" SET images = ? WHERE id = ?', {
                        replacements: [JSON.stringify(newImages), prop.id]
                    });
                }
            }
        }

        // 4. Varredura Total do Bucket (Backup / Orphan Files)
        console.log('\n[4/4] Varredura Total do Bucket (Garantindo que TUDO vá para o R2)...');
        const listCmd = new ListObjectsV2Command({ Bucket: process.env.STORAGE_BUCKET });
        const supabaseFiles = await s3Supabase.send(listCmd);
        
        let orphanCount = 0;
        if (supabaseFiles.Contents) {
            for (const item of supabaseFiles.Contents) {
                const key = item.Key;
                if (key.endsWith('/') || key.includes('.emptyFolderPlaceholder')) continue;

                console.log(`Processando arquivo no bucket: ${key}`);
                const buffer = await downloadFromSupabase(key);
                if (buffer) {
                    await uploadToR2(buffer, key, 'image/jpeg'); // Mantém o nome original no R2
                    orphanCount++;
                }
            }
        }
        console.log(`Varredura do Bucket: ${orphanCount} arquivos salvos no R2.`);

        console.log('\n--- Migração Finalizada com Sucesso! ---');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL: Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
