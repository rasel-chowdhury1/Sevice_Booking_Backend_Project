import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse"; 
import { withdrawRequestService } from "./withdrawRequest.service";
import catchAsync from "../../utils/catchAsync";
import { User } from "../user/user.models";
import { createNotification } from "../notification/notification.utils";
import { IWalletTransaction } from "../user/user.interface";
import { Schema, Types } from "mongoose";
import { PaymentGateway, RequestStatus } from "./WithdrawRequest.interface";

// Add a new withdraw request
const addNewWithdrawRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {userId}  = req.user;

  req.body.user = userId;


  const withdrawRequestStatus = await withdrawRequestService.addWithdrawRequest(req.body);

  // Send notification to admin
  const message = `You have a new Withdraw request from ${req.body.userFullName}`;

  const AdminUser = await User.findOne({role: 'admin', isDeleted: false,
    isActive: true});

    if(AdminUser){
      const adminNotificationData = {
              user_id: userId,
              recipient_id: AdminUser?._id,
              type: "info",
              title: "Withdraw Request",
              message: message
            };
  
        await createNotification(adminNotificationData);
      }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'withdrawRequest-added',
    data: withdrawRequestStatus
  });


});

const editWithdrawRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user;  // Assuming you have the userId in the request object

  // Get the withdraw request by ID
  const existingWithRequest = await withdrawRequestService.getWithdrawRequestsById(req.params.id);

 

  // Check if the withdraw request exists
  if (!existingWithRequest) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'withdrawRequest-not-found',
      data: null
    });
  }


  if (existingWithRequest.status === "Approved" || existingWithRequest.status === "Rejected") {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Withdraw request cannot be updated after it is approved or rejected.",
      data: null
    });
  }

  // Check if the status is the same as the new status
  if (existingWithRequest.status === req.body.status) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'withdrawRequest-same-status',
      data: null
    });
  }

  // Update the status
  existingWithRequest.status = req.body.status;

  try {
    // Attempt to save the updated withdraw request
    await existingWithRequest.save();  // Mongoose instance's `save` method


    // If approved, deduct the amount from the wallet
    if (existingWithRequest.status === 'Approved') {
      const userData = await User.findById(existingWithRequest.user);
      if (userData) {
        userData.wallet.balance =  userData.wallet.balance - existingWithRequest.amount;

        // Create a new transaction for the withdrawal
        const transaction: IWalletTransaction = {
          type: 'withdrawal',
          amount: existingWithRequest.amount,
          referenceId: existingWithRequest._id as Schema.Types.ObjectId,  // Reference to the withdrawal request
          date: new Date(),
        };

        // Push the new transaction into the user's wallet transactions array
        userData.wallet.transactions.push(transaction);
        // Save only the wallet part of the user data to avoid triggering unnecessary validations
        await User.updateOne(
          { _id: userData._id },
          { 
            $set: { "wallet.balance": userData.wallet.balance },
            $push: { "wallet.transactions": transaction }
           }
          
        );

      }



      // Send notification to admin
      const message = `Your Withdraw request of $${existingWithRequest.amount} has been approved`;

        const adminNotificationData = {
          user_id: userId,
          recipient_id: existingWithRequest.user.toString(),
          type: 'info',
          title: 'Withdraw Successful',
          message
        };

        await createNotification(adminNotificationData);

    } else {
      // Send notification to user about rejection
      const message = `Your Withdraw request of $${existingWithRequest.amount} has been rejected`;
        const adminNotificationData = {
          user_id: userId,
          recipient_id: existingWithRequest.user.toString(),
          type: 'info',
          title: 'Withdraw Rejected',
          message
        };

        await createNotification(adminNotificationData);
    }

    // Return success response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'withdrawRequest-updated',
      data: existingWithRequest
    });

  } catch (error: any) {
    // Handle possible errors during saving
    console.error('Error saving withdraw request:', error.message);
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'withdrawRequest-save-failed',
      data: null
    });
  }
});

// Get all withdraw requests
const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  let filter: Record<string, any> = {};

  // Filtering by RequestStatus
  if (req.query.status && Object.values(RequestStatus).includes(req.query.status as RequestStatus)) {
    filter.status = req.query.status;
  }

  // Filtering by PaymentGateway
  if (req.query.paymentGateway && Object.values(PaymentGateway).includes(req.query.paymentGateway as PaymentGateway)) {
    filter.paymentGateway = req.query.paymentGateway;
  }

  // if (req.body.userRole === 'user') {
  //   filter.user = req.body.userId;
  // }

  // filter.user = req.user.userId;

  const withdrawRequests = await withdrawRequestService.getWithdrawRequests(filter, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'withdrawRequest-list',
    data: withdrawRequests
  });
});

// Get all withdraw requests
const getSpeceifcUserWithdrawRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  let filter: Record<string, any> = {};

  // if (req.body.userRole === 'user') {
  //   filter.user = req.body.userId;
  // }

  filter.user = req.user.userId;

  const withdrawRequests = await withdrawRequestService.getSpeceficUserWithdrawRequests(filter, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'withdrawRequest-list',
    data: withdrawRequests
  });
});

export const withdrawRequestController = { addNewWithdrawRequests, editWithdrawRequests, getAllWithdrawRequests , getSpeceifcUserWithdrawRequests};
