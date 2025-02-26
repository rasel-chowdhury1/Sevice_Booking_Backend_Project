import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';


const parseData = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("date show from parseData =====>>> ",req.body)
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);
    }

    next();
  });
};


export default parseData;
