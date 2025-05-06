import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constants';
import { eventController } from './event.controller';
import { eventValidation } from './event.validation';
const eventUpload = fileUpload('./public/uploads/events');

export const eventRoutes = Router();

// Create event route
eventRoutes.post(
  '/create',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  // verifyAccess(USER_ROLE.GUIDE),
  eventUpload.fields([
    { name: 'descriptionImage', maxCount: 1 }, // For the description Image
    { name: 'bannerImage', maxCount: 1 }, // For the event banner
    { name: 'coHostImages', maxCount: 10 }, // Up to 10 co-host images
  ]),
  parseData(),
  validateRequest(eventValidation.createEventZodValidationSchema),
  eventController.createEvent,
);

// Update event route
eventRoutes.patch(
  '/:eventId/update',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  // verifyAccess(USER_ROLE.GUIDE),
  eventUpload.fields([
    { name: 'descriptionImage', maxCount: 1 }, // For the updated description Image
    { name: 'bannerImage', maxCount: 1 }, // For the updated event banner
    { name: 'coHostImages', maxCount: 10 }, // Up to 10 co-host images
  ]),
  validateRequest(eventValidation.updateEventZodValidationSchema),
  eventController.updateEvent,
);

// Get all events by admin route
eventRoutes.get(
  '/all-events',
  auth(USER_ROLE.ADMIN),
  eventController.getAllEvents,
);

// Delete event route
eventRoutes.delete(
  '/delete/:eventId',
  // auth(USER_ROLE.ADMIN), // Only admin can delete events
  auth(USER_ROLE.GUIDE, USER_ROLE.SEEKER, USER_ROLE.ADMIN), // Only admin can delete events
  eventController.deleteEvent,
);

// Get nearest events
eventRoutes.get(
  '/nearest-events',
  auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE, USER_ROLE.ADMIN),
  eventController.getNearestEvents,
);

// Get features events
eventRoutes.get(
  '/features',
  auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE, USER_ROLE.ADMIN),
  eventController.getFeatureEventsForUser,
);

// Get upcoming events
eventRoutes.get(
  '/upcoming',
  auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE, USER_ROLE.ADMIN),
  eventController.getUpcomingEventsForUser,
);

// Get my events
eventRoutes.get(
  '/myEvent',
  auth(USER_ROLE.SEEKER, USER_ROLE.GUIDE, USER_ROLE.ADMIN),
  eventController.getMyCreatedEvents,
);

// Get specific event by ID route
eventRoutes.get(
  '/:eventId',
  auth(USER_ROLE.SEEKER, USER_ROLE.ADMIN, USER_ROLE.GUIDE),
  eventController.getEventById,
);
