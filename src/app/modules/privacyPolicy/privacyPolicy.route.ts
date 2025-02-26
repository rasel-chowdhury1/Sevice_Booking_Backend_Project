import { Router } from "express";
import { privacyPolicyController } from "./privacyPolicy.controller";

export const privacyPolicyRoutes = Router();

// Route to get the privacy policy
privacyPolicyRoutes.get("/", privacyPolicyController.getPrivacyPolicy);

// Route to create or update the privacy policy
privacyPolicyRoutes.put("/", privacyPolicyController.updatePrivacyPolicy);
