import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
import { bookingController } from './booking.controller';
import { bookingValidation } from './booking.validation';

export const bookingRoutes = Router();

// Create booking route
bookingRoutes.post(
  '/create',
  auth(USER_ROLE.SEEKER),
  validateRequest(bookingValidation.createBookingZodValidationSchema),
  bookingController.createBooking,
);

bookingRoutes.get(
  '/confirm-payment', 
  bookingController.confirmPaymentByPaypalForBooking
);

// Update booking data route start
bookingRoutes.patch(
  '/update/:bookingId',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  validateRequest(bookingValidation.updateBookingZodValidationSchema),
  bookingController.updateBooking,
);
// Update booking data route end

// Update booking data route start
bookingRoutes.patch(
  '/done/:bookingId',
  auth(USER_ROLE.SEEKER),
  bookingController.doneBookingBySeeker,
);
// Update booking data route end

// Update booking  by status route start
bookingRoutes.patch(
  '/statusUpdated/:bookingId',
  auth(
    USER_ROLE.GUIDE,
  ),
  bookingController.updatedBookingStatusByGuide,
);
// Update booking  by status route end

// Get all bookings route
bookingRoutes.get(
  '/',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  bookingController.getAllBookings,
);

// Get my bookings route
bookingRoutes.get(
  '/myBookings',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  bookingController.getMyBookings,
);

// Get specific booking by ID route
bookingRoutes.get(
  '/:bookingId',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  bookingController.getBookingById,
);
