import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { storeFile } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { reviewService } from './review.service';

// Add a new review
const addReview = catchAsync(async (req: Request, res: Response) => {
  // console.log('====== req files data ======', req.files);
  console.log('====== req users data ======', req.user);
  console.log('====== req files data ======', req.file);
  req.body.user_id = req.user.userId;

  if (req.file) {
    try {
      // Handle the single uploaded file
      const filePath = storeFile('reviews', req.file.filename); // process a single file

      console.log('==== file path =====', filePath);

      // Set image (single file)
      if (filePath) {
        req.body.imageUrl = filePath; // Assign the single file path
      }

      console.log('body data =>>> ', req.body);
    } catch (error: any) {
      console.error('Error processing files:', error.message);
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to process uploaded files',
        data: null,
      });
    }
  }

  try {
    console.log('==== add review data ==== ', req.body);
    const result = await reviewService.createReview(req.body);
    // Send success response
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Reveiw added successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing event creation:', error.message);
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Failed to process review add...',
      data: null,
    });
  }
});

// Get reviews by user ID
const getReviewsByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await reviewService.getReviewsByUserId(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

// Get reviews by review ID
const getReviewsByReviewId = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const result = await reviewService.getReviewsByReviewId(reviewId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reveiw retrieved successfully',
    data: result,
  });
});

// Update a review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;
    const result = await reviewService.updateReviewById(
      { reviewId, userId },
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error processing booking update:', error.message);
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Failed to process review update',
      data: null,
    });
  }
});

// Delete a review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;

  await reviewService.deleteReviewById(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully!',
    data: null,
  });
});

export const reviewController = {
  addReview,
  getReviewsByUserId,
  getReviewsByReviewId,
  updateReview,
  deleteReview,
};
