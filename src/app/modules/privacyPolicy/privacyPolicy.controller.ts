import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { privacyPolicyService } from "./privacyPolicy.service";

// Get the privacy policy
const getPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const policy = await privacyPolicyService.getPrivacyPolicy();
        if (!policy) {
            return sendResponse(res, {
                statusCode: httpStatus.NOT_FOUND,
                success: false,
                message: "Privacy policy not found",
                data: null,
            });
        }

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Privacy policy retrieved successfully",
            data: policy,
        });
    } catch (error: any) {
        console.error("Error retrieving privacy policy:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to retrieve privacy policy",
            data: null,
        });
    }
};

// Update the privacy policy
const updatePrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const updatedPolicy = await privacyPolicyService.updatePrivacyPolicy(content);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Privacy policy updated successfully",
            data: updatedPolicy,
        });
    } catch (error: any) {
        console.error("Error updating privacy policy:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to update privacy policy",
            data: null,
        });
    }
};

export const privacyPolicyController = {
    getPrivacyPolicy,
    updatePrivacyPolicy,
};
