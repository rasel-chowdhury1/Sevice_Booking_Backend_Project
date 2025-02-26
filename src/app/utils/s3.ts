import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ObjectCannedACL,
    PutObjectCommand,
  } from '@aws-sdk/client-s3';
  import httpStatus from 'http-status';
  import AppError from '../error/AppError';
  import config from '../config';
import { s3Client } from '../constants/aws';
  
  //upload a single file
  export const uploadToS3 = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { file, fileName }: { file: any; fileName: string },
  ): Promise<string | null> => {
    const command = new PutObjectCommand({
      Bucket: config.aws.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read, //access public read
    });
  
    try {
      const key = await s3Client.send(command);
      if (!key) {
        throw new AppError(httpStatus.BAD_REQUEST, 'File Upload failed');
      }
      const url = `${config?.aws?.s3BaseUrl}/${fileName}`;
  
      return url;
    } catch (error) {
      throw new AppError(httpStatus.BAD_REQUEST, 'File Upload failed');
    }
  };
  
  // delete file from s3 bucket
  export const deleteFromS3 = async (key: string) => {
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.aws.bucket,
        Key: key,
      });
      await s3Client.send(command);
    } catch (error) {
      console.log('🚀 ~ deleteFromS3 ~ error:', error);
      throw new Error('s3 file delete failed');
    }
  };
  
  // upload multiple files
  
  export const uploadManyToS3 = async (
    files: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file: any;
      path: string;
      key?: string;
    }[],
  ): Promise<{ url: string; key: string }[]> => {
    try {
      const uploadPromises = files.map(async ({ file, path, key }) => {
        const newFileName = key
          ? key
          : `${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`;
  
        const fileKey = `${path}/${newFileName}`;
        
        const command = new PutObjectCommand({
          Bucket: config.aws.bucket as string,
          Key: fileKey,
          Body: file?.buffer,
          ContentType: file.mimetype,
          ACL: ObjectCannedACL.public_read, //access public read
        });
  
        const nn = await s3Client.send(command); 
        // const url = `${config?.aws?.s3BaseUrl}/${fileKey}`;
        const url = `${config?.aws?.s3BaseUrl}/${fileKey}`;
        return { url, key: newFileName };
      });
  
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (error) { 
      throw new Error('File Upload failed');
    }
  };
  
  export const deleteManyFromS3 = async (keys: string[]) => {
    try {
      const deleteParams = {
        Bucket: config.aws.bucket,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false,
        },
      };
  
      const command = new DeleteObjectsCommand(deleteParams);
  
      const response = await s3Client.send(command);
  
      return response;
    } catch (error) {
      console.error('Error deleting S3 files:', error);
      throw new AppError(httpStatus.BAD_REQUEST, 'S3 file delete failed');
    }
  };