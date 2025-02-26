import { Router } from "express";
import { faqController } from "./faq.controller";

export const faqRoutes = Router();

// Route to get all FAQs
faqRoutes.get("/", faqController.getFAQs);

// Route to add a new FAQ
faqRoutes.post("/create", faqController.addFAQ);

// Route to update an FAQ by index
faqRoutes.patch("/:id", faqController.updateFAQ);

// Route to delete an FAQ by index
faqRoutes.delete("/:id", faqController.deleteFAQ);
