/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import { TErrorSources } from '../interface/error';
import handleZodError from '../error/ZodError';
import handleValidationError from '../error/ValidationError';
import handleDuplicateError from '../error/DuplicateError';
import handleCastError from '../error/CastError';
import AppError from '../error/AppError';
import { MulterError } from 'multer';
import handelMulterError from '../error/MulterError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  //setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof MulterError) {
    const simplifiedError = handelMulterError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  //ultimate return
  if (errorSources?.length !== 0) {
    errorSources = errorSources.map(source => {
      try {
        return {
          ...source,
          message: source?.message,
        };
      } catch (error) {
        return {
          ...source,
          message: source?.message,
        };
      }
    });
    // message = req.t(message);
  }
  try {
    res.status(statusCode).json({
      success: false,
      message: message,
      // message: message,
      errorSources: errorSources,
      err,
      stack: config.NODE_ENV === 'development' ? err?.stack : null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.status(statusCode).json({
      success: false,
      // message: message? req.t(message) : null,
      message: message,
      errorSources,
      err,
      stack: config.NODE_ENV === 'development' ? err?.stack : null,
    });
  }
};

export default globalErrorHandler;
