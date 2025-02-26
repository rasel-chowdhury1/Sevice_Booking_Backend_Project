/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from 'express';

const httpStatus = { BAD_REQUEST: 400, OK: 200, NOT_FOUND: 404 };

const notFound = (req: Request, res: Response, next: NextFunction):any => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API Not Found !!',
    error: '',
  });
};

export default notFound;
