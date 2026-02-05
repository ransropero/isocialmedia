const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3Client = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true // Mandatory for Supabase/S3 compatible
});

exports.uploadToSupabase = async (file) => {
    try {
        const fileContent = fs.readFileSync(file.path);
        const fileName = `${Date.now()}-${file.originalname}`;
        const bucket = process.env.STORAGE_BUCKET || 'iSocial';

        const params = {
            Bucket: bucket,
            Key: fileName,
            Body: fileContent,
            ContentType: file.mimetype,
            // ACL: 'public-read' // Not always supported/needed in Supabase
        };

        await s3Client.send(new PutObjectCommand(params));

        // Generate Public URL (Supabase pattern)
        // Format: https://[project-id].storage.supabase.co/storage/v1/object/public/[bucket]/[filename]
        const publicUrl = `${process.env.STORAGE_ENDPOINT}/object/public/${bucket}/${fileName}`;

        // Remove local file
        fs.unlinkSync(file.path);

        return publicUrl;
    } catch (error) {
        console.error('Supabase Storage Upload Error:', error);
        throw error;
    }
};

exports.getS3Object = async (url) => {
    // Helper to fetch object if needed for Instagram publishing
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
};
