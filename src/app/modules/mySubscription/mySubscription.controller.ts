// import { Request,Response } from "express";
// import sendResponse from "../../utils/sendResponse";
// import MySubscription from "./mySubscription.model";
// import { mySubscriptionService } from "./mySubscription.service";
// import catchAsync from "../../utils/catchAsync";

// const getMySubscriptionDetails = catchAsync(async (req: Request, res: Response) => {
//   const subsList = await mySubscriptionService.getMySubscriptionDetail(req.user.userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "subscription-fetched",
//     data: subsList,
//   })
// });

// const purchasedSubscription = catchAsync(async (req: Request, res:Response) => {
//   const paymentDetails = req.body;
//   const userId = req.user.userId;
//   const subsId = req.params.subsId;
//   const subscription = await subscriptionModel.findById(subsId);

//   if (!subscription) {
//     sendResponse(res, {
//       statusCode: httpStatus.BAD_REQUEST,
//       success: false,
//       message: "PAYMENT_REQUIRED",
//       data: null
//     })
//   }

//   const paymentDataBody = { userId, paymentDetails };

//   const Invalidpayment = await findPaymentData(paymentDataBody);
//   if (Invalidpayment) {
//     return res
//       .status(httpStatus.PAYMENT_REQUIRED)
//       .json(
//         response({
//           statusCode: httpStatus.PAYMENT_REQUIRED,
//           message: req.t("your paymentId used for another purpose"),
//           status: "PAYMENT_REQUIRED",
//         })
//       );
//   } else {
//     const subsList = await addMySubscription(userId, subsId, paymentDetails);
//     const user = await getUserById(userId);

//     user.remainingDispatch = subsList.subscription.remainingDispatch;
//     user.save();
//     return res
//       .status(httpStatus.OK)
//       .json(
//         response({
//           statusCode: httpStatus.OK,
//           message: "purchase subscription successfull",
//           data: subsList,
//           status: "ok",
//         })
//       );
//   }
// });

// const deductSubscriptionBalance = async (user, deductionAmount) => {
//   if (!user) {
//     throw new Error("User not found");
//   }
//   if (user.remainingDispatch < deductionAmount) {
//     throw new Error("Insufficient subscription balance");
//   }
//   user.remainingDispatch -= deductionAmount;
//   await user.save();

//   return user.remainingDispatch;
// };

// // have to solve issue
// const myPackages = catchAsync(async (req, res) => {
//   const subsList = await MySubscription.find({
//     user: req.User._id,
//   }).populate("subscription");
//   return res
//     .status(httpStatus.OK)
//     .json(
//       response({
//         statusCode: httpStatus.OK,
//         message: "subscription-fetched",
//         data: subsList,
//         status: "OK",
//       })
//     );
// });

// export const mySubscriptionController = {
//   getMySubscriptionDetails,
//   purchasedSubscription,
//   deductSubscriptionBalance,
//   myPackages
// }
