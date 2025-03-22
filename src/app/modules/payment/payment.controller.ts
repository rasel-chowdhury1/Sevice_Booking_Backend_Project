import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { PaymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import { createTestAccount } from 'nodemailer';

// Get all payments with optional filtering
export const getAllPayments = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sort: {} as Record<string, 1 | -1>,
  };

  const filter: Record<string, any> = {};

  // Filter by paymentStatus if provided
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  // Filter by paymentMethod if provided
  if (req.query.paymentType) {
    filter.paymentType = req.query.paymentType;
  }

  // Handle sorting dynamically
  const sortField = req.query.sortField as string; // Example: "amount", "createdAt"
  const sortOrder = req.query.sortOrder as string; // Example: "asc" or "desc"

  if (sortField) {
    options.sort[sortField] = sortOrder === 'asc' ? 1 : -1;
  } else {
    options.sort = { createdAt: -1 }; // Default sort by newest payments
  }

  const payments = await PaymentService.getPayments(filter, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments fetched successfully',
    data: payments,
  });
});

const getPaymentOverview = catchAsync(async (req, res) => {
    console.log("get all payment overviewo _>>>> ");
  
    // Default to the current year if the 'year' query parameter is not provided
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    // Ensure the year is valid
    if (isNaN(year)) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Invalid year parameter.',
        data: null,
      });
    }
  
    const result = await PaymentService.getPaymentOverview( year);
  
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'payment over view',
    });
  });

// Create a new payment
export const createPayment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const paymentData = req.body;

  const newPayment = await PaymentService.createPayment(paymentData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment created successfully',
    data: newPayment,
  });
});

export const paymentController= {
    getAllPayments,
    createPayment,
    getPaymentOverview
}
