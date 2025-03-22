import { Router } from "express";
import { settingsController } from "./setting.controller";

export const settingsRoutes = Router();


settingsRoutes
     // Route to get the privacy policy
    .get("/privacy", settingsController.getPrivacyPolicy)
    .get("/termAndConditions", settingsController.getTermConditions)
    .get("/aboutUs", settingsController.getAboutUs)
    // Route to create or update the privacy policy
    .put("/", settingsController.updateSettingsByKey);
