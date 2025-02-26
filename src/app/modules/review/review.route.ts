import { Router } from "express";
import { reviewController } from "./review.controller";
import validateRequest from "../../middleware/validateRequest";
import { reviewValidation } from "./review.validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import fileUpload from "../../middleware/fileUpload";
import parseData from "../../middleware/parseData";
const upload = fileUpload('./public/uploads/reviews');

export const reviewRoutes = Router();

// Add a new review
reviewRoutes
    .post(
        "/",
        auth(
            USER_ROLE.ADMIN,
            USER_ROLE.GUIDE,
            USER_ROLE.SEEKER
        ),
        upload.single('photos'),
          
        parseData(),
        // validateRequest(reviewValidation.createReviewZodValidationSchema),
        reviewController.addReview
    );

// Get reviews for my reviews
reviewRoutes
   .get(
    "/myReview", 
    auth(
        USER_ROLE.ADMIN,
        USER_ROLE.GUIDE,
        USER_ROLE.SEEKER
    ),
    reviewController.getReviewsByUserId
);

// Get reviews for a review id
reviewRoutes
   .get(
    "/:reviewId", 
    auth(
        USER_ROLE.ADMIN,
        USER_ROLE.GUIDE,
        USER_ROLE.SEEKER
    ),
    reviewController.getReviewsByReviewId
);

// Update an existing review
reviewRoutes
    .patch(
     "/:reviewId", 
     auth(
        USER_ROLE.ADMIN,
        USER_ROLE.GUIDE,
        USER_ROLE.SEEKER
    ),
     validateRequest(reviewValidation.updateReviewZodValidationSchema),
     reviewController.updateReview
);

// Delete a review
reviewRoutes
   .delete(
    "/:eventId", 
    reviewController.deleteReview
);

