import { Router } from "express";
import { getStaticAccountDeletePolicy } from "./accountDeletePolicy";


const router = Router();

// router.get("/privacy-policy", getStaticPrivacyPolicyPage)
// .get("/support", getStaticSupportPage)
router.get("/delete-account", getStaticAccountDeletePolicy);

export const staticPagesRoutes = router;