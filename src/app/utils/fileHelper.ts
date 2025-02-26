import fs from 'fs';
import util from 'util';
const unlinkSync = util.promisify(fs.unlink);
export const deleteFile = async (path: string) => {
  try {
    if (fs.existsSync(`../public/${path}`)) {
      await unlinkSync(`../public/${path}`);
    } else {
      console.log('not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Error deleting file: ${err.message}`);
  }
};


// this is use for single field file upload
export const storeFile = (folderName: string, filename: string) => {
  return `/uploads/${folderName}/${filename}`;
};

// this is use for muiltiple fields file upload
export const storeFiles = (
  folderName: string,
  files: { [fieldName: string]: Express.Multer.File[] }
): { [fieldName: string]: string[] } => {
  if (!folderName || !files) {
    throw new Error('Both folderName and files are required.');
  }

  const sanitizedFolder = folderName.replace(/\/+$/, ''); // Remove trailing slashes
  const result: { [fieldName: string]: string[] } = {};

  // Use Object.entries to iterate over the files object
  Object.entries(files).forEach(([fieldName, fileArray]) => {
    // Map each file in the field to its generated path
    result[fieldName] = fileArray.map((file) => {
      const sanitizedFilename = file.filename.replace(/^\/+/, ''); // Remove leading slashes
      return `/uploads/${sanitizedFolder}/${sanitizedFilename}`;
    });
  });

  return result;
};

