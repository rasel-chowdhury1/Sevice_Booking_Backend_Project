import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import Subcription from '../subscription/subcription.model';
import { SubcriptionPaymentService } from './subscriptionPayment.service';
import AppError from '../../error/AppError';
import { PaypalUtils } from '../../utils/paypal';



// paypal implement for payment === >>>>>> start -----

const createPaymentSubscriptionByPaypal = catchAsync( 
  async (req: Request, res: Response) => {
    // console.log('==== req user === >>>>> ', req.user);
    const { userId } = req.user;

    req.body._id = userId;

    const { _id, subcriptionId } = req.body;

    if (!_id || !subcriptionId) {
      throw new Error(
        'Invalid request body. userId and subcriptionId are required.',
      );
    }

    // Check if subsciption exists
    const isExist = await Subcription.findById(subcriptionId);

    if (!isExist) {
      throw new Error(`Subscription with ID ${subcriptionId} does not exist.`);
    }

    req.body.subcriptionName = isExist.name;
    req.body.amount = isExist.price;
    req.body.duration = isExist.duration;

    const {amount, duration} = req.body;


    console.log("+++++ req body data = >>> ", req.body);

    

    // Check if required fields are present
    if (!_id || !subcriptionId || !amount || !duration) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Missing required userId subcriptionId amount and duration of payment details.',
        data: null,
      });
    }

    
    const paymentResult = await SubcriptionPaymentService.createPaymentByPaypal(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Successfully Paypal payment instant',
        data:paymentResult,
      });

  },
);

const confirmPaymentByPaypal = catchAsync(async (req: Request, res: Response) => {
  console.log('====== before confirm payment ====>>> ', req.query);
  
  const { paymentId, userId, subcriptionId, amount, duration, token, PayerID } = req.query;

  const data = {
    paymentIntentId: paymentId,
    userId,
    subcriptionId,
    amount,
    duration,
    token,
    PayerID
  };

  const paymentResult = await SubcriptionPaymentService.confirmPaymentByPaypal(data) || "";

  if (paymentResult) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'thank you for payment',
      data: paymentResult,
    });
  }
});
// paypal implement for payment === >>>>>> end -----




// stripe implement for payment === >>>>>> start -----

// const createPaymentSubscription = catchAsync(
//   async (req: Request, res: Response) => {
//     console.log('==== req user === >>>>> ', req.user);
//     const { userId } = req.user;

//     req.body._id = userId;

//     const { _id, subcriptionId, amount } = req.body;
//     console.log('==== req body data =====>>>>>> ', {
//       _id,
//       subcriptionId,
//       amount,
//     });

//     if (!_id || !subcriptionId) {
//       console.log('=== this is if conditaions is exist ====>>>> ');
//       throw new Error(
//         'Invalid request body. userId and subcriptionId are required.',
//       );
//     }

//     // Check if subsciption exists
//     const isExist = await Subcription.findById(subcriptionId);

//     if (!isExist) {
//       throw new Error(`Subscription with ID ${subcriptionId} does not exist.`);
//     }

//     req.body.subcriptionName = isExist.name;
//     req.body.amount = isExist.price;
//     req.body.duration = isExist.duration;
//     console.log('=== is exist subcription ===>>>> ', isExist);
//     req.body.subsciptionData = isExist;

//     const paymentResult = await SubcriptionPaymentService.createPayment(
//       res,
//       req.body,
//     );

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'payment successfull',
//       data: paymentResult,
//     });
//   },
// );

// const confirmPayment = catchAsync(async (req: Request, res: Response) => {
//   console.log('====== before confirm payment ====>>> ', req.query);
  
//   const { paymentId, userId, subcriptionId, amount, duration } = req.query;

//   const data = {
//     paymentIntentId: paymentId,
//     userId,
//     subcriptionId,
//     amount,
//     duration,
//   };

//   const paymentResult = await SubcriptionPaymentService.confirmPayment(data);

//   if (paymentResult) {
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'thank you for payment',
//       data: paymentResult,
//     });
//   }
// });
// stripe implement for payment === >>>>>> end -----




export const SubcriptionPaymentController = {
  createPaymentSubscriptionByPaypal,
  confirmPaymentByPaypal,

   // stripe implement for payment start
  //  createPaymentSubscription,
  //  confirmPayment,
   // stripe implement for payment end 
  
};
