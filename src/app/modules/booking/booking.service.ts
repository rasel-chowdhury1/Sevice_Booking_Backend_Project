import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IBooking, TBookingStatus } from './booking.interface';
import Booking from './booking.model';
// import retrievePayment from '../../utils/paypal';
import { createCheckoutSessionUsingPaypalForBooking, refundMoneyToUserAccount, sendMoneyToPaypalAccount } from './bookihgPayment.utils';
import Payment from '../payment/payment.model';
import { createNotification } from '../notification/notification.utils';
import { convertTo24HourFormat } from './booking.validation';
import { User } from '../user/user.models';
import Notification from '../notification/notification.model';
import { IWalletTransaction } from '../user/user.interface';
import { Schema } from 'mongoose';

const createBooking = async (bookingData: Partial<IBooking>) => {
  try {

    // Step 2: Create PayPal payment session before confirming booking
    
    // // Attempt to create the booking
    const newBooking = await Booking.create(bookingData);

    if (!newBooking) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create the booking.',
      );
    }

    return newBooking;
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error; // Re-throw the original error to handle it elsewhere
  }
};

const createPaymentByPaypalForBooking = async ( payload: any) => {
  const paymentResult = await createCheckoutSessionUsingPaypalForBooking(payload);

  return paymentResult;
}

// const confirmPaymentByPaypalForBooking = async (data: any) => {

//   console.log("data ____>>> ", data)
//    const { paymentId, token, PayerID, user_id, guide_id, booking_date, booking_time, total_price} = data;

//    if(!paymentId && !PayerID){
//     throw new AppError(httpStatus.BAD_REQUEST, "Missing paymentId or payerId")
//    }

//    let paymentData;

//    try {
//     const responseData = await retrievePayment(paymentId, PayerID);

//     if(responseData?.state !== 'approved'){
//       throw new AppError(400, "Payment not approved");
//     }

//     const isExistPaymentId = await Payment.findOne({
//       transactionId: paymentId
//     });
    
//     if(isExistPaymentId){
//       throw new AppError(httpStatus.BAD_REQUEST, "Payment id already use")
//     }
    
//     // Define commission percentage (e.g., 10% for admin)
//     const commissionPercentage = 10; // Change this as per your requirement

//     // Calculate commission and net amount
//     const commission = (total_price * commissionPercentage) / 100;
//     const netAmount = total_price - commission;

//     // Update user points
//     const UserData = await User.findByIdAndUpdate(user_id, { $inc: { points: 20 } }, { new: true });

//     const paymentDataBody = {
//       user_id,
//       guide_id,
//       amount: total_price,
//       commission,
//       netAmount,
//       paymentStatus: 'completed',
//       transactionId: paymentId,
//       paymentMethod: 'paypal'
//     }
    
//     paymentData = new Payment(paymentDataBody);
//     const result = await paymentData.save()

//     console.log("======== payment Data =====>>> ", result)

//     // Convert AM/PM format to 24-hour format before saving (if needed)
//     const formattedTime = convertTo24HourFormat(booking_time);

//     const newBooking = new Booking({
//       user_id,
//       guide_id,
//       booking_date,
//       booking_time: formattedTime,
//       status: "pending",
//       total_price,
//       commission,
//       seekerPaymentId: result._id
//     })

//     await newBooking.save()

//     // // Notification for the user
//     // const userNotification = {
//     //   user_id,
//     //   recipient_id: user_id,
//     //   type: "info",
//     //   title: `Booking Request Sent`,
//     //   message: `${UserData?.fullName} has successfully completed the payment for booking on ${booking_date} at ${booking_time}. Your booking is now pending confirmation.`,
//     // }

//     // await createNotification(userNotification)

//     // // Notification for the guide
//     // const guideNotification ={
//     //   user_id,
//     //   recipient_id: guide_id,
//     //   type: "info",
//     //   title: `New Booking Request`,
//     //   message: `You have received a new booking request from ${UserData?.fullName} for the date ${booking_date} at ${booking_time}. Please review the booking details.`,
//     // };
    
//     // await createNotification(guideNotification)

//     // Notifications
//     const notifications = [
//       {
//         user_id,
//         recipient_id: user_id,
//         type: "info",
//         title: "Booking Request Sent",
//         message: `${UserData?.fullName} successfully completed payment for a booking on ${booking_date} at ${formattedTime}. Your booking is now pending confirmation.`,
//       },
//       {
//         user_id,
//         recipient_id: guide_id,
//         type: "info",
//         title: "New Booking Request",
//         message: `You have received a new booking request from ${UserData?.fullName} for ${booking_date} at ${formattedTime}. Please review the booking details.`,
//       },
//     ];

//     await Promise.all(notifications.map(createNotification));

//     // Send notification to admin
//     const admin = await User.findOne({ role: 'admin' }); // Assuming you use a 'role' field to identify admins

//     if (admin) {
//       const adminNotificationData = {
//         user_id,
//         recipient_id: admin._id,
//         type: "info",
//         title: "New Booking Payment Confirmed",
//         message: `Payment for the booking made by ${UserData?.fullName} to guide ${guide_id} has been successfully completed. Please review the booking details.`,
//       };

//       await createNotification(adminNotificationData);
//     }
    
//     return paymentData;

//    } catch (error) {
//     console.error(error);
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong with the payment processing");
  
//    }
// }
const confirmPaymentForBooking = async (data: any) => {

  console.log("data ____>>> ", data)
   const { paymentId, user_id, guide_id, booking_date, booking_time, total_price, payment_method, booking_duration, duration_type} = data;

   let paymentData;

   try {

    const isExistPaymentId = await Payment.findOne({
      transactionId: paymentId
    });
    
    if(isExistPaymentId){
      throw new AppError(httpStatus.BAD_REQUEST, "Payment id already use")
    }
    
    // Check if there's an existing booking for the same user and guide with a conflicting status
    const existingBooking = await Booking.findOne({
      user_id,
      guide_id,
      status: { $in: ['pending', 'confirmed', 'inProgress', 'endRequest'] }
    });

    if (existingBooking) {
      throw new AppError(httpStatus.BAD_REQUEST, `You already have an active booking with this guide. Current status: ${existingBooking.status}`);
    }

    // Define commission percentage (e.g., 10% for admin)
    const commissionPercentage = 10; // Change this as per your requirement

    // Calculate commission and net amount
    const commission = (total_price * commissionPercentage) / 100;
    const netAmount = total_price - commission;

    // Update user points
    // const UserData = await User.findByIdAndUpdate(user_id, { $inc: { points: 20 } }, { new: true });


    const paymentDataBody = {
      user_id,
      guide_id,
      amount: total_price,
      commission,
      netAmount,
      paymentStatus: 'paid',
      transactionId: paymentId,
      paymentMethod: payment_method,
      paymentType: "booking"
    }
    
    paymentData = new Payment(paymentDataBody);
    const result = await paymentData.save()

    console.log("======== payment Data =====>>> ", result)

    // Convert AM/PM format to 24-hour format before saving (if needed)
    const formattedTime = convertTo24HourFormat(booking_time);

    const newBooking = new Booking({
      user_id,
      guide_id,
      booking_date,
      booking_time: formattedTime,
      status: "pending",
      total_price,
      commission,
      seekerPaymentId: result._id,
      booking_duration,
      duration_type
    })

    const bookingResult = await newBooking.save()


    const userData = await User.findById(user_id);
      if (userData) {

        // Create a new transaction for the withdrawal
        const transaction: IWalletTransaction = {
          type: 'payment',
          amount: total_price,
          referenceId: bookingResult._id as Schema.Types.ObjectId,  // Reference to the withdrawal request
          date: new Date(),
        };

        // Push the new transaction into the user's wallet transactions array
        userData.wallet.transactions.push(transaction);
        // Save only the wallet part of the user data to avoid triggering unnecessary validations
        await User.updateOne(
          { _id: userData._id },
          { 
            $push: { "wallet.transactions": transaction }
           }
        );

      }

    // // Notification for the user
    // const userNotification = {
    //   user_id,
    //   recipient_id: user_id,
    //   type: "info",
    //   title: `Booking Request Sent`,
    //   message: `${UserData?.fullName} has successfully completed the payment for booking on ${booking_date} at ${booking_time}. Your booking is now pending confirmation.`,
    // }

    // await createNotification(userNotification)

    // // Notification for the guide
    // const guideNotification ={
    //   user_id,
    //   recipient_id: guide_id,
    //   type: "info",
    //   title: `New Booking Request`,
    //   message: `You have received a new booking request from ${UserData?.fullName} for the date ${booking_date} at ${booking_time}. Please review the booking details.`,
    // };
    
    // await createNotification(guideNotification)

    // Notifications
    const notifications = [
      {
        user_id,
        recipient_id: user_id,
        type: "info",
        title: "Booking Request Sent",
        message: `${userData?.fullName} successfully completed payment for a booking on ${booking_date} at ${formattedTime}. Your booking is now pending confirmation.`,
      },
      {
        user_id,
        recipient_id: guide_id,
        type: "info",
        title: "New Booking Request",
        message: `You have received a new booking request from ${userData?.fullName} for ${booking_date} at ${formattedTime}. Please review the booking details.`,
      },
    ];

    await Promise.all(notifications.map(createNotification));

    // Send notification to admin
    const admin = await User.findOne({ role: 'admin' }); // Assuming you use a 'role' field to identify admins

    if (admin) {
      const adminNotificationData = {
        user_id,
        recipient_id: admin._id,
        type: "info",
        title: "New Booking Payment Confirmed",
        message: `Payment for the booking made by ${userData?.fullName} to guide ${guide_id} has been successfully completed. Please review the booking details.`,
      };

      await createNotification(adminNotificationData);
    }
    
    return paymentData;

   } catch (error) {
    console.error(error);
    const errMsg = (error instanceof Error) ? error.message : "Something went wrong with the payment processing";
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errMsg);
  
   }
}

const updateBooking = async (
  bookingId: string,
  updateData: Partial<IBooking>,
) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }, // Return the updated document and validate the fields
    );

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    return updatedBooking;
  } catch (error) {
    console.error('Booking update failed:', error);
    throw error;
  }
};

const updateBookingStatusByGuide = async (
  guideFullName: string,
  userId: string,
  bookingId: string,
  status: Partial<TBookingStatus>
) => {
  try {


    const isExistBooking = await Booking.findOne({_id: bookingId, guide_id: userId});
    console.log("====== is exist booking ==== ", isExistBooking);

    if(!isExistBooking){
        throw new AppError(httpStatus.BAD_REQUEST, "You can not update this booking...")
    }

    // Check if the booking status is already the same as the provided status
    if (isExistBooking.status === status) {
      throw new AppError(httpStatus.BAD_REQUEST, `The booking is already in the "${status}" status.`);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }, // Return the updated document and validate the fields
    );

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    // If status is 'cancelled', refund the money to the user account
    if (status === 'cancelled') {
      const paymentId = isExistBooking.seekerPaymentId; // Assuming paymentId is stored in the booking record
      await refundMoneyToUserAccount(bookingId, paymentId, isExistBooking.user_id); // Call the refund function
    }

    let notificationData = {
      user_id: userId,
      recipient_id: isExistBooking.user_id,
      type: "",
      title: "",
      message: "",
      data: ""
    };

    // Set the notification title and message based on status
    if (status === "confirmed") {
      notificationData.type = "success",
      notificationData.title = "Your booking is confirmed!";
      notificationData.message = `Your booking with guide ${guideFullName} has been successfully confirmed. Get ready for your upcoming session!`;
    } else if (status === "inProgress") {
      notificationData.type = "success",
      notificationData.title = "Your booking is starting...";
      notificationData.message = `Your booking with guide ${guideFullName} is now in progress. Enjoy your session!`;
    } else if (status === "endRequest") {
      notificationData.type = "endRequest",
      notificationData.title = "Your service booking has been requested to end!";
      notificationData.message = `${guideFullName} has requested to end the service. Please confirm if you want to end your booking with this guide. Thank you for your time!`;
      notificationData.data = `${bookingId}`
    }
    else if(status === 'cancelled'){
      notificationData.type = "refund",
      notificationData.title = "Your Booking has been Cancelled and Refund Processed";
      notificationData.message = `Your booking with guide ${guideFullName} has been cancelled. The refund for your session has been successfully processed and should reflect in your account shortly. Thank you for your understanding.`;
      notificationData.data = `${bookingId}`
    }
    

    await createNotification(notificationData)
    

    return updatedBooking;
  } catch (error) {
    console.error('Booking update failed:', error);
    throw error;
  }
};

const doneBookingStatusBySeeker = async (
  userFullName: string,
  userId: string,
  bookingId: string,
  notificationId: string
) => {
  try {

    const isExistBooking = await Booking.findOne({_id: bookingId, user_id: userId});
    console.log("====== is exist booking ==== ", isExistBooking);

    if(!isExistBooking){
        throw new AppError(httpStatus.BAD_REQUEST, "You can not update this booking...")
    }

    // Check if the booking status is already the same as the provided status
    if (isExistBooking.status === "done") {
      throw new AppError(httpStatus.BAD_REQUEST, `The booking is already in the done status.`);
    }

    // Fetch the payment record based on the seekerPaymentId
    const payment = await Payment.findOne({ _id: isExistBooking.seekerPaymentId });
    
    // Check if the payment status is 'completed'
    if (!payment || payment.paymentStatus !== "paid") {
      throw new AppError(httpStatus.BAD_REQUEST, "Payment is not paid yet.");
    }

    // Check if guide's PayPal email exists
    const userData = await User.findById(isExistBooking.guide_id);
    
    const transferAmount = payment.netAmount as number;

    if (userData) {
            userData.wallet.balance =  userData.wallet.balance + transferAmount;
    
            // Create a new transaction for the withdrawal
            const transaction: IWalletTransaction = {
              type: 'deposit',
              amount: transferAmount,
              referenceId: isExistBooking._id as Schema.Types.ObjectId,  // Reference to the withdrawal request
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

    // If the transfer is successful, update the payment status to 'paid'
    await Payment.findByIdAndUpdate(isExistBooking.seekerPaymentId, { paymentStatus: "completed" }, { new: true });

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "done" },
      { new: true, runValidators: true }, // Return the updated document and validate the fields
    );

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }




   
    await Notification.findByIdAndUpdate(notificationId, {type: "acceptEndRequest"}, {new: true});

    let notificationData = {
      user_id: userId,
      recipient_id: isExistBooking.guide_id,
      type: "success",
      title: "Your booking has been successfully completed!",
      message: `Thank you for your time with seeker ${userFullName}. The session has been successfully completed. We hope you both had a great experience!`,
      data: bookingId
    };


    await createNotification(notificationData)

    // Send notification to the admin about the completed booking
    const admin = await User.findOne({ role: 'admin' }); // Assuming you use a 'role' field to identify admins

    if (admin) {
      const adminNotificationData = {
        user_id: userId,
        recipient_id: admin._id,
        type: "info",
        title: "Booking Completed",
        message: `Booking by ${userFullName} for guide ${userData?.fullName} has been successfully completed. Please review the details.`,
        data: bookingId
      };

      await createNotification(adminNotificationData);
    }
    

    return updatedBooking;
  } catch (error) {
    console.error('Booking update failed:', error);
    throw error;
  }
};


// this function using for automatic payment to guide account using paypal ---->>>  start
// const doneBookingStatusBySeeker = async (
//   userFullName: string,
//   userId: string,
//   bookingId: string,
//   notificationId: string
// ) => {
//   try {

//     const isExistBooking = await Booking.findOne({_id: bookingId, user_id: userId});
//     console.log("====== is exist booking ==== ", isExistBooking);

//     if(!isExistBooking){
//         throw new AppError(httpStatus.BAD_REQUEST, "You can not update this booking...")
//     }

//     // Check if the booking status is already the same as the provided status
//     if (isExistBooking.status === "done") {
//       throw new AppError(httpStatus.BAD_REQUEST, `The booking is already in the done status.`);
//     }

//     // Fetch the payment record based on the seekerPaymentId
//     const payment = await Payment.findOne({ _id: isExistBooking.seekerPaymentId });
    
//     // Check if the payment status is 'completed'
//     if (!payment || payment.paymentStatus !== "completed") {
//       throw new AppError(httpStatus.BAD_REQUEST, "Payment is not completed yet.");
//     }

//     // Check if guide's PayPal email exists
//     const guide = await User.findById(isExistBooking.guide_id);

//     if (!guide || !guide.paypalEmail) {
//       // If PayPal email is missing, send a notification to the guide
//       const notificationData = {
//         user_id: userId,
//         recipient_id: isExistBooking.guide_id,
//         type: "warning",
//         title: "Missing PayPal Email",
//         message: `We noticed that your PayPal email is not updated. Please provide your PayPal email to receive payments.`,
//         data: bookingId
//       };
//       await createNotification(notificationData);

//       throw new AppError(httpStatus.BAD_REQUEST, "Guide's PayPal email is missing. Please update it.");
//     }
    
//     const transferAmount = payment.netAmount;

//     console.log(transferAmount,guide.paypalEmail)
    
//     const transfer = await sendMoneyToPaypalAccount(
//       transferAmount,
//       guide.paypalEmail.toString(), // Use the guide's PayPal email from the User model
//       {
//         //@ts-ignore
//         purchaseId: isExistBooking.seekerPaymentId.toString(),
//       }
//     );

//     console.log("==== transfer ===>>> ", transfer)

//     // If the transfer is successful, update the payment status to 'paid'
//     await Payment.findByIdAndUpdate(isExistBooking.seekerPaymentId, { paymentStatus: "paid" }, { new: true });

//     const updatedBooking = await Booking.findByIdAndUpdate(
//       bookingId,
//       { status: "done" },
//       { new: true, runValidators: true }, // Return the updated document and validate the fields
//     );

//     if (!updatedBooking) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
//     }




   
//     await Notification.findByIdAndUpdate(notificationId, {type: "acceptEndRequest"}, {new: true});

//     let notificationData = {
//       user_id: userId,
//       recipient_id: isExistBooking.guide_id,
//       type: "success",
//       title: "Your booking has been successfully completed!",
//       message: `Thank you for your time with seeker ${userFullName}. The session has been successfully completed. We hope you both had a great experience!`,
//       data: bookingId
//     };


//     await createNotification(notificationData)

//     // Send notification to the admin about the completed booking
//     const admin = await User.findOne({ role: 'admin' }); // Assuming you use a 'role' field to identify admins

//     if (admin) {
//       const adminNotificationData = {
//         user_id: userId,
//         recipient_id: admin._id,
//         type: "info",
//         title: "Booking Completed",
//         message: `Booking by ${userFullName} for guide ${guide._id} has been successfully completed. Please review the details.`,
//         data: bookingId
//       };

//       await createNotification(adminNotificationData);
//     }
    

//     return updatedBooking;
//   } catch (error) {
//     console.error('Booking update failed:', error);
//     throw error;
//   }
// };
// this function using for automatic payment to guide account using paypal ---->>> end
const getAllBookings = async (filters: any = {}, options: any = {}) => {
  try {
    const bookings = await Booking.find(filters)
      .sort(options.sort || {}) // Sorting based on options
      .limit(options.limit || 0) // Limit number of results
      .skip(options.skip || 0) // Skip for pagination
      .populate({ path: 'user_id', select: '-wallet' }) // Exclude wallet field
      .populate({ path: 'guide_id', select: '-wallet' }); // Exclude wallet field

    return bookings;
  } catch (error) {
    console.error('Failed to retrieve bookings:', error);
    throw error;
  }
};

const getBookingById = async (bookingId: string) => {
  try {
    const booking = await Booking.findById(bookingId).populate([
      { path: 'user_id', select: '-wallet' }, // Exclude wallet field from user_id
      { path: 'guide_id', select: '-wallet' }, // Exclude wallet field from guide_id
    ]);

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    return booking;
  } catch (error) {
    console.error('Failed to retrieve booking:', error);
    throw error;
  }
};

const getMyBookings = async (payload: {}, populate_Item: string) => {
  try {
    console.log({ payload });
    const booking = await Booking.find(payload).populate(
      populate_Item,
      'fullName location image address photos interests rating myFee',
    );

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    return booking;
  } catch (error) {
    console.error('Failed to retrieve booking:', error);
    throw error;
  }
};

const getBookingByUserId = async (userId: string) => {
  try {
    const booking = await Booking.find({ user_id: userId }).populate(
      'guide_id',
    );
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    return booking;
  } catch (error) {
    console.error('Failed to retrieve booking:', error);
    throw error;
  }
};

const getBookingByGuideId = async (guideId: string) => {
  try {
    const booking = await Booking.find({ guide_id: guideId });
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
    }

    return booking;
  } catch (error) {
    console.error('Failed to retrieve booking:', error);
    throw error;
  }
};

export const bookingService = {
  createBooking,
  updateBooking,
  updateBookingStatusByGuide,
  doneBookingStatusBySeeker,
  getAllBookings,
  getBookingById,
  getMyBookings,
  getBookingByUserId,
  getBookingByGuideId,
  createPaymentByPaypalForBooking,
  confirmPaymentForBooking
  // confirmPaymentByPaypalForBooking
};
