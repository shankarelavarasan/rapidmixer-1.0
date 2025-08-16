const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

class CloudStorageService {
    constructor() {
        this.provider = process.env.CLOUD_STORAGE_PROVIDER || 'aws'; // aws, gcp, local
        this.initializeProvider();
    }

    initializeProvider() {
        switch (this.provider) {
            case 'aws':
                this.s3 = new AWS.S3({
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION || 'us-east-1'
                });
                this.bucket = process.env.AWS_S3_BUCKET;
                break;
                
            case 'gcp':
                this.storage = new Storage({
                    projectId: process.env.GCP_PROJECT_ID,
                    keyFilename: process.env.GCP_KEY_FILE
                });
                this.bucket = this.storage.bucket(process.env.GCP_STORAGE_BUCKET);
                break;
                
            default:
                this.provider = 'local';
                this.localPath = process.env.LOCAL_STORAGE_PATH || './uploads';
                break;
        }
    }

    async uploadFile(filePath, key, metadata = {}) {
        try {
            switch (this.provider) {
                case 'aws':
                    return await this.uploadToS3(filePath, key, metadata);
                case 'gcp':
                    return await this.uploadToGCP(filePath, key, metadata);
                default:
                    return await this.uploadToLocal(filePath, key, metadata);
            }
        } catch (error) {
            console.error('Cloud storage upload error:', error);
            throw error;
        }
    }

    async uploadToS3(filePath, key, metadata) {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
            Bucket: this.bucket,
            Key: key,
            Body: fileStream,
            Metadata: metadata,
            ServerSideEncryption: 'AES256'
        };

        const result = await this.s3.upload(uploadParams).promise();
        return {
            url: result.Location,
            key: result.Key,
            etag: result.ETag,
            provider: 'aws'
        };
    }

    async uploadToGCP(filePath, key, metadata) {
        const file = this.bucket.file(key);
        
        await file.save(fs.readFileSync(filePath), {
            metadata: {
                metadata: metadata
            }
        });

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        return {
            url,
            key,
            provider: 'gcp'
        };
    }

    async uploadToLocal(filePath, key, metadata) {
        const destinationPath = path.join(this.localPath, key);
        const destinationDir = path.dirname(destinationPath);
        
        // Ensure directory exists
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(filePath, destinationPath);

        // Save metadata
        const metadataPath = destinationPath + '.meta';
        fs.writeFileSync(metadataPath, JSON.stringify(metadata));

        return {
            url: `/uploads/${key}`,
            key,
            provider: 'local'
        };
    }

    async downloadFile(key, localPath) {
        try {
            switch (this.provider) {
                case 'aws':
                    return await this.downloadFromS3(key, localPath);
                case 'gcp':
                    return await this.downloadFromGCP(key, localPath);
                default:
                    return await this.downloadFromLocal(key, localPath);
            }
        } catch (error) {
            console.error('Cloud storage download error:', error);
            throw error;
        }
    }

    async downloadFromS3(key, localPath) {
        const params = {
            Bucket: this.bucket,
            Key: key
        };

        const data = await this.s3.getObject(params).promise();
        fs.writeFileSync(localPath, data.Body);
        return localPath;
    }

    async downloadFromGCP(key, localPath) {
        const file = this.bucket.file(key);
        await file.download({ destination: localPath });
        return localPath;
    }

    async downloadFromLocal(key, localPath) {
        const sourcePath = path.join(this.localPath, key);
        fs.copyFileSync(sourcePath, localPath);
        return localPath;
    }

    async deleteFile(key) {
        try {
            switch (this.provider) {
                case 'aws':
                    await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
                    break;
                case 'gcp':
                    await this.bucket.file(key).delete();
                    break;
                default:
                    const filePath = path.join(this.localPath, key);
                    const metadataPath = filePath + '.meta';
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
                    break;
            }
            return true;
        } catch (error) {
            console.error('Cloud storage delete error:', error);
            return false;
        }
    }

    async getSignedUrl(key, expiresIn = 3600) {
        try {
            switch (this.provider) {
                case 'aws':
                    return this.s3.getSignedUrl('getObject', {
                        Bucket: this.bucket,
                        Key: key,
                        Expires: expiresIn
                    });
                case 'gcp':
                    const [url] = await this.bucket.file(key).getSignedUrl({
                        action: 'read',
                        expires: Date.now() + expiresIn * 1000
                    });
                    return url;
                default:
                    return `/uploads/${key}`;
            }
        } catch (error) {
            console.error('Get signed URL error:', error);
            throw error;
        }
    }

    async listFiles(prefix = '', maxKeys = 1000) {
        try {
            switch (this.provider) {
                case 'aws':
                    const s3Result = await this.s3.listObjectsV2({
                        Bucket: this.bucket,
                        Prefix: prefix,
                        MaxKeys: maxKeys
                    }).promise();
                    return s3Result.Contents.map(obj => ({
                        key: obj.Key,
                        size: obj.Size,
                        lastModified: obj.LastModified,
                        etag: obj.ETag
                    }));
                    
                case 'gcp':
                    const [files] = await this.bucket.getFiles({ prefix, maxResults: maxKeys });
                    return files.map(file => ({
                        key: file.name,
                        size: file.metadata.size,
                        lastModified: file.metadata.timeCreated,
                        etag: file.metadata.etag
                    }));
                    
                default:
                    const localFiles = [];
                    const searchPath = path.join(this.localPath, prefix);
                    if (fs.existsSync(searchPath)) {
                        const files = fs.readdirSync(searchPath, { withFileTypes: true });
                        files.forEach(file => {
                            if (file.isFile() && !file.name.endsWith('.meta')) {
                                const filePath = path.join(searchPath, file.name);
                                const stats = fs.statSync(filePath);
                                localFiles.push({
                                    key: path.join(prefix, file.name),
                                    size: stats.size,
                                    lastModified: stats.mtime,
                                    etag: stats.mtime.getTime().toString()
                                });
                            }
                        });
                    }
                    return localFiles;
            }
        } catch (error) {
            console.error('List files error:', error);
            return [];
        }
    }

    async getFileMetadata(key) {
        try {
            switch (this.provider) {
                case 'aws':
                    const s3Metadata = await this.s3.headObject({
                        Bucket: this.bucket,
                        Key: key
                    }).promise();
                    return {
                        size: s3Metadata.ContentLength,
                        lastModified: s3Metadata.LastModified,
                        contentType: s3Metadata.ContentType,
                        metadata: s3Metadata.Metadata
                    };
                    
                case 'gcp':
                    const file = this.bucket.file(key);
                    const [metadata] = await file.getMetadata();
                    return {
                        size: metadata.size,
                        lastModified: metadata.timeCreated,
                        contentType: metadata.contentType,
                        metadata: metadata.metadata
                    };
                    
                default:
                    const filePath = path.join(this.localPath, key);
                    const metadataPath = filePath + '.meta';
                    
                    if (!fs.existsSync(filePath)) {
                        throw new Error('File not found');
                    }
                    
                    const stats = fs.statSync(filePath);
                    let customMetadata = {};
                    
                    if (fs.existsSync(metadataPath)) {
                        customMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                    }
                    
                    return {
                        size: stats.size,
                        lastModified: stats.mtime,
                        contentType: this.getContentType(filePath),
                        metadata: customMetadata
                    };
            }
        } catch (error) {
            console.error('Get file metadata error:', error);
            throw error;
        }
    }

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.json': 'application/json',
            '.txt': 'text/plain'
        };
        return contentTypes[ext] || 'application/octet-stream';
    }

    // Generate unique key for file storage
    generateFileKey(userId, projectId, filename, type = 'audio') {
        const timestamp = Date.now();
        const extension = path.extname(filename);
        const baseName = path.basename(filename, extension);
        return `users/${userId}/projects/${projectId}/${type}/${timestamp}-${baseName}${extension}`;
    }

    // Clean up old files (for maintenance)
    async cleanupOldFiles(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        try {
            const files = await this.listFiles();
            const filesToDelete = files.filter(file => 
                new Date(file.lastModified) < cutoffDate
            );
            
            const deletePromises = filesToDelete.map(file => this.deleteFile(file.key));
            await Promise.all(deletePromises);
            
            console.log(`Cleaned up ${filesToDelete.length} old files`);
            return filesToDelete.length;
        } catch (error) {
            console.error('Cleanup error:', error);
            return 0;
        }
    }
}

module.exports = CloudStorageService;