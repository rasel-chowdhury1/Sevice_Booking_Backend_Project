import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { IReview } from './review.interface';
import Review from './review.model';
import { createNotification } from '../notification/notification.utils';
// Create a new review
const createReview = async (reviewData: Partial<IReview>): Promise<IReview> => {
  console.log('========== review Data ======= ', reviewData);

  // Check if review_id exists in User model
  const userExists = await User.findOne({ _id: reviewData.review_id });
  if (!userExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User with this review_id does not exist',
    );
  }

  // Create and save the review
  const review = new Review(reviewData);
  const savedReview = await review.save();


  const notificationData = {
    user_id: reviewData.user_id as any,
    recipient_id: reviewData.review_id as any,
    type: "review",
    title: `${userExists.fullName} left you a ${reviewData.rating}-star review.`,
    message: `You received a new review from ${userExists.fullName}. Check it out!`
  }


  await createNotification(notificationData);
  
  console.log('======= saved review ======', savedReview);

  return savedReview;
};

// Get reviews by user ID
const getReviewsByUserId = async (userId: string): Promise<IReview[]> => {
  return await Review.find({ review_id: userId })
    .populate('user_id', 'image fullName address')
    .exec();
};

// Get reviews by review ID
const getReviewsByReviewId = async (reviewId: string): Promise<IReview[]> => {
  const result = await Review.find({ review_id: reviewId })
    .populate('user_id', 'image fullName address')
    .exec();
  console.log('====== result of review id === ', result);
  return result;
};

// Update a review by ID
const updateReviewById = async (
  payload: { reviewId: string; userId: string },
  updateData: Partial<IReview>,
): Promise<IReview | null> => {
  const result = await Review.findByIdAndUpdate(payload.reviewId, updateData, {
    new: true,
  });
  console.log({ result });
  return result;
};

// Delete a review by ID
const deleteReviewById = async (id: string): Promise<void> => {
  await Review.findByIdAndDelete(id).exec();
};

export const reviewService = {
  createReview,
  getReviewsByUserId,
  getReviewsByReviewId,
  updateReviewById,
  deleteReviewById,
};
