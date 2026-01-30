import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { User } from '../user/user.models';
import { bookingService } from './booking.service';
import { TBookingStatus } from './booking.interface';
import Booking from './booking.model';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  req.body.user_id = req.user?.userId;

  try {
    // Check if user exists
    if (!req.body.user_id) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'User not found!',
        data: null,
      });
    }

    // Validate user role (should be 'seeker')
    if (req.user.role !== 'seeker') {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Only users with the 'seeker' role can create bookings.",
        data: null,
      });
    }

    // Fetch the guide from DB
    const guide = await User.findById(req.body.guide_id);
    if (!guide || guide.role !== 'guide') {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: guide
          ? "Only users with the 'guide' role can be selected as guides."
          : 'Guide not found!',
        data: null,
      });
    }

    req.body.guideName = guide?.fullName || "guide";

    // Check if the user has already booked this guide
    const existingBooking = await Booking.findOne({
      user_id: req.body.user_id,
      guide_id: req.body.guide_id,
      status: { $nin: ['cancelled', 'done'] },  // Excludes cancelled and done bookings
    });

    if (existingBooking) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'You have already booked this guide.',
        data: null,
      });
      return;
    }


    // Create booking
    // const result = await bookingService.createPaymentByPaypalForBooking(req.body);

    const result = await bookingService.confirmPaymentForBooking(req.body)



    // Send success response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Your payment was processed successfully.`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing booking creation:', error.message);
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Failed to process booking creation',
      data: null,
    });
  }
});

// const confirmPaymentByPaypalForBooking = catchAsync( async (req: Request, res: Response) => {
//   console.log("=== payemtn query --->>> ", req.query);
  
//   const { paymentId, token, PayerID, user_id, guide_id,amount, booking_date, booking_time} = req.query;

//   const data = {
//     paymentId,
//     token,
//     PayerID,
//     user_id,
//     guide_id,
//     booking_date,
//     booking_time,
//     total_price: Number(amount) 
//   }

//   console.log({data})

//   const paymentResult = await bookingService.confirmPaymentByPaypalForBooking(data);

//   if(paymentResult){
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Payment confirmed, booking created successfully",
//       data: paymentResult
//     })
//   }
// })

const confirmPaymentForBooking = catchAsync( async (req: Request, res: Response) => {

  const {userId, } = req.user;

  const { paymentId, guide_id,amount, booking_date, booking_time, payment_method, booking_duration, duration_type} = req.body;

 

  const data = {
    paymentId,
    user_id: userId,
    guide_id,
    booking_date,
    booking_time,
    total_price: Number(amount),
    booking_duration,
    duration_type,
    payment_method 
  }


  const paymentResult = await bookingService.confirmPaymentForBooking(data);

  if(paymentResult){
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment confirmed, booking created successfully",
      data: paymentResult
    })
  }
})

// Update a booking
const updateBooking = catchAsync(async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params; // Booking ID from request params
    const { status, ...rest } = req.body;
    const result = await bookingService.updateBooking(bookingId, rest);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Booking updated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing booking update:', error.message);
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Failed to process booking update',
      data: null,
    });
  }
});

// Update  a booking by status
const updatedBookingStatusByGuide = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { userId, fullName} = req.user;
      const { bookingId } = req.params; // Booking ID from request params
      const { status } = req.body;


      if(!TBookingStatus.includes(status)){
        sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "Please provide valid status like 'pending' | 'confirmed' | 'inProgress' | 'endRequest' | 'cancelEndRequest' | 'done' | 'cancelled' ",
          data: null,
        });
      }

      


      // Prevent 'cancelEndRequest' status for the guide
      if (status === 'cancelEndRequest') {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "As a guide, you are not allowed to cancel an 'endRequest'. Only seekers can cancel an end request.",
          data: null,
        });
      }

      // Prevent 'done' status for the guide
      if (status === 'done' ) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "As a guide, you cannot mark the booking as 'done'. Only seekers are allowed to mark it as 'done'.",
          data: null,
        });
      }



      const result = await bookingService.updateBookingStatusByGuide(
        fullName,
        userId,
        bookingId,
        status
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Booking has been successfully updated to '${result.status}`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error processing booking update:', error.message);
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
        data: null,
      });
    }
  },
);

// Update  a booking by status
const doneBookingBySeeker = catchAsync(
  async (req: Request, res: Response) => {
    try {


      const { userId, fullName} = req.user;
      const {notificationId} = req.body;
      const { bookingId } = req.params; 
      const result = await bookingService.doneBookingStatusBySeeker(fullName, userId, bookingId,notificationId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking done successfully',
        data: result,
      });
      
    } catch (error: any) {
      console.error('Error processing booking update:', error.message);
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
        data: null,
      });
    }
  },
);

// Get all bookings
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query; // Filters from query parameters
  const options = {
    sort: req.query.sort || {}, // Optional sorting
    limit: parseInt(req.query.limit as string, 10) || 0,
    skip: parseInt(req.query.skip as string, 10) || 0,
  };

  const result = await bookingService.getAllBookings(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

// Get a specific booking by ID
const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params; // Booking ID from request params
  const result = await bookingService.getBookingById(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

//Get my boookigs
const getMyBookings = catchAsync(async (req: Request, res: Response) => {


  if (!req.user || !req.user.userId) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated!',
      data: null,
    });
  }

  // Define the filter based on role
  let filter: any = {};
  let populate_Item: any = {};

  if (req.user.role === 'seeker') {
    filter = { user_id: req.user.userId };
    populate_Item = 'guide_id';
  } else if (req.user.role === 'guide') {
    filter = { guide_id: req.user.userId };
    populate_Item = 'user_id';
  } else {
    sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message:
        'Access denied! Only seekers and guide guides can retrieve bookings.',
      data: null,
    });
  }

  // Fetch bookings based on role filter
  const result = await bookingService.getMyBookings(filter, populate_Item);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

// Get a specific booking by user_id
const getBookingByUserId = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params; // Booking ID from request params
  const result = await bookingService.getBookingByUserId(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

// Get a specific booking by user_id
const getBookingByGuideId = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params; // Booking ID from request params
  const result = await bookingService.getBookingByGuideId(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

export const bookingController = {
  createBooking,
  updateBooking,
  updatedBookingStatusByGuide,
  doneBookingBySeeker,
  getAllBookings,
  getBookingById,
  getMyBookings,
  getBookingByUserId,
  getBookingByGuideId,
  confirmPaymentForBooking,
  // confirmPaymentByPaypalForBooking
};
