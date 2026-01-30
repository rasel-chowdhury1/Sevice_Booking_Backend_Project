import Subcription from "./subcription.model";
import { ISubscription } from "./subscription.interface";
import AppError from '../../error/AppError';

const getSubscriptionByNamePriceAndDuration = async (subscriptionBody: ISubscription) => {
    return await Subcription.findOne({
      $and: [
        { name: subscriptionBody.name },
        { price: subscriptionBody.price },
        { duration: subscriptionBody.duration },
        { created: subscriptionBody.created },
      ],
    });
  };

// Register a new subcription
const addSubscription = async (payload: ISubscription) => {
    // payload will be {created, name, price, month, features}

    let oldSubs = await getSubscriptionByNamePriceAndDuration(payload);

    if (oldSubs) {
        throw new AppError(httpStatus.CONFLICT, "Subscription already exists");
    }

    const newSubs = new Subcription(payload);
    return await newSubs.save();

};

const updateSubscription = async (subId: string, updateData: Partial<ISubscription>) => {

    const result = await Subcription.findByIdAndUpdate(subId,updateData, {new: true})
    if (!result) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update the subscription');
      }
    return result;
}

const deleteSubscription = async (subId: string) => {

    const result = await Subcription.findByIdAndUpdate(subId,{isDeleted: true}, {new: true})
    if (!result) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete the subscription');
      }
    return result;
}

const getAllSubscription = async () => {

    const result = await Subcription.find({isDeleted: false})
    return result;
}


export const subscriptionService = {
    addSubscription,
    getAllSubscription,
    updateSubscription,
    deleteSubscription
}