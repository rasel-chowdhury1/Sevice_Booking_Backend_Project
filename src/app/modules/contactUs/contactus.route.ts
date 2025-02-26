import { Router } from "express";
import { ContactUsController } from "./contactUs.controller";

const router = Router();

router
  .get('/', ContactUsController.getContactUs)

  .patch(
    '/update', ContactUsController.updateContactUs
  );

export const ContactUsRoutes = router;
