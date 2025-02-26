import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { faqService } from "./faq.service";

// Get all FAQs
const getFAQs = async (req: Request, res: Response) => {
    try {
        const searchQuery = req.query.search as string;
        const result = await faqService.getFAQs(searchQuery);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "FAQs retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error retrieving FAQs:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Failed to retrieve FAQs",
            data: null,
        });
    }
};

// Add multiple FAQs
const addFAQ = async (req: Request, res: Response) => {
    try {
        const faqs = req.body.faqs; // Expecting an array of { question, answer }

        if (!Array.isArray(faqs) || faqs.length === 0) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: "Invalid input. Expecting an array of FAQs.",
                data: null,
            });
        }

        const result = await faqService.addFAQ(faqs);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "FAQs added successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error adding FAQs:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Failed to add FAQs",
            data: null,
        });
    }
};

// Update an FAQ by index
const updateFAQ = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const result = await faqService.updateFAQ(id, question, answer);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "FAQ updated successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error updating FAQ:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Failed to update FAQ",
            data: null,
        });
    }
};

// Delete an FAQ by index
const deleteFAQ = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await faqService.deleteFAQ(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Delted FAQ successfully...",
            data: null,
        });
    } catch (error: any) {
        console.error("Error deleting FAQ:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "delete failed of faq",
            data: null,
        });
    }
};

export const faqController = {
    getFAQs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
};
