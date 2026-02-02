import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {


     // Preprocess the body data
     if (req.body.coHosts) {
      try {
        // req.body.coHosts = JSON.parse(req.body.coHosts);
         // Ensure coHosts is a string before parsing
         if (typeof req.body.coHosts === 'string') {
          req.body.coHosts = JSON.parse(req.body.coHosts);
        }
      } catch (error) {
        console.error('Error parsing coHosts:', error);
         res.status(400).json({
          success: false,
          message: 'Invalid JSON format for coHosts.',
        });
      }
    }

    if (req.body.maxParticipants) {
      req.body.maxParticipants = parseInt(req.body.maxParticipants, 10);
      if (isNaN(req.body.maxParticipants)) {
         res.status(400).json({
          success: false,
          message: 'maxParticipants must be a valid number.',
        });
      }
    }


    await schema.parseAsync({
      body: req.body,
      files: req.files,
      file: req.file,
      cookies: req.cookies,
    });

    next();
  });
};

export default validateRequest;
