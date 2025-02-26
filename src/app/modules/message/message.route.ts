import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import parseData from '../../middleware/parseData';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants'; 
import fileUpload from '../../middleware/fileUpload';
import { messagesValidation } from './message.validation';
import { messagesController } from './message.controller';
const upload = fileUpload('./public/uploads/messages');

const router = Router();
// const storage = memoryStorage();
// const upload = multer({ storage });

router.post(
  '/send-messages',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  upload.single('image'),
  parseData(),
  validateRequest(messagesValidation.sendMessageValidation),
  messagesController.createMessages,
);

router.post(
  '/uploadImage',
  // auth(
  //   USER_ROLE.ADMIN,  
  //   USER_ROLE.SEEKER,
  //   USER_ROLE.GUIDE
  // ),
  upload.single('image'),
  messagesController.uploadImageForMessage
);

router.patch(
  '/seen/:chatId',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),

  messagesController.seenMessage,
);

router.patch(
  '/update/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  upload.single('image'),
  parseData(),
  validateRequest(messagesValidation.updateMessageValidation),
  messagesController.updateMessages,
);

router.get('/my-messages/:chatId', messagesController.getMessagesByChatId);

router.delete(
  '/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  messagesController.deleteMessages,
);

router.get(
  '/:id',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  messagesController.getMessagesById,
);

router.get(
  '/',
  auth(
    USER_ROLE.ADMIN,  
    USER_ROLE.SEEKER,
    USER_ROLE.GUIDE
  ),
  messagesController.getAllMessages,
);

export const messagesRoutes = router;