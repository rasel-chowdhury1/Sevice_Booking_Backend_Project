import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import MySubscription from '../mySubscription/mySubscription.model';
import { User } from '../user/user.models';
import SubscriptionPayment from './subscriptionPayment.model';
import retrievePayment from '../../utils/paypal';
import { createCheckoutSessionUsingPaypalForSubscription } from './subscriptionPayment.utils';
import Payment from '../payment/payment.model';
// import { createCheckoutSession, stripe } from './subscriptionPayment.utils';

const findPaymentData = async (paymentDataBody: any) => {
  const paymentData = await SubscriptionPayment.findOne({
    user: paymentDataBody.userId,
    paymentId: paymentDataBody.paymentId,
  });

  return paymentData;
};

const addPaymentData = async (paymentDataBody: any) => {
  var paymentData = await findPaymentData(paymentDataBody);
  if (paymentData) {
    throw new AppError(
      httpStatus.CONFLICT,
      'this payment-information already exists...',
    );
  }

  return 'payment data checking...';
  // paymentData = new PaymentData(paymentDataBody);
  // await paymentData.save();
  // return paymentData;
};

// =======  pay pal implement for payment start ===== 
const createPaymentByPaypal = async (payload: any) => {
  const result = await createCheckoutSessionUsingPaypalForSubscription(payload);
  return result;
};

const confirmPaymentByPaypal = async (data: any) => {

  const { userId, subcriptionId, amount, duration, paymentIntentId, PayerID } = data;

  if (!paymentIntentId && !PayerID) {
    // return res.status(400).json({ success: false, message: "Missing sessionId" });
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing paymentId or payerId ');
  }

  let paymentData;

  try {
    const responseData = await retrievePayment(paymentIntentId, PayerID);



    if (responseData?.state !== 'approved') {
      throw new AppError(400, 'Payment not approved');
    }

    const paymentDataBody = {
      paymentId: paymentIntentId,
      amount: Number(amount),
      subscription: subcriptionId,
      user: userId,
      paymentType: 'Paypal',
    };
  
    const isExistPaymentId = await SubscriptionPayment.findOne({
      paymentId: paymentIntentId,
    });
  
    if (isExistPaymentId) {
      // return res.status(400).json({ success: false, message: "Payment Intent not found" });
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment id already use');
    }
  


    paymentData = new SubscriptionPayment(paymentDataBody);
    await paymentData.save();

    const today = new Date();

    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + Number(duration));

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { isSubcription: true },
      { new: true },
    );

    if (!updateUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not exist');
    }

    const existingSubscription =
      (await MySubscription.findOne({ user: userId })) ?? false;

    if (existingSubscription) {
      existingSubscription.subscription = subcriptionId;
      existingSubscription.expiryDate = expiryDate;

      await existingSubscription.save();
    } else {
      const newSubscription = new MySubscription({
        user: userId,
        subscription: subcriptionId,
        expiryDate,
      });

      await newSubscription.save();
    }
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, error.message);
  }

  return paymentData;
};
// =======  pay pal implement for payment end ===== 


// ======= confirm payment start =====
const confirmPaymentSubcription = async(data: any) => {

  const { userId, subcriptionId, amount, duration, paymentIntentId, paymentMethod} = data;

  if (!paymentIntentId ) {
    // return res.status(400).json({ success: false, message: "Missing sessionId" });
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing paymentId ');
  }

  let paymentData;
  try {

    const paymentDataBody = {
      guide_id: userId,
      amount: Number(amount),
      commission: Number(amount),
      paymentStatus: "paid",
      transactionId: paymentIntentId,
      paymentMethod,
      subscription: subcriptionId,
      paymentType: "subscription"
    };
  
    const isExistPaymentId = await Payment.findOne({
      transactionId: paymentIntentId,
    });
  
    if (isExistPaymentId) {
      // return res.status(400).json({ success: false, message: "Payment Intent not found" });
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment id already use');
    }
  


    paymentData = new Payment(paymentDataBody);
    await paymentData.save();

    const today = new Date();

    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + Number(duration));

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { isSubcription: true, $inc: { points: 50 } },
      { new: true },
    );

    if (!updateUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not exist');
    }

    const existingSubscription =
      (await MySubscription.findOne({ user: userId })) ?? false;

    if (existingSubscription) {
      existingSubscription.subscription = subcriptionId;
      existingSubscription.expiryDate = expiryDate;

      await existingSubscription.save();
    } else {
      const newSubscription = new MySubscription({
        user: userId,
        subscription: subcriptionId,
        expiryDate,
      });

      await newSubscription.save();
    }
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, error.message);
  }

  return paymentData;
}

// ======= confirm payment end =======





// =======  stripe implement for payment start ===== 

// const createPayment = async (res: any, payload: any) => {
//   const result = await createCheckoutSession(res, payload);
//   return result;
// };

// const confirmPayment = async (data: any) => {
//   console.log('==== confirm payment data ===>>>>>n ', data);
//   const { userId, subcriptionId, amount, duration, paymentIntentId } = data;

//   if (!paymentIntentId) {
//     // return res.status(400).json({ success: false, message: "Missing sessionId" });
//     throw new AppError(httpStatus.BAD_REQUEST, 'Missing sessionId');
//   }

//   // Fetch session details from Stripe
//   const session = await stripe.checkout.sessions.retrieve(
//     paymentIntentId as string,
//   );

//   if (!session.payment_intent) {
//     // return res.status(400).json({ success: false, message: "Payment Intent not found" });
//     throw new AppError(httpStatus.BAD_REQUEST, 'Payment Intent not found');
//   }

//   const paymentDataBody = {
//     paymentId: session.payment_intent,
//     amount: Number(amount),
//     subscription: subcriptionId,
//     user: userId,
//     paymentType: 'Card',
//   };

//   const isExistPaymentId = await SubscriptionPayment.findOne({
//     paymentId: session.payment_intent,
//   });

//   if (isExistPaymentId) {
//     // return res.status(400).json({ success: false, message: "Payment Intent not found" });
//     throw new AppError(httpStatus.BAD_REQUEST, 'Payment id already use');
//   }

//   console.log('==== payment data body ===>>>> ', paymentDataBody);

//   let paymentData;

//   try {
//     paymentData = new SubscriptionPayment(paymentDataBody);
//     await paymentData.save();

//     const today = new Date();

//     const expiryDate = new Date(today);
//     expiryDate.setDate(today.getDate() + Number(duration));

//     const updateUser = await User.findByIdAndUpdate(
//       userId,
//       { isSubcription: true },
//       { new: true },
//     );

//     if (!updateUser) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'User not exist');
//     }

//     const existingSubscription =
//       (await MySubscription.findOne({ user: userId })) ?? false;

//     if (existingSubscription) {
//       existingSubscription.subscription = subcriptionId;
//       existingSubscription.expiryDate = expiryDate;

//       await existingSubscription.save();
//     } else {
//       const newSubscription = new MySubscription({
//         user: userId,
//         subscription: subcriptionId,
//         expiryDate,
//       });

//       await newSubscription.save();
//     }
//   } catch (error) {
//     console.error('Error in confirmPayment:', error);
//     throw new Error('Failed to process the payment and subscription.');
//   }

//   return paymentData;
// };

// =======  stripe implement for payment end ===== 



export const SubcriptionPaymentService = {
  addPaymentData,
  createPaymentByPaypal,
  confirmPaymentByPaypal,
  confirmPaymentSubcription
  
  //=== stripe start === 
  // createPayment,
  // confirmPayment,
  //=== stripe end === 
};
