const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const listSupabaseFiles = async () => {
    try {
        const s3Client = new S3Client({
            endpoint: process.env.STORAGE_ENDPOINT,
            region: process.env.STORAGE_REGION,
            credentials: {
                accessKeyId: process.env.STORAGE_ACCESS_KEY,
                secretAccessKey: process.env.STORAGE_SECRET_KEY,
            },
            forcePathStyle: true,
        });

        const command = new ListObjectsV2Command({
            Bucket: process.env.STORAGE_BUCKET,
        });

        console.log(`Listing files in bucket: ${process.env.STORAGE_BUCKET}`);
        const response = await s3Client.send(command);
        if (response.Contents) {
            console.log(`Found ${response.Contents.length} files in bucket.`);
            response.Contents.forEach(obj => console.log(` - ${obj.Key}`));
        } else {
            console.log('Bucket is empty.');
        }

        process.exit(0);
    } catch (error) {
        console.error('List Error:', error);
        process.exit(1);
    }
};

listSupabaseFiles();
