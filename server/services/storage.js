const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');

const s3Client = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true, // Specific for Supabase/S3-compatible storage
});

exports.uploadToSupabase = async (file) => {
    try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.STORAGE_BUCKET || 'iSocial',
                Key: fileName,
                Body: fs.createReadStream(file.path),
                ContentType: file.mimetype,
                ACL: 'public-read',
            },
        });

        await upload.done();

        // Construct public URL
        // Supabase S3 public URL format: [endpoint]/[bucket]/[key]
        // But usually it's served via the storage API: [url]/storage/v1/object/public/[bucket]/[key]
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crqcnqzlhhrlmwjscdrq.supabase.co';
        const bucketName = process.env.STORAGE_BUCKET || 'iSocial';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;

        // Remove local file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        return publicUrl;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw error;
    }
};

exports.getS3Object = async (url) => {
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
};
