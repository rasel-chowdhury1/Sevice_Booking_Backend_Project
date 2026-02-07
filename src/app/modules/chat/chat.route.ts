import { Router } from 'express';
import { chatController } from './chat.controller';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth'; 
import { USER_ROLE } from '../user/user.constants';
import { chatValidation } from './chat.validation';

const router = Router();

router.get(
  '/my-chat-list',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  chatController.getMyChatList,
);

router.get(
  "/online-user",
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  chatController.getOnlineUser
)


router.get(
  '/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  chatController.getMessageByChatId,
);

router.post(
  '/create',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  validateRequest(chatValidation.createChatValidation),
  chatController.createChat,
);

router.post(
  "/blocked/:chatId",
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  chatController.blockedChat
)

router.patch(
  '/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  validateRequest(chatValidation.createChatValidation),
  chatController.updateChat,
);

router.delete(
  '/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  chatController.deleteChat,
);



export const chatRoutes = router;