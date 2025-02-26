// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface UploadedFiles {
  image?: Express.Multer.File[];
  banner?: Express.Multer.File[];
  images?: Express.Multer.File[];
  frontSide?: Express.Multer.File[];
  backSide?: Express.Multer.File[];
  videos?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}
