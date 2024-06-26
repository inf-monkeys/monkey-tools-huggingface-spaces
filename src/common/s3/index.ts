import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { config } from '../config';

export class S3Helpers {
  client: S3Client;

  constructor() {
    this.checkS3Config();
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      endpoint: config.s3.endpoint,
      region: config.s3.region,
    });
  }

  private checkS3Config() {
    if (
      config.s3.accessKeyId &&
      config.s3.secretAccessKey &&
      config.s3.region &&
      config.s3.endpoint &&
      config.s3.bucketName
    ) {
      return;
    }
    throw new Error('未配置 s3 存储，请联系管理员');
  }

  public async existsModel(fileKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: config.s3.bucketName,
        Key: fileKey,
      });
      await this.client.send(command);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getFile(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: fileKey,
    });
    const res = await this.client.send(command);
    return res;
  }

  public async uploadFile(
    fileBuffer:
      | string
      | Buffer
      | Readable
      | ReadableStream<any>
      | Blob
      | Uint8Array,
    fileKey: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: fileKey,
      Body: fileBuffer,
    });
    await this.client.send(command);
    return config.s3.publicUrl + '/' + fileKey;
  }

  public async deleteFile(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: config.s3.bucketName,
      Key: fileKey,
    });
    const res = await this.client.send(command);
    return res;
  }

  public async getFileSignedUrl(
    fileKey: string,
    bucket = config.s3.bucketName,
  ) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    const res = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    return res;
  }
}
