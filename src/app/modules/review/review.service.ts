import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import { IReview } from './review.interface';
import Review from './review.model';
import { createNotification } from '../notification/notification.utils';
// Create a new review
const createReview = async (reviewData: Partial<IReview>): Promise<IReview> => {


  // Check if review_id exists in User model
  const userExists = await User.findById(reviewData.review_id);
  if (!userExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User with this review_id does not exist',
    );
  }

  // Create and save the review
  const review = new Review(reviewData);
  const savedReview = await review.save();

  // Recalculate the average rating
  const reviews = await Review.find({ review_id: reviewData.review_id });
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  // Update the User model with the new rating and review count
  await User.findByIdAndUpdate(reviewData.review_id, {
    rating: parseFloat(averageRating.toFixed(1))});


  const notificationData = {
    user_id: reviewData.user_id as any,
    recipient_id: reviewData.review_id as any,
    type: "review",
    title: `${userExists.fullName} left you a ${reviewData.rating}-star review.`,
    message: `You received a new review from ${userExists.fullName}. Check it out!`
  }


  await createNotification(notificationData);
  


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
