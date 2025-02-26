import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';

// Create a new notification
const createNotification = async (req: Request, res: Response) => {
    try {
        const result = await notificationService.createNotification(req.body);
        // Send success response
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Notification created successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Error processing event creation:', error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Failed to process notification add...',
            data: null,
        });
    }
};

// Get notifications by recipient ID
const getNotificationsByRecipient = async (req: Request, res: Response) => {

    const {userId} = req.user;
    try {
        const result = await notificationService.getNotificationsByRecipientId(userId);
        // Send success response
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Notifications retrieved successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Error processing event creation:', error.message);
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Failed to process notifications retrieved...',
            data: null,
        });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;
        const result = await notificationService.markNotificationAsRead(notificationId);

        // Send success response
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Notifications retrieved successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a notification
const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;
        await notificationService.deleteNotificationById(notificationId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



export const notificationController = {
    createNotification,
    getNotificationsByRecipient,
    markNotificationAsRead,
    deleteNotification

}