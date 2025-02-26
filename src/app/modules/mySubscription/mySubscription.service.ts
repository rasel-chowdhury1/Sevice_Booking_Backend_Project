import AppError from '../../error/AppError';
import Subcription from '../subscription/subcription.model';
import SubscriptionPayment from '../subscriptionPayment/subscriptionPayment.model';
import MySubscription from './mySubscription.model';

const addMySubscription = async (
  userId: string,
  subsId: string,
  paymentDetails: any,
) => {
  const subscription = await Subcription.findById(subsId);

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  // Record payment
  const payment = new SubscriptionPayment({
    paymentId: paymentDetails.paymentId,
    amount: subscription.price,
    user: userId,
    subscription: subsId,
    paymentType: paymentDetails.paymentType,
  });
  await payment.save();

  // Update or create MySubscription
  let userSubscription = await getMySubscription(userId, subsId);

  if (userSubscription) {
    userSubscription.expiryDate = new Date(
      new Date().setMonth(new Date().getMonth() + subscription.duration),
    );
  } else {
    userSubscription = new MySubscription({
      user: userId,
      subscription: subsId,
      expiryDate: new Date(
        new Date().setMonth(new Date().getMonth() + subscription.duration),
      ),
    });
  }

  await userSubscription.save();

  return { payment, subscription: userSubscription };
};

const getMySubscriptionDetail = async (userId: string) => {
  return await MySubscription.findOne({
    user: userId,
    expiryDate: { $gte: new Date() },
  }).populate('subscription');
};

const getMySubscription = async (userId: string, subsId: string) => {
  return await MySubscription.findOne({
    user: userId,
    subscription: subsId,
    expiryDate: { $gte: new Date() },
  }).populate('subscription');
};

export const mySubscriptionService = {
  addMySubscription,
  getMySubscriptionDetail,
  getMySubscription,
};
