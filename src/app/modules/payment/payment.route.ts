import { Router } from "express";
import { paymentController } from "./payment.controller";


const router = Router();

// Get all payments
router.get('/', paymentController.getAllPayments);
router.get('/paymentOverview', paymentController.getPaymentOverview);

export const paymentRoutes =  router;
