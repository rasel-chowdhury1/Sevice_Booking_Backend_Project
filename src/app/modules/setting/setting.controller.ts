import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { settingsService } from "./settting.service";

// Get the privacy policy
const getPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const policy = await settingsService.getSettingsByKey({key: "privacy_policy"});

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Privacy policy retrieved successfully",
            data: policy || null,
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

// Get the term conditions
const getTermConditions = async (req: Request, res: Response) => {
    try {
        const policy = await settingsService.getSettingsByKey({key: "term_condition"});

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Term and conditions retrieved successfully",
            data: policy || null,
        });
    } catch (error: any) {
        console.error("Error retrieving privacy policy:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to retrieve term and conditions",
            data: null,
        });
    }
};

// Get the term conditions
const getAboutUs = async (req: Request, res: Response) => {
    try {
        const policy = await settingsService.getSettingsByKey({key: "about_us"});

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "About us retrieved successfully",
            data: policy || null,
        });
    } catch (error: any) {
        console.error("Error retrieving privacy policy:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Failed to retrieve about us",
            data: null,
        });
    }
};

// Update the privacy policy
const updateSettingsByKey = async (req: Request, res: Response) => {
    try {
        const { key, content } = req.body;
        const updatedPolicy = await settingsService.updateSettingsByKey(key, content);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: `${key}  updated successfully`,
            data: updatedPolicy,
        });
    } catch (error: any) {
        console.error("Error updating privacy policy:", error.message);
        sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: `Failed to update settings`,
            data: null,
        });
    }
};

export const settingsController = {
    getPrivacyPolicy,
    getTermConditions,
    getAboutUs,
    updateSettingsByKey
};
