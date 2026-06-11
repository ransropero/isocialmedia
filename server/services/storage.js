const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');

// Client for Supabase (S3-Compatible) - Current
const s3Client = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});

// Client for Cloudflare R2
const r2Client = new S3Client({
    endpoint: process.env.R2_ENDPOINT,
    region: 'auto',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

exports.uploadToR2 = async (file, fileNameOrPrefix = '', manualContentType = null) => {
    try {
        let buffer, fileName, contentType;

        // Se for um Buffer direto (caso do script de migração)
        if (Buffer.isBuffer(file)) {
            buffer = file;
            fileName = fileNameOrPrefix; // Aqui tratamos como o nome final do arquivo
            contentType = manualContentType || 'image/jpeg';
        } else {
            // Caso padrão (objeto do Multer)
            const ext = path.extname(file.originalname || '');
            const cleanPrefix = fileNameOrPrefix ? `${fileNameOrPrefix.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-` : '';
            fileName = `${cleanPrefix}${Date.now()}${ext}`;
            buffer = file.buffer;
            contentType = file.mimetype;
        }
        
        const body = buffer ? buffer : fs.createReadStream(file.path);

        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: process.env.R2_BUCKET,
                Key: fileName,
                Body: body,
                ContentType: contentType,
            },
        });

        await upload.done();

        const publicUrlBase = process.env.R2_PUBLIC_URL || '';
        const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${fileName}`;

        // Remover arquivo local se existir (apenas se tiver path)
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return publicUrl;
    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw error;
    }
};

exports.uploadToSupabase = async (file, prefix = '') => {
    try {
        const ext = path.extname(file.originalname);
        const cleanPrefix = prefix ? `${prefix.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-` : '';
        const fileName = `${cleanPrefix}${Date.now()}${ext}`;
        
        const body = file.buffer ? file.buffer : fs.createReadStream(file.path);

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.STORAGE_BUCKET || 'iSocial',
                Key: fileName,
                Body: body,
                ContentType: file.mimetype,
                ACL: 'public-read',
            },
        });

        await upload.done();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crqcnqzlhhrlmwjscdrq.supabase.co';
        const bucketName = process.env.STORAGE_BUCKET || 'iSocial';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;

        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return publicUrl;
    } catch (error) {
        console.error('Supabase Upload Error:', error);
        throw error;
    }
};

exports.getS3Object = async (url) => {
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
};
