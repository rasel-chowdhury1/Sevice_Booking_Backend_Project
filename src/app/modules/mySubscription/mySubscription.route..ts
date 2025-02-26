import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/:subsId', auth(USER_ROLE.GUIDE));
// router.get("/", isValidUser, getMySubscriptionDetails);
// router.get("/my_packages", isValidUser, myPackages);

export const mySubscription = router;
