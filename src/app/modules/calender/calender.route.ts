import express from 'express';
import { calendarValidation } from './calender.validation';
import validateRequest from '../../middleware/validateRequest';
import { calendarController } from './calender.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

// Route to create a new calendar entry
router.post(
  '/addCalendar',
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.GUIDE,
    USER_ROLE.SEEKER
  ),
  validateRequest(calendarValidation.createCalendarEntryValidation),
  calendarController.createCalendarEvent
);

router.get(
    "/myCalender",
    auth(
        USER_ROLE.ADMIN,
        USER_ROLE.GUIDE,
        USER_ROLE.SEEKER
    ),
    calendarController.getCalendarEventByUserId
)

// Route to update an existing calendar entry
router.patch(
  '/:id',
  validateRequest(calendarValidation.updateCalendarEntryValidation),
  calendarController.updateCalendarEventStatus
);

export const calendarRoutes = router;