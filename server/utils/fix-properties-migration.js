const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const sequelize = require('../config/db');
const { uploadToR2 } = require('../services/storage');

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
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error(`  Erro ao baixar ${key}:`, error.message);
        return null;
    }
};

const fixProperties = async () => {
    try {
        await sequelize.authenticate();
        console.log('Iniciando correção da tabela Properties...');

        const [properties] = await sequelize.query('SELECT id, images FROM "Properties" WHERE CAST(images as text) LIKE \'%supabase.co%\'');
        
        for (const prop of properties) {
            console.log(`\nProcessando Propriedade ID ${prop.id}...`);
            let imagesArray = [];
            
            // Garantir que images seja um array (podem vir como string ou objeto dependendo do driver)
            if (typeof prop.images === 'string') {
                imagesArray = JSON.parse(prop.images);
            } else {
                imagesArray = prop.images;
            }

            if (!Array.isArray(imagesArray)) continue;

            const newImages = [];
            let updated = false;

            for (let url of imagesArray) {
                if (url.includes('supabase.co')) {
                    // Extrair key de forma mais robusta
                    const keyMatch = url.match(/\/object\/public\/iSocial\/(.+)$/);
                    const key = keyMatch ? keyMatch[1] : null;

                    if (key) {
                        console.log(`  Migrando: ${key}`);
                        const buffer = await downloadFromSupabase(key);
                        if (buffer) {
                            const newUrl = await uploadToR2(buffer, key, 'image/jpeg');
                            newImages.push(newUrl);
                            updated = true;
                            continue;
                        }
                    }
                }
                newImages.push(url);
            }

            if (updated) {
                console.log(`  Salvando ${newImages.length} novas URLs para Propriedade ${prop.id}...`);
                // Usar casting para jsonb no Postgres
                await sequelize.query('UPDATE "Properties" SET images = CAST(? AS jsonb) WHERE id = ?', {
                    replacements: [JSON.stringify(newImages), prop.id]
                });
                console.log('  Sucesso!');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Erro na correção:', error);
        process.exit(1);
    }
};

fixProperties();
